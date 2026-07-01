import Joi from "joi";
import { generalFields } from "../../Middlewares/validate.middleware.js";

export const updatePasswordSchema = {
  body: Joi.object({
    oldPassword: generalFields.password.required(),
    newPassword: generalFields.password.required(),
    confirmNewPassword: generalFields.comfirmPassword,
  }),
};
