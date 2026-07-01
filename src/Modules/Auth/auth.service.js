import { OAuth2Client } from "google-auth-library";
import { hashEnum } from "../../Utils/enums/security.enum.js";
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from "../../Utils/response/error.response.js";
import { successResponse } from "../../Utils/response/success.response.js";
import { decrypt, encrypt } from "../../Utils/security/encryption.security.js";
import {
  compareHash,
  generateHash,
} from "../../Utils/security/hash.security.js";
import {
  create,
  findOne,
  findOneAndUpdate,
  updateOne,
} from "./../../DB/db.repository.js";
import userModel from "./../../DB/Models/user.model.js";
import { getNewLoginCredentials } from "../../Utils/tokens/token.js";
import { CLIENT_ID } from "../../../Config/config.service.js";
import { LogoutTypeEnum, ProviderEnum } from "../../Utils/enums/user.enum.js";
import TokenModel from "../../DB/Models/token.model.js";
import { generateOTP } from "./../../Utils/generateOTP.utils.js";
import { emailEvent } from "../../Utils/events/email.events.js";

export const signup = async (req, res) => {
  const { userName, email, password, phone } = req.body;

  const userExists = await findOne({ model: userModel, filter: { email } });

  if (userExists) throw ConflictException({ message: "User already exists" });

  // hash pass

  const otp = generateOTP();
  const otpHashed = await generateHash({
    plainText: otp,
    algorithm: hashEnum.Argon2,
  });

  let hashedPassword = await generateHash({
    plainText: password,
    algorithm: hashEnum.Argon2,
  });

  // encrypted phone number

  const encryptedPhone = encrypt(phone);

  const user = await create({
    model: userModel,
    data: [
      {
        userName,
        email,
        password: hashedPassword,
        phone: encryptedPhone,
        confirmEmailOTP: otpHashed,
      },
    ],
  });

  // send email

  emailEvent.emit("confirmEmail", { to: email, userName, otp });

  return successResponse({
    res,
    statusCode: 201,
    message: "User created successfully",
    data: user,
  });
};

// expire time for otp 5 minutes
// api resend otp

export const confirmEmail = async (req, res) => {
  const { email, otp } = req.body;

  const user = await findOne({
    model: userModel,
    filter: {
      email,
      confirmEmailOTP: { $exists: true },
      confirmEmail: { $exists: false },
    },
  });

  if (!user) throw NotFoundException({ message: "User not found" });

  const isMatch = await compareHash({
    plainText: otp,
    hashedText: user.confirmEmailOTP,
    algorithm: hashEnum.Argon2,
  });

  if (!isMatch) throw BadRequestException({ message: "Invalid otp" });

  await updateOne({
    model: userModel,
    filter: { email },
    update: { confirmEmail: Date.now(), $unset: { confirmEmailOTP: true } },
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "User Confirmed Successfully",
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await findOne({
    model: userModel,
    filter: { email, confirmEmail: { $exists: true } },
  });

  if (!user) throw NotFoundException({ message: "User not found" });

  const isMatch = await compareHash({
    plainText: password,
    hashedText: user.password,
    algorithm: hashEnum.Argon2,
  });

  if (!isMatch) throw BadRequestException({ message: "Invalid credentials" });

  const tokens = await getNewLoginCredentials(user);

  return successResponse({
    res,
    statusCode: 200,
    message: "User logged in successfully",
    data: { tokens },
  });
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  const otpHashed = await generateHash({
    plainText: otp,
    algorithm: hashEnum.Argon2,
  });

  const user = await findOneAndUpdate({
    model: userModel,
    filter: {
      email,
      confirmEmail: { $exists: true },
      provider: ProviderEnum.System,
    },
    update: {
      forgetPasswordOTP: otpHashed,
    },
  });

  if (!user) throw NotFoundException("User Not Found");

  emailEvent.emit("forgetPassword", {
    to: email,
    userName: user.userName,
    otp,
  });

  return successResponse({
    res,
    message: "Check Your Inbox",
  });
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await findOne({
    model: userModel,
    filter: {
      email,
      provider: ProviderEnum.System,
      confirmEmail: { $exists: true },
      forgetPasswordOTP: { $exists: true },
    },
  });

  if (!user) throw NotFoundException({ message: "User not found" });

  const isValidOTP = await compareHash({
    plainText: otp,
    hashedText: user.forgetPasswordOTP,
    algorithm: hashEnum.Argon2,
  });

  if (!isValidOTP) throw BadRequestException({ message: "Invalid OTP" });

  const newHashedPassword = await generateHash({
    plainText: newPassword,
    algorithm: hashEnum.Argon2,
  });

  await updateOne({
    model: userModel,
    filter: { email },
    update: {
      password: newHashedPassword,
      $unset: { forgetPasswordOTP: true },
    },
  });

  return successResponse({
    res,
    message: "Password reset successfully",
  });
};

export const refreshToken = async (req, res) => {
  const { accessToken } = await getNewLoginCredentials(req.user);

  return successResponse({
    res,
    statusCode: 200,
    message: "Done",
    data: { tokens: { accessToken } },
  });
};

async function verifyGoogleAccount({ idToken }) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: CLIENT_ID,
  });
  const payload = ticket.getPayload();

  return payload;
}

export const loginWithGoogle = async (req, res) => {
  const { idToken } = req.body;
  const payload = await verifyGoogleAccount({ idToken });

  const { email, email_verified, given_name, family_name, picture } =
    await verifyGoogleAccount({ idToken });

  if (!email_verified) throw BadRequestException("Email Not verified");

  const user = await findOne({ model: userModel, filter: { email } });
  if (user) {
    if (user.provider === ProviderEnum.Google) {
      const credentials = await getNewLoginCredentials(user);
      return successResponse({
        res,
        message: "Login Successfully",
        statusCode: 200,
        data: { credentials },
      });
    }
  }

  const newUser = await create({
    model: userModel,
    data: [
      {
        firstName: given_name,
        lastName: family_name,
        email,
        profilePicture: picture,
        provider: ProviderEnum.Google,
      },
    ],
  });

  const credentials = await getNewLoginCredentials(newUser);
  return successResponse({
    res,
    message: "Create",
    statusCode: 201,
    data: { credentials },
  });
};

export const logout = async (req, res) => {
  const { flag } = req.body;
  let status = 200;
  switch (flag) {
    case LogoutTypeEnum.Logout:
      await create({
        model: TokenModel,
        data: [
          {
            jti: req.decoded.jti,
            userId: req.user._id,
            expiresIn: Date.now() - req.decoded.exp,
          },
        ],
      });
      status = 201;
    case LogoutTypeEnum.LogoutFromAll:
      await updateOne({
        model: userModel,
        filter: { _id: req.user._id },
        update: { changeCredentialsTime: Date.now() },
      });
      status = 200;
  }
  return successResponse({
    res,
    message: "Logout Successfully",
    statusCode: status,
  });
};
