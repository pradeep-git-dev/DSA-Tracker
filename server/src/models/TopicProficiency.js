import mongoose from "mongoose";

const topicProficiencySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    score: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    }
  },
  { timestamps: true }
);

topicProficiencySchema.index({ user: 1, topic: 1 }, { unique: true });

export const TopicProficiency = mongoose.model("TopicProficiency", topicProficiencySchema);
