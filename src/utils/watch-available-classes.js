const availableClasses = require("./available-classes");
const { TIME_INTERVALS } = require("./constants");
const User = require("../models/user");
const HttpError = require("../models/http-error");
const HttpStatusCode = require("./http-status-code");

const watchAvailableClasses = async () => {
  console.log('watcher', new Date())
  const timeInterval =
    TIME_INTERVALS[Math.round(Math.random() * TIME_INTERVALS.length)];
  const users = await getUsers();
  setTimeout(() => {
    users.forEach(user => availableClasses(user.id, user, true));
    watchAvailableClasses();
  }, 5000/* timeInterval */);
};

const getUsers = async () => {
  let users;
  try {
    users = await User.find({isWatcherOn: true, "classesToTrack.0": { "$exists": true }, "selectedClubs.0": { "$exists": true }}, '-password -solincaAuth');
    return users;
  } catch (error) {
    throw new HttpError(error, HttpStatusCode.INTERNAL_SERVER_ERROR);
  }
};

module.exports = watchAvailableClasses;
