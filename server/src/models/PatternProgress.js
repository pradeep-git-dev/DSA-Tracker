import mongoose from "mongoose";

const patternProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    pattern: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    status: {
      type: String,
      enum: ["not-started", "learning", "practicing", "complete"],
      default: "not-started"
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    solvedCount: {
      type: Number,
      min: 0,
      default: 0
    },
    lastPracticedAt: Date
  },
  { timestamps: true }
);

patternProgressSchema.index({ user: 1, pattern: 1 }, { unique: true });

export const PatternProgress = mongoose.model("PatternProgress", patternProgressSchema);
