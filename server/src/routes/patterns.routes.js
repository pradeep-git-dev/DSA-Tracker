import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { PatternProgress } from "../models/PatternProgress.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const patternSchema = z.object({
  pattern: z.string().min(2).max(100),
  topic: z.string().min(2).max(80),
  status: z.enum(["not-started", "learning", "practicing", "complete"]).default("learning"),
  confidence: z.coerce.number().min(0).max(100).default(25),
  solvedCount: z.coerce.number().min(0).default(0)
});

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const patterns = await PatternProgress.find({ user: req.user._id }).sort({ status: 1, confidence: 1 });
    res.json({ patterns });
  })
);

router.put(
  "/",
  asyncHandler(async (req, res) => {
    const input = patternSchema.parse(req.body);
    const pattern = await PatternProgress.findOneAndUpdate(
      { user: req.user._id, pattern: input.pattern },
      {
        ...input,
        user: req.user._id,
        lastPracticedAt: input.solvedCount > 0 ? new Date() : undefined
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ pattern });
  })
);

export default router;
