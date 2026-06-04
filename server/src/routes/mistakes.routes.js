import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { Mistake } from "../models/Mistake.js";
import { TopicProficiency } from "../models/TopicProficiency.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const router = Router();

const mistakeSchema = z.object({
  problemTitle: z.string().min(2).max(180),
  problemSlug: z.string().max(160).optional().default(""),
  topic: z.string().min(2).max(80),
  pattern: z.string().max(100).optional().default("General"),
  mistakeType: z.enum(["concept", "edge-case", "implementation", "complexity", "pattern-choice", "dry-run"]),
  rootCause: z.string().min(5).max(900),
  correction: z.string().max(900).optional().default(""),
  severity: z.coerce.number().min(1).max(5).default(3),
  nextReviewAt: z.coerce.date().optional()
});

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const mistakes = await Mistake.find({ user: req.user._id }).sort({ status: 1, nextReviewAt: 1, createdAt: -1 });
    res.json({ mistakes });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = mistakeSchema.parse(req.body);
    const nextReviewAt = input.nextReviewAt || nextReviewDate(0, input.severity);
    const mistake = await Mistake.create({ ...input, nextReviewAt, user: req.user._id });
    res.status(201).json({ mistake });
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const input = mistakeSchema.partial().extend({ status: z.enum(["open", "reviewing", "resolved"]).optional() }).parse(req.body);
    const mistake = await Mistake.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, input, { new: true });
    if (!mistake) throw new ApiError(404, "Mistake not found.");
    res.json({ mistake });
  })
);

router.post(
  "/:id/review",
  asyncHandler(async (req, res) => {
    const body = z.object({
      resolved: z.boolean().optional().default(false),
      rating: z.enum(["failed", "hint", "easy"]).optional().default("hint"),
      note: z.string().max(900).optional()
    }).parse(req.body);

    const mistake = await Mistake.findOne({ _id: req.params.id, user: req.user._id });
    if (!mistake) throw new ApiError(404, "Mistake not found.");

    // Fetch or create user topic proficiency
    let prof = await TopicProficiency.findOne({ user: req.user._id, topic: mistake.topic });
    if (!prof) {
      prof = new TopicProficiency({ user: req.user._id, topic: mistake.topic, score: 0.5 });
    }

    const rating = body.rating;
    const q = { failed: 1, hint: 3, easy: 5 }[rating];

    // Adjust topic proficiency based on user performance
    if (q === 5) {
      prof.score = Math.min(1.0, prof.score + 0.05);
    } else if (q === 1) {
      prof.score = Math.max(0.0, prof.score - 0.10);
    }
    await prof.save();

    // Adjust SM-2 Easiness Factor (EF)
    const newEF = mistake.easinessFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    mistake.easinessFactor = Math.max(1.3, newEF);

    if (q < 3) {
      mistake.reviewCount = 1;
    } else {
      mistake.reviewCount += 1;
    }

    // Apply Weakness Priority Multiplier: 0.5 for weakest (0.0), 1.0 for mastered (1.0)
    const priorityMultiplier = 0.5 + (0.5 * prof.score);

    // Calculate base interval
    let baseInterval = 1;
    if (mistake.reviewCount === 2) {
      baseInterval = 6;
    } else if (mistake.reviewCount > 2) {
      baseInterval = Math.round((mistake.reviewCount - 1) * mistake.easinessFactor);
    }

    const severityPull = Math.max(0, 5 - mistake.severity);
    const adaptedInterval = Math.max(1, Math.round((baseInterval - severityPull) * priorityMultiplier));

    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + adaptedInterval);

    mistake.lastReviewedAt = new Date();
    mistake.status = body.resolved ? "resolved" : "reviewing";
    mistake.nextReviewAt = body.resolved ? undefined : nextReviewAt;

    if (body.note) mistake.correction = `${mistake.correction || ""}\n${body.note}`.trim();
    await mistake.save();

    res.json({ mistake, topicProficiency: prof.score });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const result = await Mistake.deleteOne({ _id: req.params.id, user: req.user._id });
    if (!result.deletedCount) throw new ApiError(404, "Mistake not found.");
    res.status(204).send();
  })
);

export default router;
