const mongoose = require("mongoose");
const app = require("./app");
const logger = require("./config/logger");

let server;

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info("Connected to MongoDB");

    server = app.listen(process.env.PORT, () => {
      logger.info(`Listening to port ${process.env.PORT}`);
    });
  } catch (err) {
    logger.error(err);
  }
})();
