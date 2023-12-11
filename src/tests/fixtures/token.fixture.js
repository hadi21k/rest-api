const { tokenExpires, tokensType } = require("../../config/tokens");
const { tokenService } = require("../../services");
const { userOne, admin } = require("./user.fixture");

const userOneAccessToken = tokenService.generateToken(
  userOne._id,
  tokenExpires.ACCESS_EXPIRES,
  tokensType.ACCESS,
  process.env.ACCESS_JWT_SECRET
);

const adminAccessToken = tokenService.generateToken(
  admin._id,
  tokenExpires.ACCESS_EXPIRES,
  tokensType.ACCESS,
  process.env.ACCESS_JWT_SECRET
);

module.exports = {
  userOneAccessToken,
  adminAccessToken,
};
