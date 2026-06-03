import { ApiError } from "../utils/ApiError.js";
import { env } from "../config/env.js";

export function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const isOperational = error instanceof ApiError;

  res.status(statusCode).json({
    error: isOperational ? error.message : "Something went wrong.",
    details: isOperational ? error.details : undefined,
    stack: env.nodeEnv === "development" ? error.stack : undefined
  });
}
