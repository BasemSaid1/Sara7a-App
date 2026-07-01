import { findById, findOne } from "../DB/db.repository.js";
import userModel from "../DB/Models/user.model.js";
import { signatureEnum, TokenTypeEnum } from "../Utils/enums/user.enum.js";
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from "../Utils/response/error.response.js";
import { getSignature, verifyToken } from "../Utils/tokens/token.js";
import TokenModel from "./../DB/Models/token.model.js";

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

  // check is token is revoke => logout

  const isRevoked = await findOne({
    model: TokenModel,
    filter: { jti: decoded.jti },
  });

  if (isRevoked) {
    throw UnauthorizedException({ message: "Token Is Revoked" });
  }

  const user = await findById({
    model: userModel,
    id: decoded.id,
  });

  if (!user) throw NotFoundException({ message: "user not found" });

  if ((user.changeCredentialsTime?.getTime() || 0) > decoded.iat * 1000) {
    throw UnauthorizedException({ message: "Token Is Expired" });
  }

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
    }
    return next();
  };
};
