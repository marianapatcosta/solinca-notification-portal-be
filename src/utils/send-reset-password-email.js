const sgMail = require("@sendgrid/mail");
const logger = require("./logger");
const { SEND_EMAIL_ERROR, SEND_EMAIL_SUCCESS } = require("./constants");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendResetPasswordEmail = async (
  userId, 
  email,
  token
) => {
  try {
    await sgMail.send({
      to: email,
      from: process.env.SENDER_EMAIL,
      subject: "Recuperação da password Solinca Notification Portal",
      html: `<h4><b>Recuperação da palavra-passe</b></h4>\n\n
      <p>Para recuperar a sua palavra-passe, por favor aceda ao seguinte link:</p>\n
      <a href="${process.env.CLIENT_URL}/reset-password/${userId}/${token}">${process.env.CLIENT_URL}/reset-password/${token}</a>\n\n
      <p>Se não solicitou a recuperação da palavra-passe, por favor ignore este email.\n</p>`
    });
    
    logger.info(SEND_EMAIL_SUCCESS(email));
  } catch (error) {
    logger.error(SEND_EMAIL_ERROR(email, error));
  }
};

module.exports = sendResetPasswordEmail;
