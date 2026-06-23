import Joi from "joi";

export const signupSchema = {
  body: Joi.object({
    userName: Joi.string().min(3).max(30).required().messages({
      "string.min": "Username must be at least 3 characters",
      "string.max": "Username must be at most 30 characters",
      "any.required": "Username is required",
    }),

    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),

    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters",
        "string.pattern.base":
          "Password must contain uppercase, lowercase, number, and special character",
        "any.required": "Password is required",
      }),

    phone: Joi.string()
      .pattern(/^(\+20)?01[0125]\d{8}$/)
      .required()
      .messages({
        "string.pattern.base": "Invalid phone number format",
        "any.required": "Phone number is required",
      }),
  }),
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      "string.email": "Invalid email format",
      "any.required": "Email is required",
    }),

    password: Joi.string().required().messages({
      "any.required": "Password is required",
    }),
  }),
};

export const loginWithGoogleSchema = {
  body: Joi.object({
    idToken: Joi.string().required().messages({
      "any.required": "Google ID token is required",
    }),
  }),
};
