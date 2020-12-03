const NotifiedClass = require("../models/notified-class");
const HttpError = require("../models/http-error");
const HttpStatusCode = require("./http-status-code");

const recordNotifiedClasses = async (
  classesInfoToNotificationRecord,
  userId
) => {
  classesInfoToNotificationRecord.forEach(async (classDescription) => {
    const notifiedClass = new NotifiedClass({
      userId,
      notificationDate: new Date(),
      classDescription,
    });
    try {
      await notifiedClass.save();
    } catch (error) {
      throw new HttpError(
        error.message || RECORD_NOTIFICATION_ERROR,
        error.status || HttpStatusCode.INTERNAL_SERVER_ERROR
      );
    }
  });
};

module.exports = recordNotifiedClasses;