import { findById } from "../DB/db.repository.js";
import userModel from "../DB/Models/user.model.js";
import { signatureEnum, TokenTypeEnum } from "../Utils/enums/user.enum.js";
import {
  BadRequestException,
  NotFoundException,
} from "../Utils/response/error.response.js";
import { getSignature, verifyToken } from "../Utils/tokens/token.js";

export const decodedToken = async ({
  authorization,
  tokenType = TokenTypeEnum.Access,
}) => {
  const [Bearer, token] = authorization?.split(" ") || [];

  const signature = await getSignature({
    signatureLevel:
      Bearer === "Admin"
        ? signatureEnum.Admin
        : Bearer === "User"
          ? signatureEnum.User
          : new Error("invalid signature"),
  });

  const decoded = verifyToken({
    token,
    secretKey:
      tokenType === TokenTypeEnum.Access
        ? signature.accessSignature
        : signature.refreshSignature,
  });

  const user = await findById({
    model: userModel,
    id: decoded.id,
  });

  if (!user) throw NotFoundException({ message: "user not found" });
  return { user, decoded };
};

// auth middleware

export const authentication = ({ tokenType = TokenTypeEnum.Access }) => {
  return async (req, res, next) => {
    const { user, decoded } =
      (await decodedToken({
        authorization: req.headers.authorization,
        tokenType,
      })) || {};

    req.user = user;
    req.decoded = decoded;
    return next();
  };
};

export const authorization = ({ accessRole = [] }) => {
  return async (req, res, next) => {
    if (!accessRole.includes(req.user.role)) {
      throw BadRequestException("Unauthorized access");

      return next();
    }
  };
};
