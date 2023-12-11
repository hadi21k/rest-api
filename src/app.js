require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const cors = require("cors");
const httpStatus = require("http-status");
const ApiError = require("./utils/ApiError");
const routes = require("./routes/v1/index");
const { errorHandler } = require("./middlewares/error");
const { swaggerDocs } = require("./utils/swagger");

const app = express();

// security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// Cors
app.use(cors());


// V1 Routes
app.use("/v1", routes);

app.use((req, res, next) => {
  console.log(httpStatus.NOT_FOUND);
  next(new ApiError(httpStatus.NOT_FOUND, "Not Found"));
});

app.use(errorHandler);

module.exports = app;
