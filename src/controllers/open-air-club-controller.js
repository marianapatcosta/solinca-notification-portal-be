const { clubsService, availableClassesService } = require("../services/open-air-club-service");

const fetchAvailableClasses = async (req, res, next) => {
  let availableClasses;
  const id = req.userInfo.id;
  try {
    availableClasses = await availableClassesService(id);
  } catch (error) {
    return next(error);
  }

  return res.status(200).send(availableClasses);
};

const fetchClubs = async (req, res, next) => {
  let clubs;
  const id = req.userInfo.id;
  try {
    clubs = await clubsService(id);
  } catch (error) {
    return next(error);
  }

  return res.status(200).send(clubs);
};

module.exports = {
  fetchAvailableClasses,
  fetchClubs
};
