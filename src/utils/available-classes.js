const axios = require("axios");
const HttpError = require("../models/http-error");
const NotifiedClass = require("../models/notified-class");
const logger = require("./logger");
const HttpStatusCode = require("./http-status-code");
const {
  AVAILABLE_CLASSES_URL,
  AVAILABLE_OPEN_AIR_CLASSES_URL,
  CLASSES_GET_ERROR,
  NOTIFICATION_TYPES,
} = require("./constants");
const sendAvailableClassesEmail = require("./send-available-classes-email");
const sendAvailableClassesPushNotification = require("./send-push-notification");
const getUserById = require("./get-user");
const solincaAuth = require("./solinca-auth");
const findAvailableClassesToWatch = require("./available-selected-classes");
const sendAvailableClassesWhatsAppMessage = require("./send-whatsapp-message");
const findOtherAvailableClasses = require("./other-available-classes");

const availableClasses = async (
  userId,
  isOpenAir = false,
  userInfo = null,
  calledByWatcher = false,
) => {
  const today = (new Date()).toISOString().split("T")[0];
  let tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow = tomorrow.toISOString().split("T")[0];

  try {
    const user =
      userInfo ||
      (await getUserById(userId, "-password -solincaAuth", CLASSES_GET_ERROR));
    const {
      username,
      email,
      expoPushToken,
      phoneNumber,
      selectedClubs,
      selectedOpenAirClubs,
      classesToWatch,
      solincaAuthToken,
      notificationTypes,
      isNotificationRepeatOn
    } = user;

    const clubsToCheck = isOpenAir ? selectedOpenAirClubs : selectedClubs;
    const classesUrl = isOpenAir ?  AVAILABLE_OPEN_AIR_CLASSES_URL :  AVAILABLE_CLASSES_URL

    if (!clubsToCheck.length || (!classesToWatch.length && calledByWatcher)) {
      return {
        matchedClasses: [],
        otherClasses: [],
      };
    }

    const urlsPerClub = clubsToCheck.map(({ id, brand, name }) => ({
      club: name,
      urls: [
        classesUrl(id, brand, today, today),
        classesUrl(id, brand, tomorrow, tomorrow),
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
    const matchedClasses = findAvailableClassesToWatch(
      classesToWatch,
      availableClassesPerClub
    );

    if (!calledByWatcher) {
      return {
        matchedClasses,
        otherClasses: findOtherAvailableClasses(
          classesToWatch,
          availableClassesPerClub
        ),
      };
    }

    if (matchedClasses.length > 0 && calledByWatcher) {
      const notifiedClasses = isNotificationRepeatOn ? [] : await getNotifiedClasses(userId);
      const classesInfoToNotify = getClassesInfoForMessageSent(
        matchedClasses,
        notifiedClasses,
        isOpenAir
      );
      const classesInfoToNotificationRecord = getClassesForNotificationRecord(
        matchedClasses,
        notifiedClasses,
        isOpenAir
      );

      if (!areThereClassesToNotify(classesInfoToNotify)) return;

      if (expoPushToken) {
        sendAvailableClassesPushNotification(
          userId,
          expoPushToken,
          classesInfoToNotify,
          classesInfoToNotificationRecord
        );
      }

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
          userId,
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

const getClassesInfoForMessageSent = (classes, notifiedClasses, isOpenAir = false) => {
  return classes.map(({ club, today, tomorrow }) => {
    const classesDetails = [
      ...today
        .filter(({ description }) => !notifiedClasses.includes(isOpenAir ? `Open Air - ${description}` : description))
        .map(({ description }) => `Hoje ${description.split(/- (.+)/)[1] || description}`),
      ...tomorrow
        .filter(({ description }) => !notifiedClasses.includes(isOpenAir ? `Open Air - ${description}` : description))
        .map(({ description }) => `Amanhã ${description.split(/- (.+)/)[1] || description}`),
    ];
    return {
      club: isOpenAir ? `Open Air - ${club}` : club,
      classesDetails,
    };
  });
};

const getClassesForNotificationRecord = (classes, notifiedClasses, isOpenAir = false) => {
  return classes
    .map(({ today, tomorrow }) => {
      return [
        ...today
          .filter(({ description }) => !notifiedClasses.includes(description))
          .map(({ description }) => isOpenAir ? `Open Air - ${description}` : description),
        ...tomorrow
          .filter(({ description }) => !notifiedClasses.includes(description))
          .map(({ description }) => isOpenAir ? `Open Air - ${description}` : description),

      ];
    })
    .flat();
};

const getNotifiedClasses = async (userId) => {
  let notifiedClasses;
  try {
    notifiedClasses = await NotifiedClass.find(
      {
        userId,
        notificationDate: {
          // subtracts process.env.NOTIFIED_CLASSES_TIME_IN_MINUTES to current time to get classes notified at less than 3h ago
          $gt: new Date(
            new Date().getTime() -
              process.env.NOTIFIED_CLASSES_TIME_IN_MINUTES * 60000
          ),
        },
      },
      "classDescription"
    );

    return notifiedClasses.map(({ classDescription }) => classDescription);
  } catch (error) {
    throw new HttpError(error, HttpStatusCode.INTERNAL_SERVER_ERROR);
  }
};

const areThereClassesToNotify = (classes) =>
  classes.some(({ classesDetails }) => classesDetails.length > 0);

module.exports = availableClasses;
