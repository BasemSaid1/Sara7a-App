import Joi from "joi";
import { Types } from "mongoose";
import { BadRequestException } from "../Utils/response/error.response.js";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "../Utils/enums/user.enum.js";

export const generalFields = {
  userName: Joi.string().min(3).max(25).messages({
    "string.min": "Username must be at least 3 characters",
    "string.max": "Username must be at most 25 characters",
    "any.required": "Username is required",
  }),

  email: Joi.string()
    .email({
      minDomainSegments: 2,
      maxDomainSegments: 5,
      tlds: {
        allow: ["com", "net", "org"],
      },
    })
    .messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base":
        "Password must contain uppercase, lowercase, number, and special character",
      "any.required": "Password is required",
    }),

  comfirmPassword: Joi.string().valid(Joi.ref("password")),

  phone: Joi.string()
    .pattern(/^(\+20)?01[0125]\d{8}$/)
    .messages({
      "string.pattern.base": "Invalid phone number format",
    }),

  gender: Joi.string().valid(...Object.values(GenderEnum)),
  role: Joi.string().valid(...Object.values(RoleEnum)),
  provider: Joi.string().valid(...Object.values(ProviderEnum)),
  DOB: Joi.string().isoDate(),
  confirmEmail: Joi.string().isoDate(),
  profilePicture: Joi.string(),
  coverPictures: Joi.array().items(Joi.string()),
  id: Joi.string().custom((value, helper) => {
    return (
      Types.ObjectId.isValid(value) || helper.message("Invalid Objectid Format")
    );
  }),
};

export const validation = (schema) => {
  return (req, res, next) => {
    // const validationErrors = [];
    // const reqData = Object.keys(schema);

    // reqData.forEach((ele) => {
    //   const validationRes = schema[ele].validate(req[ele], {
    //     abortEarly: false,
    //   });
    //   if (validationRes.error) {
    //     validationErrors.push(validationRes.error);
    //   }
    // });

    // if (validationErrors.length > 0) {
    //   return res.status(400).json({
    //     message: validationErrors,
    //   });
    // }

    const validationErrors = [];

    for (const ele of Object.keys(schema)) {
      const validationRes = schema[ele].validate(req[ele], {
        abortEarly: false,
      });
      if (validationRes.error) {
        validationErrors.push({ ele, details: validationRes.error.details });
      }

      if (validationErrors.length > 0) {
        // return res.status(400).json({
        //   message: validationErrors,
        // });
        throw BadRequestException({
          message: "validationErrors",
          validationErrors,
        });
      }
    }
    next();
  };
};
