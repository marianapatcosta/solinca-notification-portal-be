const express = require("express");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const mongoose = require("mongoose");
const cron = require("node-cron");
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./src/swagger.yaml");
const clubRoutes = require("./routes/club-routes.js");
const openAirClubRoutes = require("./routes/open-air-club-routes.js");
const userRoutes = require("./routes/user-routes.js");
const HttpError = require("./models/http-error");
const HttpStatusCode = require("./utils/http-status-code");
const watchAvailableClasses = require("./utils/watch-available-classes.js");
const emptyNotifiedClasses = require("./utils/empty-notified-classes.js");
const { GENERAL_ERROR, ROUTE_NOT_FOUND_ERROR } = require("./utils/constants");

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@devconnector.ihogm.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const DEFAULT_PORT = 8000;
const port = +process.env.PORT || DEFAULT_PORT;
const app = express();
app.disable("x-powered-by");

app.use(helmet());

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://solinca-notification-portal.web.app/");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH");

  next();
});

app.use("/api/v1/docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));

app.use("/api/v1/club", clubRoutes);

app.use("/api/v1/club", openAirClubRoutes);

app.use("/api/v1/user", userRoutes);

app.use((req, res, next) => {
  const error = new HttpError(ROUTE_NOT_FOUND_ERROR, 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  res
    .status(error.code || HttpStatusCode.INTERNAL_SERVER_ERROR)
    .json({ error: error.message || GENERAL_ERROR });
});

watchAvailableClasses();

const emptyNotifiedClassesCollection = cron.schedule("0 12 * * *", () => {
  emptyNotifiedClasses();
});
emptyNotifiedClassesCollection.start();

mongoose
  .connect(url, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(app.listen(port))
  .catch((error) => console.log(error));
