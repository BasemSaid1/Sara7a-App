import jwt from "jsonwebtoken";
import { RoleEnum, signatureEnum } from "../enums/user.enum.js";
import {
  ACCESS_TOKEN_ADMIN_EXPIRES_IN,
  ACCESS_TOKEN_USER_EXPIRES_IN,
  ACCESS_TOKEN_USER_SECRET,
  ACCESS_TOKEN_ADMIN_SECRET,
  REFRESH_TOKEN_ADMIN_SECRET,
  REFRESH_TOKEN_ADMIN_EXPIRES_IN,
  REFRESH_TOKEN_USER_EXPIRES_IN,
  REFRESH_TOKEN_USER_SECRET,
} from "../../../Config/config.service.js";

export const generateToken = ({ payload, secretKey, options }) => {
  return jwt.sign(payload, secretKey, options);
};

export const verifyToken = ({ token, secretKey }) => {
  return jwt.verify(token, secretKey);
};

export const getSignature = ({ signatureLevel = signatureEnum.User }) => {
  let signature = { accessSignature: undefined, refreshSignature: undefined };

  switch (signatureLevel) {
    case signatureEnum.Admin:
      signature.accessSignature = ACCESS_TOKEN_ADMIN_SECRET;
      signature.refreshSignature = REFRESH_TOKEN_ADMIN_SECRET;
      break;
    case signatureEnum.User:
      signature.accessSignature = ACCESS_TOKEN_USER_SECRET;
      signature.refreshSignature = REFRESH_TOKEN_USER_SECRET;
      break;
    default:
      signature.accessSignature = ACCESS_TOKEN_USER_SECRET;
      signature.refreshSignature = REFRESH_TOKEN_USER_SECRET;
      break;
  }

  return signature;
};

export const getNewLoginCredentials = async (user) => {
  const signature = await getSignature({
    signatureLevel:
      user.role != RoleEnum.Admin ? signatureEnum.User : signatureEnum.Admin,
  });

  const accessToken = generateToken({
    payload: { id: user._id },
    secretKey: signature.accessSignature,
    options: {
      expiresIn:
        user.role != RoleEnum.Admin
          ? Number(ACCESS_TOKEN_USER_EXPIRES_IN)
          : Number(ACCESS_TOKEN_ADMIN_EXPIRES_IN),
    },
  });
  const refreshToken = generateToken({
    payload: { id: user._id },
    secretKey: signature.refreshSignature,
    options: {
      expiresIn:
        user.role != RoleEnum.Admin
          ? Number(REFRESH_TOKEN_USER_EXPIRES_IN)
          : Number(REFRESH_TOKEN_ADMIN_EXPIRES_IN),
    },
  });

  return { accessToken, refreshToken };
};
