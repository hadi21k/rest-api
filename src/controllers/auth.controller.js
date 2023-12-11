const {
  authService,
  userService,
  tokenService,
  emailService,
} = require("../services/index");
const catchAsync = require("../utils/catchAsync");
const httpStatus = require("http-status");

const register = catchAsync(async (req, res) => {
  // Search for existing email
  // Create user
  // Generate Access and Refresh tokens
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  return res.status(httpStatus.CREATED).json({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  // Search for existing email
  // Generate Access and Refresh tokens
  const user = await authService.loginByEmailAndPassword(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  return res.status(httpStatus.OK).json({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  // Delete refresh token
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.OK).send("Logout successfully");
});

const forgotPassword = catchAsync(async (req, res) => {
  // Get email
  // generate password reset token
  // send email with token
  const resetPasswordToken = await tokenService.generateResetPasswordToken(
    req.body.email
  );
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  // Get token and password from query and body respectively
  // verify jwt token and in db
  // search for user
  // update password
  const { password } = req.body;
  const { token } = req.query;
  await authService.resetPassword(token, password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  // Get email
  // Search for email existing
  // generate email verify token
  // send email with token
  const emailVerificationToken =
    await tokenService.generateEmailVerificationToken(req.user.email);
  await emailService.sendVerificationEmail(
    req.user.email,
    emailVerificationToken
  );
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  // Get token from query
  // verify query
  // update email verified in db
  const { token } = req.query;
  await authService.verifyEmail(token);
  res.status(httpStatus.OK).send("Email verified succesfully");
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshToken(req.body.refreshToken);
  res.status(httpStatus.OK).send(tokens);
});

module.exports = {
  register,
  login,
  logout,
  sendVerificationEmail,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshTokens,
};
