const twilio = require("twilio");
const logger = require("./logger");
const recordNotifiedClasses = require("./record-notified-classes");
const {
  SEND_WHATSAPP_MESSAGE_ERROR,
  SEND_WHATSAPP_MESSAGE_SUCCESS,
} = require("./constants");

const sendAvailableClassesWhatsAppMessage = async (phoneNumber, classes) => {
  try {
    const client = twilio();
    const textMessage = getWhatsAppMessageText(classes);
    const response = await client.messages.create({
      from: `whatsapp:${process.env.SENDER_PHONE_NUMBER}`,
      to: `whatsapp:${phoneNumber}`,
      body: textMessage,
    });

    logger.info(SEND_WHATSAPP_MESSAGE_SUCCESS(phoneNumber, response.sid));
    await recordNotifiedClasses(classesInfoToNotificationRecord, userId);
  } catch (error) {
    logger.error(SEND_WHATSAPP_MESSAGE_ERROR(phoneNumber, error));
  }
};

const getWhatsAppMessageText = (classesInfo) => {
  let textMessage = "Tem aulas disponíveis para marcação: \n";
  classesInfo.forEach(({ club, classesDetails }) => {
    textMessage += `\n*${club}*\n`;
    classesDetails.forEach(
      (classDetail) => (textMessage += `_${classDetail}_\n`)
    );
  });
  return textMessage;
};

module.exports = sendAvailableClassesWhatsAppMessage;
