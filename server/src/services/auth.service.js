import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { hashToken, normalizeEmail } from "../utils/crypto.js";

export function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    leetcodeUsername: user.leetcodeUsername || "",
    theme: user.theme,
    createdAt: user.createdAt
  };
}

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      tokenVersion: user.tokenVersion
    },
    env.jwtAccessSecret,
    { expiresIn: env.accessTokenTtl }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      tokenVersion: user.tokenVersion,
      type: "refresh"
    },
    env.jwtRefreshSecret,
    { expiresIn: env.refreshTokenTtl }
  );
}

export function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: "strict",
    path: "/api/auth/refresh",
    maxAge: 7 * 24 * 60 * 60 * 1000
  };
}

export async function issueTokens(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  return { accessToken, refreshToken };
}

export async function registerUser({ name, email, password, leetcodeUsername }) {
  const normalizedEmail = normalizeEmail(email);
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new ApiError(409, "An account already exists for this email.");
  }

  const normalizedUsername = leetcodeUsername.trim();
  const existingLeetcode = await User.findOne({
    leetcodeUsername: { $regex: new RegExp(`^${normalizedUsername}$`, "i") }
  });
  if (existingLeetcode) {
    throw new ApiError(409, "This LeetCode username is already registered to another account.");
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptRounds);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    leetcodeUsername: normalizedUsername
  });

  const tokens = await issueTokens(user);
  return { user: publicUser(user), ...tokens };
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email: normalizeEmail(email) }).select("+passwordHash +refreshTokenHash");
  if (!user) {
    throw new ApiError(401, "Invalid email or password.");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password.");
  }

  user.lastLoginAt = new Date();
  const tokens = await issueTokens(user);
  return { user: publicUser(user), ...tokens };
}

export async function rotateRefreshToken(refreshToken) {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is missing.");
  }

  let payload;
  try {
    payload = jwt.verify(refreshToken, env.jwtRefreshSecret);
  } catch {
    throw new ApiError(401, "Refresh token is invalid or expired.");
  }

  if (payload.type !== "refresh") {
    throw new ApiError(401, "Invalid token type.");
  }

  const user = await User.findById(payload.sub).select("+refreshTokenHash");
  if (!user || user.tokenVersion !== payload.tokenVersion) {
    throw new ApiError(401, "Invalid refresh session.");
  }

  if (user.refreshTokenHash !== hashToken(refreshToken)) {
    user.tokenVersion += 1;
    user.refreshTokenHash = undefined;
    await user.save();
    throw new ApiError(401, "Refresh token reuse detected. Please log in again.");
  }

  const tokens = await issueTokens(user);
  return { user: publicUser(user), ...tokens };
}

export async function revokeRefreshToken(userId) {
  await User.findByIdAndUpdate(userId, {
    $unset: { refreshTokenHash: "" },
    $inc: { tokenVersion: 1 }
  });
}
