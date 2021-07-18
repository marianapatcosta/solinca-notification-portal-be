const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const HttpError = require("../models/http-error");
const User = require("../models/user");
const HttpStatusCode = require("../utils/http-status-code");
const getUserById = require("../utils/get-user");
const sendResetPasswordEmail = require("../utils/send-reset-password-email");
const {
  AUTHENTICATION_ERROR,
  BCRYPT_SALT_ROUNDS,
  EXISTING_USER_ERROR,
  GET_USER_DATA_ERROR,
  INVALID_CREDENTIALS_ERROR,
  NO_PHONE_NUMBER_ERROR,
  NOTIFICATION_TYPES,
  RESET_PASSWORD_ERROR,
  RESET_PASSWORD_TOKEN_EXPIRED_ERROR,
  RESTORE_PASSWORD_ERROR,
  SIGNIN_ERROR,
  SIGNUP_ERROR,
  UPDATE_PASSWORD_ERROR,
  UPDATE_USER_PREFERENCES_ERROR,
} = require("../utils/constants");

const signupService = async ({ username, email, password, solincaAuth }) => {
  let existingUser;
  try {
    existingUser = await User.findOne({ $or: [{ email }, { username }] });
  } catch (error) {
    throw new HttpError(SIGNUP_ERROR, HttpStatusCode.INTERNAL_SERVER_ERROR);
  }

  if (existingUser) {
    throw new HttpError(
      EXISTING_USER_ERROR,
      HttpStatusCode.UNPROCESSABLE_ENTITY
    );
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  } catch (error) {
    throw new HttpError(SIGNUP_ERROR, HttpStatusCode.INTERNAL_SERVER_ERROR);
  }

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    solincaAuth,
    selectedClubs: [],
    selectedOpenAirClubs: [],
    classesToWatch: [],
  });

  try {
    await newUser.save();
  } catch (error) {
    throw new HttpError(SIGNUP_ERROR, HttpStatusCode.INTERNAL_SERVER_ERROR);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_KEY
      /* { expiresIn: "1h" } */
    );
  } catch (error) {
    throw new HttpError(SIGNUP_ERROR, HttpStatusCode.INTERNAL_SERVER_ERROR);
  }

  return { userId: newUser.id, username: newUser.username, token };
};

const signinService = async ({ username, email, password }) => {
  let existingUser;
  try {
    existingUser = await User.findOne({ $or: [{ email }, { username }] });
  } catch (error) {
    throw new HttpError(SIGNIN_ERROR, HttpStatusCode.INTERNAL_SERVER_ERROR);
  }

  if (!existingUser) {
    throw new HttpError(AUTHENTICATION_ERROR, HttpStatusCode.FORBIDDEN);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (error) {
    throw new HttpError(AUTHENTICATION_ERROR, HttpStatusCode.FORBIDDEN);
  }

  if (!isValidPassword) {
    throw new HttpError(INVALID_CREDENTIALS_ERROR, HttpStatusCode.FORBIDDEN);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY
      /* { expiresIn: "1h" } */
    );
  } catch (error) {
    throw new HttpError(AUTHENTICATION_ERROR, HttpStatusCode.UNAUTHORIZED);
  }

  return {
    userId: existingUser.id,
    username: existingUser.username,
    token,
  };
};

