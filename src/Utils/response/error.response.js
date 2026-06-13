import { NODE_ENV } from "../../../Config/config.service.js";

export const ErrorResponse = ({
  message = "Error",
  status = 400,
  extra = undefined,
}) => {
  const error = new Error(
    typeof message === "string" ? message : message?.message,
  );
  error.status = status;
  error.extra = extra;
  throw error;
};

export const BadRequestException = ({
  message = "Bad Request",
  extra = undefined,
}) => {
  return ErrorResponse({ message, status: 400, extra });
};

export const ConflictException = ({
  message = "Conflict",
  extra = undefined,
}) => {
  return ErrorResponse({ message, status: 409, extra });
};

export const NotFoundException = ({
  message = "Not Found",
  extra = undefined,
}) => {
  return ErrorResponse({ message, status: 404, extra });
};

export const UnauthorizedException = ({
  message = "Unauthorized",
  extra = undefined,
}) => {
  return ErrorResponse({ message, status: 401, extra });
};

export const ForbiddenException = ({
  message = "Forbidden",
  extra = undefined,
}) => {
  return ErrorResponse({ message, status: 403, extra });
};

export const globalErrorHandler = (err, req, res, next) => {
  const status = err.status ?? 500;
  return res.status(status).json({
    message: err.message,
    stack: err.stack,
    // NODE_ENV: NODE_ENV === "development" ? err.stack : undefined,
    status,
  });
};
