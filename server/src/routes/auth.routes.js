import { Router } from "express";
import { z } from "zod";
import { authLimiter } from "../middleware/security.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  loginUser,
  publicUser,
  refreshCookieOptions,
  registerUser,
  revokeRefreshToken,
  rotateRefreshToken
} from "../services/auth.service.js";
import { User } from "../models/User.js";

const router = Router();

const passwordSchema = z
  .string()
  .min(10)
  .max(128)
  .regex(/[A-Z]/, "Password must include an uppercase letter.")
  .regex(/[a-z]/, "Password must include a lowercase letter.")
  .regex(/[0-9]/, "Password must include a number.")
  .regex(/[^A-Za-z0-9]/, "Password must include a symbol.");

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: passwordSchema,
  leetcodeUsername: z.string().min(1).max(80).regex(/^[A-Za-z0-9_-]+$/)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128)
});

router.post(
  "/register",
  authLimiter,
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const result = await registerUser(input);
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions());
    res.status(201).json({ user: result.user, accessToken: result.accessToken });
  })
);

router.post(
  "/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const result = await loginUser(input);
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions());
    res.json({ user: result.user, accessToken: result.accessToken });
  })
);

router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const result = await rotateRefreshToken(req.cookies.refreshToken);
    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions());
    res.json({ user: result.user, accessToken: result.accessToken });
  })
);

router.post(
  "/logout",
  requireAuth,
  asyncHandler(async (req, res) => {
    await revokeRefreshToken(req.user._id);
    res.clearCookie("refreshToken", { ...refreshCookieOptions(), maxAge: 0 });
    res.status(204).send();
  })
);

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.patch(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = z.object({ theme: z.enum(["light", "dark"]).optional(), name: z.string().min(2).max(80).optional() }).parse(req.body);
    const user = await User.findByIdAndUpdate(req.user._id, input, { new: true });
    res.json({ user: publicUser(user) });
  })
);

export default router;