const getUserDataService = async (userId) => {
  let user;
  try {
    user = await getUserById(
      userId,
      "-password -solincaAuth -solincaAuthToken",
      GET_USER_DATA_ERROR
    );
  } catch (error) {
    throw new HttpError(
      GET_USER_DATA_ERROR,
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }

  return user;
};

const updateUserDataService = async (userId, updatedData) => {
  try {
    const userToUpdate = await getUserById(
      userId,
      "-solincaAuth -solincaAuthToken",
      UPDATE_USER_PREFERENCES_ERROR
    );

    if (
      !userToUpdate.phoneNumber &&
      updatedData.notificationTypes.includes(NOTIFICATION_TYPES[1])
    ) {
      throw new Error(NO_PHONE_NUMBER_ERROR);
    }

    if (updatedData.password) {
      let isValidPassword;
      try {
        isValidPassword = await bcrypt.compare(
          updatedData.oldPassword,
          userToUpdate.password
        );
      } catch (error) {
        throw new HttpError(UPDATE_PASSWORD_ERROR, HttpStatusCode.FORBIDDEN);
      }

      if (!isValidPassword) {
        throw new HttpError(UPDATE_PASSWORD_ERROR, HttpStatusCode.FORBIDDEN);
      }
    }

    for (const userData in updatedData) {
      if (userData === "oldPassword") continue;
      if (userData === "password") {
        let hashedPassword;
        try {
          hashedPassword = await bcrypt.hash(
            updatedData.password,
            BCRYPT_SALT_ROUNDS
          );
          userToUpdate.password = hashedPassword;
          continue;
        } catch (error) {
          throw new HttpError(
            UPDATE_USER_PREFERENCES_ERROR,
            HttpStatusCode.INTERNAL_SERVER_ERROR
          );
        }
      }
      userToUpdate[userData] = updatedData[userData];
    }
    await userToUpdate.save();
  } catch (error) {
    throw new HttpError(
      error.message || UPDATE_USER_PREFERENCES_ERROR,
      error.code || HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }
};

const resetPasswordService = async (email) => {
  let existingUser;
  try {
    existingUser = await User.findOne({ email }, "username email");
  } catch (error) {
    throw new HttpError(
      RESET_PASSWORD_ERROR,
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }

  if (!existingUser) {
    throw new HttpError(NO_EMAIL_ERROR, HttpStatusCode.FORBIDDEN);
  }

  const token = crypto.randomBytes(32).toString("hex");
  let hashedToken;
  try {
    hashedToken = await bcrypt.hash(token, BCRYPT_SALT_ROUNDS);
  } catch (error) {
    throw new HttpError(
      RESET_PASSWORD_ERROR,
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }

  try {
    await existingUser.update({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: new Date(new Date().getTime() + 5 * 60000), //adds 5 min to current time
    });
    sendResetPasswordEmail(existingUser.id, existingUser.email, token);
  } catch (error) {
    throw new HttpError(
      RESET_PASSWORD_ERROR,
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }
};

const restorePasswordService = async ({
  userId,
  resetPasswordToken,
  password,
}) => {
  let existingUser;
  try {
    existingUser = await User.findOne(
      { _id: userId, resetPasswordExpires: { $gt: new Date() } },
      "resetPasswordToken resetPasswordExpires"
    );
  } catch (error) {
    throw new HttpError(
      RESTORE_PASSWORD_ERROR,
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }

  if (!existingUser) {
    throw new HttpError(
      RESET_PASSWORD_TOKEN_EXPIRED_ERROR,
      HttpStatusCode.FORBIDDEN
    );
  }

  let isValidToken = false;
  try {
    isValidToken = await bcrypt.compare(
      resetPasswordToken,
      existingUser.resetPasswordToken
    );
  } catch (error) {
    throw new HttpError(RESTORE_PASSWORD_ERROR, HttpStatusCode.FORBIDDEN);
  }

  if (!isValidToken) {
    throw new HttpError(
      RESET_PASSWORD_TOKEN_EXPIRED_ERROR,
      HttpStatusCode.FORBIDDEN
    );
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  } catch (error) {
    throw new HttpError(
      RESTORE_PASSWORD_ERROR,
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }

  try {
    await existingUser.update({
      resetPasswordToken: null,
      resetPasswordExpires: null,
      password: hashedPassword,
    });
  } catch (error) {
    throw new HttpError(
      RESTORE_PASSWORD_ERROR,
      HttpStatusCode.INTERNAL_SERVER_ERROR
    );
  }
};

module.exports = {
  signupService,
  signinService,
  getUserDataService,
  updateUserDataService,
  resetPasswordService,
  restorePasswordService,
};
