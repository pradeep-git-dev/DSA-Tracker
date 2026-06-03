import mongoose from "mongoose";

const revisionSessionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160
    },
    focusTopic: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    pattern: {
      type: String,
      trim: true,
      maxlength: 100
    },
    scheduledFor: {
      type: Date,
      required: true,
      index: true
    },
    durationMinutes: {
      type: Number,
      min: 15,
      max: 180,
      default: 45
    },
    mistakeRefs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mistake"
      }
    ],
    plan: {
      type: String,
      required: true,
      maxlength: 1200
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "skipped"],
      default: "scheduled",
      index: true
    },
    completedAt: Date,
    reflection: {
      type: String,
      trim: true,
      maxlength: 900
    }
  },
  { timestamps: true }
);

revisionSessionSchema.index({ user: 1, scheduledFor: 1, status: 1 });

export const RevisionSession = mongoose.model("RevisionSession", revisionSessionSchema);
