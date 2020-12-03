const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");
const { AUTHORIZATION_ERROR } = require("../utils/constants");
const HttpStatusCode = require("../utils/http-status-code");

const checkAuthorization = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next(); 
  }
  try {   
    const token = req.headers.authorization.split(" ")[1]; 
    if (!token) {
      throw new HttpError(AUTHORIZATION_ERROR, HttpStatusCode.FORBIDDEN);
    }

    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userInfo = { id: decodedToken.userId };
    next();
  } catch (error) {
    return next(new HttpError(AUTHORIZATION_ERROR, HttpStatusCode.FORBIDDEN));
  }
};

module.exports = checkAuthorization;
