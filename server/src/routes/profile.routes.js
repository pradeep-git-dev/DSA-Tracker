import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { leetcodeLimiter } from "../middleware/security.js";
import { LeetcodeSnapshot } from "../models/LeetcodeSnapshot.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { fetchLeetcodeProfile } from "../services/leetcode.service.js";
import { buildDashboard } from "../services/analytics.service.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/dashboard",
  asyncHandler(async (req, res) => {
    res.json(await buildDashboard(req.user));
  })
);

router.post(
  "/leetcode/sync",
  leetcodeLimiter,
  asyncHandler(async (req, res) => {
    const username = req.user.leetcodeUsername;
    if (!username) {
      throw new ApiError(400, "No LeetCode username is registered for this account.");
    }

    const { username: reqUsername } = z.object({ username: z.string().min(1).max(80).regex(/^[A-Za-z0-9_-]+$/) }).parse(req.body);
    if (reqUsername.toLowerCase() !== username.toLowerCase()) {
      throw new ApiError(403, `You can only sync your registered LeetCode username: ${username}`);
    }

    const profile = await fetchLeetcodeProfile(username);

    const snapshot = await LeetcodeSnapshot.create({
      user: req.user._id,
      username: profile.username,
      profile: profile.profile,
      counts: profile.counts,
      calendar: profile.calendar,
      recentSubmissions: profile.recentSubmissions,
      recentAccepted: profile.recentAccepted,
      recentQuestions: profile.recentQuestions,
      topicInsights: profile.topicInsights,
      attemptStats: profile.attemptStats,
      syncQuality: profile.syncQuality,
      raw: profile
    });

    res.status(201).json({ snapshot, dashboard: await buildDashboard(req.user) });
  })
);

router.get(
  "/leetcode/latest",
  asyncHandler(async (req, res) => {
    const snapshot = await LeetcodeSnapshot.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ snapshot });
  })
);

export default router;
