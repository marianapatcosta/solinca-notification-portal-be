
const User = require("../models/user");
const HttpStatusCode = require("./http-status-code");

const getUserById = async (userId, paramsFilter, errorInfo) => {
  let user;
  try {
    user = await User.findById(
      userId,
      paramsFilter
    ).exec();
    return user;
  } catch (error) {
    throw new HttpError(
      errorInfo,
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }
};

module.exports = getUserById;