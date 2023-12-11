const httpStatus = require("http-status");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
const { tokensType } = require("../config/tokens");
const Token = require("../models/token.model");
const tokenService = require("./token.service");

const loginByEmailAndPassword = async (loginData) => {
  const user = await User.findOne({ email: loginData.email });

  if (!user || !(await user.comparePassword(loginData.password))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Incorrect Email or Password");
  }

  user.password = undefined;
  user.__v = undefined;

  return user;
};

const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOneAndDelete({
    token: refreshToken,
    type: tokensType.REFRESH,
  });

  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, "Refresh Token not found");
  }
};

const resetPassword = async (token, newPassword) => {
  const verifiedResetToken = await tokenService.verifyToken(
    token,
    tokensType.RESET_PASSWORD
  );

  const user = await User.findById(verifiedResetToken.user);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  user.password = newPassword;

  await user.save();

  await Token.deleteMany({
    user: user._id,
    type: tokensType.RESET_PASSWORD,
  });
};

const verifyEmail = async (token) => {
  const verifyVerificationToken = await tokenService.verifyToken(
    token,
    tokensType.VERIFY_EMAIL
  );

  const user = await User.findById(verifyVerificationToken.user);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  user.isEmailVerified = true;

  await user.save();

  await Token.deleteMany({
    user: user._id,
    type: tokensType.VERIFY_EMAIL,
  });
};

const refreshToken = async (token) => {
  const verifyToken = await tokenService.verifyToken(token, tokensType.REFRESH);
  const userExist = await User.findById(verifyToken.user);

  if (!userExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return await tokenService.generateAuthTokens(verifyToken.user);
};

module.exports = {
  loginByEmailAndPassword,
  logout,
  resetPassword,
  verifyEmail,
  refreshToken,
};
