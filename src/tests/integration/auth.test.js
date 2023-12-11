const { describe, beforeEach } = require("node:test");
const request = require("supertest");
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");
const app = require("../../app");
const httpStatus = require("http-status");
const User = require("../../models/user.model");
const { insertUsers, userOne } = require("../fixtures/user.fixture");
const setUpTestDB = require("../utils/setupTestDB");
const { tokenService, emailService } = require("../../services");
const { tokenExpires, tokensType } = require("../../config/tokens");
const Token = require("../../models/token.model");
const { userOneAccessToken } = require("../fixtures/token.fixture");
const httpMocks = require("node-mocks-http");
const auth = require("../../middlewares/auth.middleware");
const ApiError = require("../../utils/ApiError");

setUpTestDB()

describe("Auth Routes", () => {
  describe("POST /v1/auth/register", () => {
    let newUser;
    beforeAll(() => {
      newUser = {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: faker.internet.password(),
      };
    });

    test("Should return 201 after creating user successfully", async () => {
      const response = await request(app)
        .post("/v1/auth/register")
        .send(newUser)
        .expect(httpStatus.CREATED);

      expect(response.body.user).toEqual({
        _id: expect.anything(),
        name: newUser.name,
        email: newUser.email,
        role: "user",
        createdAt: expect.anything(),
        isEmailVerified: false,
        updatedAt: expect.anything(),
        password: expect.anything(),
        __v: expect.anything(),
      });

      const dbUser = await User.findById(response.body.user._id);

      expect(dbUser).toBeDefined();

      expect(dbUser.password).not.toBe(newUser.password);

      expect(dbUser).toMatchObject({
        name: newUser.name,
        email: newUser.email,
        role: "user",
        isEmailVerified: false,
      });

      expect(response.body.tokens).toEqual({
        access: expect.anything(),
        refresh: expect.anything(),
      });
    });

    test("Should return 400 error if email is invalid", async () => {
      newUser.email = "invalidEmail";

      await request(app)
        .post("/v1/auth/register")
        .send(newUser)
        .expect(httpStatus.BAD_REQUEST);
    });

    test("Should return 400 error if email is already taken", async () => {
      await insertUsers([userOne]);
      newUser.email = userOne.email;

      await request(app)
        .post("/v1/auth/register")
        .send(userOne)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe("POST /v1/auth/login", () => {
    test("Should return 200 after successful login", async () => {
      await insertUsers([userOne]);
      const loginCredentials = {
        email: userOne.email,
        password: userOne.password,
      };

      const response = await request(app)
        .post("/v1/auth/login")
        .send(loginCredentials)
        .expect(httpStatus.OK);

      expect(response.body.user).toEqual({
        _id: expect.anything(),
        name: userOne.name,
        email: userOne.email,
        role: "user",
        createdAt: expect.anything(),
        isEmailVerified: false,
        updatedAt: expect.anything(),
      });

      expect(response.body.tokens).toEqual({
        access: expect.anything(),
        refresh: expect.anything(),
      });
    });

    test("Should return 400 error if password is wrong", async () => {
      await insertUsers([userOne]);
      const loginCredentials = {
        email: userOne.email,
        password: "XXXXXXXXXXXXX",
      };

      await request(app)
        .post("/v1/auth/login")
        .send(loginCredentials)
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe("POST /v1/auth/logout", () => {
    test("Should return 200 if refresh token is valid", async () => {
      await insertUsers([userOne]);
      const refreshToken = await tokenService.generateToken(
        userOne._id,
        tokenExpires.REFRESH_EXPIRES,
        tokensType.REFRESH,
        process.env.REFRESH_JWT_SECRET
      );
      await tokenService.saveToken(
        refreshToken,
        userOne._id,
        tokenExpires.REFRESH_EXPIRES,
        tokensType.REFRESH
      );

      const res = await request(app)
        .post("/v1/auth/logout")
        .send({ refreshToken })
        .expect(httpStatus.OK);

      expect(res.text).toEqual("Logout successfully");
    });

    test("Should return 400 if no refresh token", async () => {
      await request(app).post("/v1/auth/logout").expect(httpStatus.BAD_REQUEST);
    });

    test("Should return 404 if refresh token is not found", async () => {
      await insertUsers([userOne]);
      const refreshToken = await tokenService.generateToken(
        userOne._id,
        tokenExpires.REFRESH_EXPIRES,
        tokensType.REFRESH,
        process.env.REFRESH_JWT_SECRET
      );

      await request(app)
        .post("/v1/auth/logout")
        .send({ refreshToken })
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe("POST /v1/auth/refresh-tokens", () => {
    test("Should return 200 if refresh token is valid", async () => {
      await insertUsers([userOne]);
      const refreshToken = await tokenService.generateToken(
        userOne._id,
        tokenExpires.REFRESH_EXPIRES,
        tokensType.REFRESH,
        process.env.REFRESH_JWT_SECRET
      );

      await tokenService.saveToken(
        refreshToken,
        userOne._id,
        tokenExpires.REFRESH_EXPIRES,
        tokensType.REFRESH
      );

      const response = await request(app)
        .post("/v1/auth/refresh-tokens")
        .send({ refreshToken })
        .expect(httpStatus.OK);

      expect(response.body).toEqual({
        access: expect.anything(),
        refresh: expect.anything(),
      });

      const dbRefreshTokenDoc = await Token.findOne({
        token: response.body.refresh,
      });

      expect(dbRefreshTokenDoc).toMatchObject({
        type: tokensType.REFRESH,
        user: userOne._id,
      });
    });

    test("should return 400 error if refresh token is missing from request body", async () => {
      await request(app)
        .post("/v1/auth/refresh-tokens")
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test("Should return 500 if refresh token is signed using invalid secret", async () => {
      await insertUsers([userOne]);
      const refreshToken = await tokenService.generateToken(
        userOne._id,
        tokenExpires.REFRESH_EXPIRES,
        tokensType.REFRESH,
        "invalidSecret"
      );

      await tokenService.saveToken(
        refreshToken,
        userOne._id,
        tokenExpires.REFRESH_EXPIRES,
        tokensType.REFRESH
      );

      await request(app)
        .post("/v1/auth/refresh-tokens")
        .send({ refreshToken })
        .expect(httpStatus.INTERNAL_SERVER_ERROR);
    });

    test("Should return 404 if refresh token not in db", async () => {
      await insertUsers([userOne]);
      const refreshToken = await tokenService.generateToken(
        userOne._id,
        tokenExpires.REFRESH_EXPIRES,
        tokensType.REFRESH,
        process.env.REFRESH_JWT_SECRET
      );

      await request(app)
        .post("/v1/auth/refresh-tokens")
        .send({ refreshToken })
        .expect(httpStatus.NOT_FOUND);
    });

    test("Should return 500 if refresh token is expired", async () => {
      await insertUsers([userOne]);
      const refreshToken = await tokenService.generateToken(
        userOne._id,
        -1,
        tokensType.REFRESH,
        process.env.REFRESH_JWT_SECRET
      );

      await tokenService.saveToken(
        refreshToken,
        userOne._id,
        -1,
        tokensType.REFRESH
      );

      await request(app)
        .post("/v1/auth/refresh-tokens")
        .send({ refreshToken })
        .expect(httpStatus.INTERNAL_SERVER_ERROR);
    });

    test("Should return 404 if user not found", async () => {
      const refreshToken = await tokenService.generateToken(
        userOne._id,
        tokenExpires.REFRESH_EXPIRES,
        tokensType.REFRESH,
        process.env.REFRESH_JWT_SECRET
      );

      await tokenService.saveToken(
        refreshToken,
        userOne._id,
        tokenExpires.REFRESH_EXPIRES,
        tokensType.REFRESH
      );

      await request(app)
        .post("/v1/auth/refresh-tokens")
        .send({ refreshToken })
        .expect(httpStatus.NOT_FOUND);
    });
  });
  describe("POST /v1/auth/forgot-password", () => {
    beforeEach(() => {
      jest.spyOn(emailService.transporter, "sendMail").mockResolvedValue();
    });

    test("Should return 204 and send verification email to the user", async () => {
      await insertUsers([userOne]);
      const sendResetPasswordEmailSpy = jest.spyOn(
        emailService,
        "sendResetPasswordEmail"
      );

      await request(app)
        .post("/v1/auth/forgot-password")
        .send({
          email: userOne.email,
        })
        .expect(httpStatus.NO_CONTENT);

      expect(sendResetPasswordEmailSpy).toHaveBeenCalledWith(
        userOne.email,
        expect.any(String)
      );

      const resetPasswordToken = sendResetPasswordEmailSpy.mock.calls[0][1];
      const dbResetPasswordTokenDoc = await Token.findOne({
        token: resetPasswordToken,
        user: userOne._id,
      });
      expect(dbResetPasswordTokenDoc).toBeDefined();
    });

    test("should return 400 if email is missing", async () => {
      await insertUsers([userOne]);

      await request(app)
        .post("/v1/auth/forgot-password")
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test("should return 404 if email does not belong to any user", async () => {
      await request(app)
        .post("/v1/auth/forgot-password")
        .send({ email: userOne.email })
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe("POST /v1/auth/reset-password", () => {
    test("Should return 204 and reset the password", async () => {
      await insertUsers([userOne]);
      const resetPasswordToken = await tokenService.generateToken(
        userOne._id,
        tokenExpires.PASSWORD_EXPIRES,
        tokensType.RESET_PASSWORD,
        process.env.REFRESH_JWT_SECRET
      );

      await tokenService.saveToken(
        resetPasswordToken,
        userOne._id,
        tokenExpires.PASSWORD_EXPIRES,
        tokensType.RESET_PASSWORD
      );

      await request(app)
        .post("/v1/auth/reset-password")
        .query({
          token: resetPasswordToken,
        })
        .send({
          password: "password2",
        })
        .expect(httpStatus.NO_CONTENT);

      const dbUser = await User.findById(userOne._id);
      const isPasswordMatch = await bcrypt.compare(
        "password2",
        dbUser.password
      );

      expect(isPasswordMatch).toBe(true);
    });

    test("should return 400 if reset password token is missing", async () => {
      await insertUsers([userOne]);

      await request(app)
        .post("/v1/auth/reset-password")
        .send({ password: "password2" })
        .expect(httpStatus.BAD_REQUEST);
    });

    test("Should return 500 if reset password token is expired", async () => {
      await insertUsers([userOne]);
      const resetPasswordToken = await tokenService.generateToken(
        userOne._id,
        -1,
        tokensType.RESET_PASSWORD,
        process.env.REFRESH_JWT_SECRET
      );

      await tokenService.saveToken(
        resetPasswordToken,
        userOne._id,
        -1,
        tokensType.RESET_PASSWORD
      );

      await request(app)
        .post("/v1/auth/reset-password")
        .query({
          token: resetPasswordToken,
        })
        .send({
          password: "XXXXXXXXX",
        })
        .expect(httpStatus.INTERNAL_SERVER_ERROR);
    });

    test("Should return 404 if user not found", async () => {
      const resetPasswordToken = await tokenService.generateToken(
        userOne._id,
        tokenExpires.PASSWORD_EXPIRES,
        tokensType.RESET_PASSWORD,
        process.env.REFRESH_JWT_SECRET
      );

      await tokenService.saveToken(
        resetPasswordToken,
        userOne._id,
        tokenExpires.PASSWORD_EXPIRES,
        tokensType.RESET_PASSWORD
      );

      await request(app)
        .post("/v1/auth/reset-password")
        .query({
          token: resetPasswordToken,
        })
        .send({
          password: "XXXXXXXXX",
        })
        .expect(httpStatus.NOT_FOUND);
    });

    test("Should return 400 if password is missing or invalid", async () => {
      await insertUsers([userOne]);
      const resetPasswordToken = await tokenService.generateToken(
        userOne._id,
        tokenExpires.PASSWORD_EXPIRES,
        tokensType.RESET_PASSWORD,
        process.env.REFRESH_JWT_SECRET
      );

      await tokenService.saveToken(
        resetPasswordToken,
        userOne._id,
        tokenExpires.PASSWORD_EXPIRES,
        tokensType.RESET_PASSWORD
      );

      await request(app)
        .post("/v1/auth/reset-password")
        .query({
          token: resetPasswordToken,
        })
        .expect(httpStatus.BAD_REQUEST);

      await request(app)
        .post("/v1/auth/reset-password")
        .query({
          token: resetPasswordToken,
        })
        .send({
          password: "short",
        })
        .expect(httpStatus.BAD_REQUEST);
    });
  });

  describe("GET /v1/auth/send-verfication-email", () => {
    test("should return 204 and send verification email to the user", async () => {
      await insertUsers([userOne]);
      const sendVerificationEmailSpy = jest.spyOn(
        emailService,
        "sendVerificationEmail"
      );

      await request(app)
        .get("/v1/auth/send-verification-email")
        .set("Authorization", `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.NO_CONTENT);

      expect(sendVerificationEmailSpy).toHaveBeenCalledWith(
        userOne.email,
        expect.any(String)
      );

      const verifyEmailToken = sendVerificationEmailSpy.mock.calls[0][1];
      const dbVerifyEmailTokenDoc = await Token.findOne({
        token: verifyEmailToken,
        user: userOne._id,
      });
      expect(dbVerifyEmailTokenDoc).toBeDefined();
    });

    test("should return 404 error if access token is missing", async () => {
      await insertUsers([userOne]);
      await request(app)
        .get("/v1/auth/send-verification-email")
        .expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe("POST /v1/auth/verify-email", () => {
    test("Should return 200 if email is verified", async () => {
      await insertUsers([userOne]);
      const emailVerificationToken = await tokenService.generateToken(
        userOne._id,
        tokenExpires.VERIFY_EXPIRES,
        tokensType.VERIFY_EMAIL,
        process.env.REFRESH_JWT_SECRET
      );

      await tokenService.saveToken(
        emailVerificationToken,
        userOne._id,
        tokenExpires.VERIFY_EXPIRES,
        tokensType.VERIFY_EMAIL
      );

      await request(app)
        .post("/v1/auth/verify-email")
        .query({
          token: emailVerificationToken,
        })
        .expect(httpStatus.OK);

      const dbUserDoc = await User.findById(userOne._id);

      expect(dbUserDoc.isEmailVerified).toBe(true);
    });

    test("Should return 400 if no token is sent", async () => {
      await insertUsers([userOne]);

      await request(app)
        .post("/v1/auth/verify-email")
        .expect(httpStatus.BAD_REQUEST);
    });

    test("Should return 404 if there is no token in db", async () => {
      await insertUsers([userOne]);
      const emailVerificationToken = await tokenService.generateToken(
        userOne._id,
        tokenExpires.VERIFY_EXPIRES,
        tokensType.VERIFY_EMAIL,
        process.env.REFRESH_JWT_SECRET
      );

      await request(app)
        .post("/v1/auth/verify-email")
        .query({
          token: emailVerificationToken,
        })
        .expect(httpStatus.NOT_FOUND);
    });

    test("Should return 500 if token is expired", async () => {
      await insertUsers([userOne]);
      const emailVerificationToken = await tokenService.generateToken(
        userOne._id,
        -1,
        tokensType.VERIFY_EMAIL,
        process.env.REFRESH_JWT_SECRET
      );

      await tokenService.saveToken(
        emailVerificationToken,
        userOne._id,
        -1,
        tokensType.VERIFY_EMAIL
      );

      await request(app)
        .post("/v1/auth/verify-email")
        .query({
          token: emailVerificationToken,
        })
        .expect(httpStatus.INTERNAL_SERVER_ERROR);
    });

    test("Should return 404 if there is no user assciated to", async () => {
      const emailVerificationToken = await tokenService.generateToken(
        userOne._id,
        -1,
        tokensType.VERIFY_EMAIL,
        process.env.REFRESH_JWT_SECRET
      );

      await tokenService.saveToken(
        emailVerificationToken,
        userOne._id,
        -1,
        tokensType.VERIFY_EMAIL
      );

      await request(app)
        .post("/v1/auth/verify-email")
        .query({
          token: emailVerificationToken,
        })
        .expect(httpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});

describe("Auth Middleware", () => {
  test("Should call next with no errors if access token is valid", async () => {
    await insertUsers([userOne]);
    const req = httpMocks.createRequest({
      headers: { authorization: `Bearer ${userOneAccessToken}` },
    });
    const next = jest.fn();

    await auth("")(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.user._id).toEqual(userOne._id);
  });

  test("Should call next with ApiError if there is no acces token", async () => {
    await insertUsers([userOne]);
    const req = httpMocks.createRequest();
    const next = jest.fn();

    await auth("")(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(
      new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized")
    );
    expect(req.user).toBeUndefined();
  });

  test("Should call next with Api error Forbidden if user does't has required rights", async () => {
    await insertUsers([userOne]);

    const req = httpMocks.createRequest({
      headers: { authorization: `Bearer ${userOneAccessToken}` },
    });

    const next = jest.fn();

    await auth("createProduct")(req, httpMocks.createResponse(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status_code: httpStatus.FORBIDDEN,
        message: "Forbidden",
      })
    );
  });
});
