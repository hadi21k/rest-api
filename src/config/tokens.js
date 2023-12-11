const tokensType = {
  ACCESS: "access",
  REFRESH: "refresh",
  RESET_PASSWORD: "resetPassword",
  VERIFY_EMAIL: "verifyEmail",
};

const tokenExpires = {
  ACCESS_EXPIRES: 15 * 60, // 15 minutes for access token
  REFRESH_EXPIRES: 7 * 24 * 60 * 60, // 7 days for refresh token
  PASSWORD_EXPIRES: 60 * 60, // 1 hour for password reset token
  VERIFY_EXPIRES: 60 * 60, // 1 hour for email verification token
};

module.exports = {
  tokenExpires,
  tokensType,
};
