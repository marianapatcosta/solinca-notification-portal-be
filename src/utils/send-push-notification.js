const { Expo } = require('expo-server-sdk')
const logger = require("./logger");
const recordNotifiedClasses = require("./record-notified-classes");
const {
  SEND_PUSH_NOTIFICATION_ERROR,
  SEND_PUSH_NOTIFICATION_SUCCESS,
} = require("./constants");

const expo = new Expo();

const sendAvailableClassesPushNotification = async (
  userId,
  expoPushToken, 
  classesInfoToNotify,
  classesInfoToNotificationRecord
) => {
  // Check that all your push tokens appear to be valid Expo push tokens
  if (!Expo.isExpoPushToken(expoPushToken)) {
    logger.error(`Push token ${expoPushToken} is not a valid Expo push token`);
  }
  // try {
  //     await axios.post('https://exp.host/--/api/v2/push/send', 
  //     JSON.stringify({
  //       to: expoPushToken,
  //       data: { extraData: 'Some data' },
  //       title: 'Sent via the app',
  //       body: 'This push notification was sent by the app!',
  //       autoDismiss: false,
  //       sticky: true,
  //     }), {
  //       headers: {
  //         Accept: 'application/json',
  //         'Accept-Encoding': 'gzip, deflate',
  //         'Content-Type': 'application/json',
  //       },
  //     }
  //   )
  //   logger.info(SEND_PUSH_NOTIFICATION_SUCCESS(expoPushToken));
  // } catch (error) {
  //   logger.error(SEND_PUSH_NOTIFICATION_ERROR(expoPushToken, error));
  // }
  
  const messages = []
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Exercite-se!',
    priority: 'high',
    body: getPushNotificationText(classesInfoToNotify),
    data: { classes: classesInfoToNotify }
  }
  messages.push(message)
  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  try {
      (async () => {
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
        logger.info(SEND_PUSH_NOTIFICATION_SUCCESS(expoPushToken));
      } catch (error) {
        logger.error(SEND_PUSH_NOTIFICATION_ERROR(expoPushToken, error));
      }
    }
  })();
  await recordNotifiedClasses(classesInfoToNotificationRecord, userId);
  } catch (error) {
    logger.error(SEND_PUSH_NOTIFICATION_ERROR(expoPushToken, error));
  }
};

const getPushNotificationText = (classesInfo) => {
  let textMessage = "Tem aulas disponíveis para marcação no Solinca";
  classesInfo.forEach(({ club, classesDetails }) => {
    textMessage += `\n${club}\n`;
    classesDetails.forEach(
      (classDetail) => (textMessage += `${classDetail}\n`)
    );
  });
  return textMessage;
};

module.exports = sendAvailableClassesPushNotification;
