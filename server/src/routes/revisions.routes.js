import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { Mistake } from "../models/Mistake.js";
import { RevisionSession } from "../models/RevisionSession.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { buildDashboard } from "../services/analytics.service.js";
import { generateRevisionBlueprint } from "../services/recommendation.service.js";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const revisions = await RevisionSession.find({ user: req.user._id }).sort({ scheduledFor: 1 });
    res.json({ revisions });
  })
);

router.post(
  "/generate",
  asyncHandler(async (req, res) => {
    const dashboard = await buildDashboard(req.user);
    const mistakes = await Mistake.find({ user: req.user._id, status: { $ne: "resolved" } });
    const blueprint = generateRevisionBlueprint({ mistakes, topicInsights: dashboard.topicInsights });

    const created = [];
    for (const [index, item] of blueprint.entries()) {
      const scheduledFor = new Date();
      scheduledFor.setDate(scheduledFor.getDate() + index * 2);

      const existing = await RevisionSession.findOne({
        user: req.user._id,
        focusTopic: item.topic,
        status: "scheduled",
        scheduledFor: { $gte: new Date(Date.now() - 86400000) }
      });

      if (existing) continue;

      created.push(
        await RevisionSession.create({
          user: req.user._id,
          title: `${item.topic} revision`,
          focusTopic: item.topic,
          pattern: item.pattern,
          scheduledFor,
          durationMinutes: item.mistakes.length > 2 ? 60 : 45,
          mistakeRefs: item.mistakes.map((mistake) => mistake._id),
          plan: buildSessionPlan(item)
        })
      );
    }

    res.status(201).json({ revisions: created, dashboard: await buildDashboard(req.user) });
  })
);

router.patch(
  "/:id/complete",
  asyncHandler(async (req, res) => {
    const input = z.object({ reflection: z.string().max(900).optional().default("") }).parse(req.body);
    const revision = await RevisionSession.findOne({ _id: req.params.id, user: req.user._id });
    if (!revision) throw new ApiError(404, "Revision session not found.");

    revision.status = "completed";
    revision.completedAt = new Date();
    revision.reflection = input.reflection;
    await revision.save();

    await Mistake.updateMany(
      { _id: { $in: revision.mistakeRefs }, user: req.user._id },
      { $inc: { reviewCount: 1 }, $set: { lastReviewedAt: new Date(), status: "reviewing" } }
    );

    res.json({ revision });
  })
);

function buildSessionPlan(item) {
  const mistakeLine = item.mistakes.length
    ? `Review ${item.mistakes.length} logged mistake${item.mistakes.length > 1 ? "s" : ""}; rewrite the failed invariant and edge cases.`
    : "Rebuild the core idea from notes, then solve a fresh problem without looking at hints.";

  return `${mistakeLine} Drill pattern: ${item.pattern}. Finish by writing a three-line postmortem: signal missed, fix, and next trigger.`;
}

export default router;
