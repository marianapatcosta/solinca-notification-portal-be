const { validationResult } = require("express-validator");
const {
  signupService,
  signinService,
  getUserDataService,
  updateUserDataService,
  resetPasswordService,
  restorePasswordService
} = require("../services/user-service");
const { INVALID_INPUTS_ERROR } = require("../utils/constants");
const HttpStatusCode = require("../utils/http-status-code");

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(INVALID_INPUTS_ERROR, HttpStatusCode.UNPROCESSABLE_ENTITY)
    );
  }

  let signupResponse;
  try {
    signupResponse = await signupService(req.body);
  } catch (error) {
    return next(error);
  }

  return res.status(201).send(signupResponse);
};

const signin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(INVALID_INPUTS_ERROR, HttpStatusCode.UNPROCESSABLE_ENTITY)
    );
  }

  let signinResponse;
  try {
    signinResponse = await signinService(req.body);
  } catch (error) {
    return next(error);
  }

  return res.status(200).send(signinResponse);
};

const getUserData = async (req, res, next) => { 
  const id = req.userInfo.id;
  let userData;
  try {
    userData = await getUserDataService(id);
  } catch (error) {
    return next(error);
  }

  return res.status(200).send(userData);
}

const updateUserData = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError(INVALID_INPUTS_ERROR, HttpStatusCode.UNPROCESSABLE_ENTITY)
    );
  }

  const id = req.userInfo.id;
  try {
    await updateUserDataService(id, req.body);
  } catch (error) {
    return next(error);
  }

  return res.status(200).send("user data was updated.");
};

const resetPassword = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError(INVALID_INPUTS_ERROR, HttpStatusCode.UNPROCESSABLE_ENTITY)
    );
  }

  const email = req.body.email;
  try {
    await resetPasswordService(email);
  } catch (error) {
    return next(error);
  }

  return res.status(200).send({message: "Reset password link sent"});
};

const restorePassword = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new HttpError(INVALID_INPUTS_ERROR, HttpStatusCode.UNPROCESSABLE_ENTITY)
    );
  }

  try {
    await restorePasswordService(req.body);
  } catch (error) {
    return next(error);
  }

  return res.status(200).send({message: "Password updated"});
};

module.exports = {
  signup,
  signin,
  getUserData,
  updateUserData,
  resetPassword,
  restorePassword
};
