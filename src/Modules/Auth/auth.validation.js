import Joi from "joi";
import { generalFields } from "../../Middlewares/validate.middleware.js";

export const signupSchema = {
  body: Joi.object({
    userName: generalFields.userName.required(),
    email: generalFields.email.required(),
    password: generalFields.password.required(),
    comfirmPassword: generalFields.comfirmPassword,
    phone: generalFields.phone,
    gender: generalFields.gender,
    role: generalFields.role,
    provider: generalFields.provider,
    DOB: generalFields.DOB,
    confirmEmail: generalFields.confirmEmail,
    profilePicture: generalFields.profilePicture,
    coverPictures: generalFields.coverPictures,
  }),
};

export const loginSchema = {
  body: Joi.object({
    email: generalFields.email.required(),
    password: generalFields.password.required(),
  }),
};

export const confirmEmailSchema = {
  body: Joi.object({
    email: generalFields.email.required(),
    otp: Joi.string().pattern(/^\d{6}$/),
  }),
};

export const forgetPasswordSchema = {
  body: Joi.object({
    email: generalFields.email.required(),
  }),
};

export const resetPasswordSchema = {
  body: Joi.object({
    email: generalFields.email.required(),
    otp: Joi.string().pattern(/^\d{6}$/),
    newPassword: generalFields.password.required(),
  }),
};

export const loginWithGoogleSchema = {
  body: Joi.object({
    idToken: Joi.string().required().messages({
      "any.required": "Google ID token is required",
    }),
  }),
};
