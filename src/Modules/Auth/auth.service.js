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

  if (user.phone) user.phone = decrypt(user.phone);

  return successResponse({
    res,
    statusCode: 200,
    message: "User logged in successfully",
    data: { user },
  });
};
