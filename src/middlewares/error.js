const httpStatus = require("http-status");

const errorHandler = (err, req, res, next) => {
  const { status_code, message } = err;

  if (process.env.NODE_ENV === "production") {
    status_code = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[500];
  }

  const response = {
    code: status_code || 500,
    message,
    stack: process.env.NODE_ENV === "development " ? err.stack : null,
  };

  res.status(status_code || 500).send(response);
};

module.exports = {
  errorHandler,
};
