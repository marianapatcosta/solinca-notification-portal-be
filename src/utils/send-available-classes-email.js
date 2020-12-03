const sgMail = require("@sendgrid/mail");
const hbs = require("hbs");
const fs = require("fs");
const path = require("path");
const logger = require("./logger");
const recordNotifiedClasses = require("./record-notified-classes");
const { SEND_EMAIL_ERROR, SEND_EMAIL_SUCCESS } = require("./constants");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendAvailableClassesEmail = async (
  userId,
  name,
  email,
  classesInfoToNotify,
  classesInfoToNotificationRecord
) => {
  try {
    await sgMail.send({
      to: email,
      from: process.env.SENDER_EMAIL,
      subject: "Aulas disponíveis no Solinca",
      html: getHtml({ name, matchedClasses: classesInfoToNotify }),
      /*  template_id: "d-c07407e2ca4147638872447074aaf404",
      dynamic_template_data: {
        subject: "Aulas disponíveis no Solinca",
        name,
        matchedClasses: classesInfoToNotify,
      }, */
    });
    await recordNotifiedClasses(classesInfoToNotificationRecord, userId);
    logger.info(SEND_EMAIL_SUCCESS(email));
  } catch (error) {
    logger.error(SEND_EMAIL_ERROR(email, error));
  }
};

const getHtml = (templateData) => {
  const htmlContent = fs.readFileSync(
    path.join(__dirname, "../templates/email-notif.html"),
    "utf-8"
  );
  const template = hbs.compile(htmlContent);
  return template(templateData);
};

module.exports = sendAvailableClassesEmail;
