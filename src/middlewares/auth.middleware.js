const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { tokenService } = require("../services");
const { roleRights } = require("../config/roles");

const auth = (requiredRights) => async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized"));
  }

  const token = authHeader.split(" ")[1];

  const user = await tokenService.verifyAccessToken(token);

  if (!user) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized"));
  }

  req.user = user;

  if (requiredRights) {
    const userRights = roleRights.get(user.role);

    const hasRequiredRole = userRights.some((right) =>
      requiredRights.includes(right)
    );

    if (!hasRequiredRole) {
      return next(new ApiError(httpStatus.FORBIDDEN, "Forbidden"));
    }
  }

  next();
};

module.exports = auth;
