import { BadRequestException } from "../Utils/response/error.response.js";

export const validation = (schema) => {
  return (req, res, next) => {
    const validationErrors = [];
    const reqData = Object.keys(schema);

    reqData.forEach((ele) => {
      const validationRes = schema[ele].validate(req[ele], {
        abortEarly: false,
      });
      if (validationRes.error) {
        validationErrors.push(validationRes.error);
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: validationErrors,
      });
    }
    next();
  };
};
