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
    const axiosInstance = axios.create()
    axiosInstance.interceptors.response.use(
      response => response.data,
      (error) => handleRequestFailure(error, axiosInstance, userId)
    );

    const user = await getUserById(userId, "solincaAuthToken", GET_CLUBS_ERROR);
    return await axiosInstance({
      url: GET_CLUBS_URL, 
      headers: {
        Authorization: `Bearer ${user.solincaAuthToken}`,
      }
    });
  } catch (error) {
    logger.error(`Failed to get clubs - ${error}`);
    throw new HttpError(
      error.message || GET_CLUBS_ERROR,
      error.code || 500
    );
  }
};

const handleRequestFailure = async (error, axiosInstance, userId) => {
  const originalRequest = error.config;
  if (error.response.status === 401 && !originalRequest._retry ) {
    logger.error(`Failed to get clubs - ${error}`);
    originalRequest._retry = true;
    const updatedToken = await solincaAuth(userId);      
    return axiosInstance({
      ...originalRequest,
      headers: {
        ...originalRequest.headers, 
        Authorization: `Bearer ${updatedToken}`
      }
    })
  }

  return Promise.reject(error);
}

module.exports = { availableClassesService, clubsService };
