import mongoose from "mongoose";

const mistakeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    problemTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180
    },
    problemSlug: {
      type: String,
      trim: true,
      maxlength: 160
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    pattern: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    mistakeType: {
      type: String,
      enum: ["concept", "edge-case", "implementation", "complexity", "pattern-choice", "dry-run"],
      required: true
    },
    rootCause: {
      type: String,
      required: true,
      trim: true,
      maxlength: 900
    },
    correction: {
      type: String,
      trim: true,
      maxlength: 900
    },
    severity: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    status: {
      type: String,
      enum: ["open", "reviewing", "resolved"],
      default: "open",
      index: true
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    easinessFactor: {
      type: Number,
      default: 2.5
    },
    nextReviewAt: {
      type: Date,
      index: true
    },
    lastReviewedAt: Date
  },
  { timestamps: true }
);

mistakeSchema.index({ user: 1, topic: 1, status: 1 });
mistakeSchema.index({ user: 1, nextReviewAt: 1 });

export const Mistake = mongoose.model("Mistake", mistakeSchema);
