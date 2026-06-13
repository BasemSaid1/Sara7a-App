import { compare, hash } from "bcrypt";
import * as argon2 from "argon2";
import { SALT_ROUNDS } from "../../../Config/config.service.js";
import { hashEnum } from "../enums/security.enum.js";
import { BadRequestException } from "../response/error.response.js";

export const generateHash = async ({
  plainText,
  saltRounds = Number(SALT_ROUNDS),
  algorithm = hashEnum.Bcrypt,
}) => {
  let hashResult = "";
  switch (algorithm) {
    case hashEnum.Bcrypt:
      hashResult = await hash(plainText, saltRounds);
      break;
    case hashEnum.Argon2:
      hashResult = await argon2.hash(plainText);
      break;
    default:
      throw BadRequestException("Unsupported hashing algorithm");
  }
  return hashResult;
};

export const compareHash = async ({
  plainText,
  hashedText,
  algorithm = hashEnum.Bcrypt,
}) => {
  let match = false;
  switch (algorithm) {
    case hashEnum.Bcrypt:
      match = await compare(plainText, hashedText);
      break;
    case hashEnum.Argon2:
      match = await argon2.verify(hashedText, plainText);
      break;
    default:
      throw BadRequestException("Unsupported hashing algorithm");
  }
  return match;
};
