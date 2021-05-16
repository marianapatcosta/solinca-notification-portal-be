const NotifiedClass = require("../models/notified-class");

const emptyNotifiedClasses = async () => {
  try {
    await NotifiedClass.deleteMany({});
  } catch (error) {
    throw new HttpError(error, HttpStatusCode.INTERNAL_SERVER_ERROR);
  }
};
module.exports = emptyNotifiedClasses ;
