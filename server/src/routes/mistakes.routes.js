import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { Mistake } from "../models/Mistake.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const router = Router();

const mistakeSchema = z.object({
  problemTitle: z.string().min(2).max(180),
  problemSlug: z.string().max(160).optional().default(""),
  topic: z.string().min(2).max(80),
  pattern: z.string().min(2).max(100),
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
    const body = z.object({ resolved: z.boolean().optional().default(false), note: z.string().max(900).optional() }).parse(req.body);
    const mistake = await Mistake.findOne({ _id: req.params.id, user: req.user._id });
    if (!mistake) throw new ApiError(404, "Mistake not found.");

    mistake.reviewCount += 1;
    mistake.lastReviewedAt = new Date();
    mistake.status = body.resolved ? "resolved" : "reviewing";
    mistake.nextReviewAt = body.resolved ? undefined : nextReviewDate(mistake.reviewCount, mistake.severity);
    if (body.note) mistake.correction = `${mistake.correction || ""}\n${body.note}`.trim();
    await mistake.save();

    res.json({ mistake });
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

function nextReviewDate(reviewCount, severity) {
  const intervals = [1, 3, 7, 14, 30, 60];
  const severityPull = Math.max(0, 5 - severity);
  const days = Math.max(1, intervals[Math.min(reviewCount, intervals.length - 1)] - severityPull);
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

export default router;
