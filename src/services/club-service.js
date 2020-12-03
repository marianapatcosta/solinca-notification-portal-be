const axios = require("axios");
const HttpError = require("../models/http-error");
const availableClasses = require("../utils/available-classes");
const getUserById = require("../utils/get-user");
const solincaAuth = require("../utils/solinca-auth");
const logger = require("../utils/logger");
const { GET_CLUBS_ERROR, GET_CLUBS_URL } = require("../utils/constants");

const availableClassesService = async (userId) => {
  try {
    const response = await availableClasses(userId);
    return response;
  } catch (error) {
    throw new HttpError(
      error.message || "an error occurred",
      error.code || 500
    );
  }
};

const clubsService = async (userId) => {
  try {
    const user = await getUserById(userId, "solincaAuthToken", GET_CLUBS_ERROR);
    const response = await axios.get(GET_CLUBS_URL, {
      headers: {
        Authorization: `Bearer ${user.solincaAuthToken}`,
      },
    });
    return response.data;
  } catch (error) {
    logger.error(`Failed to get clubs - ${error}`);
    if (error.response.status === 401) {
      await solincaAuth(userId);
      await clubsService(userId);
    }
    throw new HttpError(
      error.message || GET_CLUBS_ERROR,
      error.code || 500
    );
  }
};

module.exports = { availableClassesService, clubsService };
