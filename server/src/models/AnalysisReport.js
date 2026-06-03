import mongoose from "mongoose";

const analysisReportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    mode: {
      type: String,
      enum: ["ai", "rule"],
      required: true
    },
    provider: {
      type: String,
      default: "rule-engine"
    },
    model: {
      type: String,
      default: ""
    },
    report: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    sourceSignals: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

analysisReportSchema.index({ user: 1, createdAt: -1 });

export const AnalysisReport = mongoose.model("AnalysisReport", analysisReportSchema);
