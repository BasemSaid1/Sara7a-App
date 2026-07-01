import jwt from "jsonwebtoken";
import { successResponse } from "../../Utils/response/success.response.js";
import { decrypt } from "../../Utils/security/encryption.security.js";
import { findByIdAndUpdate, updateOne } from "../../DB/db.repository.js";
import userModel from "./../../DB/Models/user.model.js";
import {
  compareHash,
  generateHash,
} from "../../Utils/security/hash.security.js";
import { hashEnum } from "../../Utils/enums/security.enum.js";
import { BadRequestException } from "../../Utils/response/error.response.js";

export const getProfile = async (req, res) => {
  const { user } = req;

  if (user.phone) req.user.phone = decrypt(user.phone);

  successResponse({
    res,
    message: "data fetched successfully",
    statusCode: 200,
    data: { user },
  });
};

export const updateProfilePicture = async (req, res) => {
  const user = await findByIdAndUpdate({
    model: userModel,
    id: req.user._id,
    update: { profilePicture: req.file.finalPath },
  });
  successResponse({
    res,
    message: "data fetched successfully",
    statusCode: 200,
    data: { user },
  });
};

export const updateCoverPicture = async (req, res) => {
  const user = await findByIdAndUpdate({
    model: userModel,
    id: req.user._id,
    update: { coverPictures: req.files?.map((file) => file.finalPath) },
  });
  successResponse({
    res,
    message: "data fetched successfully",
    statusCode: 200,
    data: { user },
  });
};

export const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const isValidOldPassword = await compareHash({
    plainText: oldPassword,
    hashedText: req.user.password,
    algorithm: hashEnum.Argon2,
  });

  if (!isValidOldPassword)
    throw BadRequestException({ message: "Invalid old password" });

  const newHashedPassword = await generateHash({
    plainText: newPassword,
    algorithm: hashEnum.Argon2,
  });

  await updateOne({
    model: userModel,
    filter: { _id: req.user._id },
    update: {
      password: newHashedPassword,
    },
  });

  return successResponse({
    res,
    message: "Password updated successfully",
    statusCode: 200,
  });
};
