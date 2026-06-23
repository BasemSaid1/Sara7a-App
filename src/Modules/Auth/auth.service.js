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
import { create, findOne } from "./../../DB/db.repository.js";
import userModel from "./../../DB/Models/user.model.js";
import { getNewLoginCredentials } from "../../Utils/tokens/token.js";
import { CLIENT_ID } from "../../../Config/config.service.js";
import { ProviderEnum } from "../../Utils/enums/user.enum.js";

export const signup = async (req, res) => {
  const { userName, email, password, phone } = req.body;

  const userExists = await findOne({ model: userModel, filter: { email } });

  if (userExists) throw ConflictException({ message: "User already exists" });

  // hash pass

  let hashedPassword = await generateHash({
    plainText: password,
    algorithm: hashEnum.Bcrypt,
  });

  // encrypted phone number

  const encryptedPhone = encrypt(phone);

  const user = await create({
    model: userModel,
    data: [
      { userName, email, password: hashedPassword, phone: encryptedPhone },
    ],
  });

  return successResponse({
    res,
    statusCode: 201,
    message: "User created successfully",
    data: user,
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await findOne({
    model: userModel,
    filter: { email },
  });

  if (!user) throw NotFoundException({ message: "User not found" });

  const isMatch = await compareHash({
    plainText: password,
    hashedText: user.password,
    algorithm: hashEnum.Bcrypt,
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

// export const refreshToken = async (req, res) => {
//   // i need access token only
//   const tokens = await getNewLoginCredentials(req.user);

//   successResponse({
//     res,
//     statusCode: 200,
//     message: "Done",
//     data: { tokens },
//   });
// };

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
