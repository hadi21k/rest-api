const jwt = require("jsonwebtoken");
const { tokenExpires, tokensType } = require("../config/tokens");
const Token = require("../models/token.model");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const User = require("../models/user.model");

const generateToken = (userId, expiresIn, type, secret) => {
  const payload = {
    userId,
    type,
  };

  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

const saveToken = async (token, user, expires, type) => {
  await Token.create({
    token,
    user: user._id,
    type,
    expires: new Date(new Date().getTime() + expires * 1000),
  });
};

const verifyAccessToken = async (token) => {
  const tokenVerified = jwt.verify(token, process.env.ACCESS_JWT_SECRET);

  if (!tokenVerified) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const user = await User.findById(tokenVerified.userId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

const verifyToken = async (token, type) => {
  const payload = jwt.verify(token, process.env.REFRESH_JWT_SECRET);

  if (!payload) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const tokenDoc = await Token.findOne({
    token,
    type,
    user: payload.userId,
  });

  if (!tokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, "Token doesn't exist");
  }

  return tokenDoc;
};

const generateAuthTokens = async (user) => {
  // Generate Access
  // Generate Refresh
  // Save refresh in db
  const accessToken = generateToken(
    user.id,
    tokenExpires.ACCESS_EXPIRES,
    tokensType.ACCESS,
    process.env.ACCESS_JWT_SECRET
  );

  const refreshToken = generateToken(
    user.id,
    tokenExpires.REFRESH_EXPIRES,
    tokensType.REFRESH,
    process.env.REFRESH_JWT_SECRET
  );

  await saveToken(
    refreshToken,
    user,
    tokenExpires.REFRESH_EXPIRES,
    tokensType.REFRESH
  );

  return {
    access: accessToken,
    refresh: refreshToken,
  };
};

const generateResetPasswordToken = async (email) => {
  // Search for user by email
  // Generate Token of type reset password
  // Save token
  // return token

  const userExist = await User.findOne({ email });

  if (!userExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const token = generateToken(
    userExist._id,
    tokenExpires.PASSWORD_EXPIRES,
    tokensType.RESET_PASSWORD,
    process.env.ACCESS_JWT_SECRET
  );

  await saveToken(
    token,
    userExist,
    tokenExpires.PASSWORD_EXPIRES,
    tokensType.RESET_PASSWORD
  );

  return token;
};

const generateEmailVerificationToken = async (email) => {
  const userExist = await User.findOne({ email });

  if (!userExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const token = generateToken(
    userExist._id,
    tokenExpires.VERIFY_EXPIRES,
    tokensType.VERIFY_EMAIL,
    process.env.ACCESS_JWT_SECRET
  );

  await saveToken(
    token,
    userExist,
    tokenExpires.VERIFY_EXPIRES,
    tokensType.VERIFY_EMAIL
  );

  return token;
};

module.exports = {
  generateToken,
  saveToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateEmailVerificationToken,
  verifyToken,
  verifyAccessToken,
};
