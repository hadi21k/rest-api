const httpStatus = require("http-status");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");

const createUser = async (body) => {
  const userExist = await User.findOne({ email: body.email });

  if (userExist) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }

  return await User.create(body);
};

module.exports = {
  createUser,
};
