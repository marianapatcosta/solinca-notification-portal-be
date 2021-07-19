const availableClasses = require("./available-classes");
const { TIME_INTERVALS } = require("./constants");
const User = require("../models/user");
const HttpError = require("../models/http-error");
const HttpStatusCode = require("./http-status-code");

const watchAvailableClasses = async () => {
  const timeInterval =
  TIME_INTERVALS[Math.round(Math.random() * TIME_INTERVALS.length)];
  const users = await getUsers();
  const openAirUsers = await getOpenAirUsers();
  setTimeout(() => {
    !!users.length && users.forEach(user => availableClasses(user.id, false, user, true));
    !!openAirUsers.length && openAirUsers.forEach(user => availableClasses(user.id, true, user, true));
    watchAvailableClasses();
  }, timeInterval);
};

const getUsers = async () => {
  let users;
  try {
    users = await User.find({isWatcherOn: true, "classesToWatch.0": { "$exists": true }, "selectedClubs.0": { "$exists": true }}, '-password -solincaAuth');
    return users;
  } catch (error) {
    throw new HttpError(error, HttpStatusCode.INTERNAL_SERVER_ERROR);
  }
};

const getOpenAirUsers = async () => {
  let users;
  try {
    users = await User.find({isOpenAirWatcherOn: true, "classesToWatch.0": { "$exists": true }, "selectedOpenAirClubs.0": { "$exists": true }}, '-password -solincaAuth');
    return users;
  } catch (error) {
    throw new HttpError(error, HttpStatusCode.INTERNAL_SERVER_ERROR);
  }
};

module.exports = watchAvailableClasses;
