import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

export function sanitizeMongoPayload(req, _res, next) {
  const sanitize = (value) => {
    if (!value || typeof value !== "object") return value;
    if (Array.isArray(value)) return value.map(sanitize);

    return Object.entries(value).reduce((clean, [key, child]) => {
      if (key.startsWith("$") || key.includes(".")) return clean;
      clean[key] = sanitize(child);
      return clean;
    }, {});
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
}

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: true,
  legacyHeaders: false
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 25,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => next(new ApiError(429, "Too many auth attempts. Try again soon."))
});

export const leetcodeLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => next(new ApiError(429, "LeetCode sync is rate limited. Try again in a minute."))
});
