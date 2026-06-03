import mongoose from "mongoose";

const leetcodeSnapshotSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    username: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    profile: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    counts: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    calendar: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    recentSubmissions: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    recentAccepted: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    topicInsights: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    raw: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

leetcodeSnapshotSchema.index({ user: 1, createdAt: -1 });

export const LeetcodeSnapshot = mongoose.model("LeetcodeSnapshot", leetcodeSnapshotSchema);
