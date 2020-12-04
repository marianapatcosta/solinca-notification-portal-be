const axios = require("axios");
const HttpError = require("../models/http-error");
const NotifiedClass = require("../models/notified-class");
const logger = require("./logger");
const HttpStatusCode = require("./http-status-code");
const dateFormatter = require("./date-formatter");
const {
  AVAILABLE_CLASSES_URL,
  CLASSES_GET_ERROR,
  NOTIFICATION_TYPES,
} = require("./constants");
const sendAvailableClassesEmail = require("./send-available-classes-email");
const getUserById = require("./get-user");
const solincaAuth = require("./solinca-auth");
const findAvailableClassesToTrack = require("./available-selected-classes");
const sendAvailableClassesWhatsAppMessage = require("./send-whatsapp-message");
const findOtherAvailableClasses = require("./other-available-classes");

const availableClasses = async (
  userId,
  userInfo = null,
  calledByWatcher = false
) => {
  const newDate = new Date();
  const today = dateFormatter(newDate);
  const tomorrow = dateFormatter(newDate.setDate(newDate.getDate() + 1));
  console.log('new date', new Date(), today)

  try {
    const user =
      userInfo ||
      (await getUserById(userId, "-password -solincaAuth", CLASSES_GET_ERROR));
    const {
      username,
      email,
      phoneNumber,
      selectedClubs,
      classesToTrack,
      solincaAuthToken,
      notificationTypes,
    } = user;

    if (!selectedClubs.length || !classesToTrack.length) {
      return {
        matchedClasses: [],
        otherClasses: [],
      };
    }

    const urlsPerClub = selectedClubs.map(({ id, brand, name }) => ({
      club: name,
      urls: [
        AVAILABLE_CLASSES_URL(id, brand, today, today),
        AVAILABLE_CLASSES_URL(id, brand, tomorrow, tomorrow),
      ],
    }));

    const availableClassesPerClub = [];
    for (const urls of urlsPerClub) {
      const [today, tomorrow] = await Promise.all(
        urls.urls.map(async (url) => {
          const response = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${solincaAuthToken}`,
            },
          });
          return response.data.slots;
        })
      );
      const availableClasses = {
        club: urls.club,
        today,
        tomorrow,
      };
      availableClassesPerClub.push(availableClasses);
    }
    const matchedClasses = findAvailableClassesToTrack(
      classesToTrack,
      availableClassesPerClub
    );

    if (!calledByWatcher) {
      return {
        matchedClasses,
        otherClasses: findOtherAvailableClasses(
          classesToTrack,
          availableClassesPerClub
        ),
      };
    }

    if (matchedClasses.length > 0 && calledByWatcher) {
      const notifiedClasses = await getNotifiedClasses(userId);
      const classesInfoToNotify = getClassesInfoForMessageSent(
        matchedClasses,
        notifiedClasses
      );
      const classesInfoToNotificationRecord = getClassesForNotificationRecord(
        matchedClasses,
        notifiedClasses
      );

      if (!areClassesToNotify(classesInfoToNotify)) return;

      if (notificationTypes.includes(NOTIFICATION_TYPES[0])) {
        sendAvailableClassesEmail(
          userId,
          username,
          email,
          classesInfoToNotify,
          classesInfoToNotificationRecord
        );
      }

      if (notificationTypes.includes(NOTIFICATION_TYPES[1])) {
        sendAvailableClassesWhatsAppMessage(
          phoneNumber,
          classesInfoToNotify,
          classesInfoToNotificationRecord
        );
      }

      return;
    }
  } catch (error) {
    logger.error(`Failed to fetch available classes - ${error}`);
    if (error.response.status === 401) {
      await solincaAuth(userId);
      await availableClasses(userId);
    }
    throw new HttpError(
      error.message || CONNECTION_ERROR("solinca"),
      error.status || HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }
};

const getClassesInfoForMessageSent = (classes, notifiedClasses) => {
  return classes.map(({ club, today, tomorrow }) => {
    const classesDetails = [
      ...today
        .filter(({ description }) => !notifiedClasses.includes(description))
        .map(({ description }) => `Hoje ${description.split(/- (.+)/)[1]}`),
      ...tomorrow
        .filter(({ description }) => !notifiedClasses.includes(description))
        .map(({ description }) => `Amanhã ${description.split(/- (.+)/)[1]}`),
    ];
    return {
      club,
      classesDetails,
    };
  });
};

const getClassesForNotificationRecord = (classes, notifiedClasses) => {
  return classes
    .map(({ today, tomorrow }) => {
      return [
        ...today
          .filter(({ description }) => !notifiedClasses.includes(description))
          .map(({ description }) => description),
        ...tomorrow
          .filter(({ description }) => !notifiedClasses.includes(description))
          .map(({ description }) => description),
      ];
    })
    .flat();
};

const getNotifiedClasses = async (userId) => {
  let notifiedClasses;
  console.log('date notified classes', new Date(new Date().getTime() - process.env.NOTIFIED_CLASSES_TIME_IN_MINUTES * 60000))
  try {
    notifiedClasses = await NotifiedClass.find(
      {
        userId,
        notificationDate: {
          // subtracts process.env.NOTIFIED_CLASSES_TIME_IN_MINUTES to current time to get classes notified at less than 3h ago
          $gt: new Date(new Date().getTime() - process.env.NOTIFIED_CLASSES_TIME_IN_MINUTES * 60000),
        },
      },
      "classDescription"
    );
   
    return notifiedClasses.map(({ classDescription }) => classDescription);
  } catch (error) {
    throw new HttpError(error, HttpStatusCode.INTERNAL_SERVER_ERROR);
  }
};

const areClassesToNotify = (classes) =>
  classes.some(({ classesDetails }) => classesDetails.length > 0);

module.exports = availableClasses;
