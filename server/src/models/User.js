import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false
    },
    refreshTokenHash: {
      type: String,
      select: false
    },
    tokenVersion: {
      type: Number,
      default: 0
    },
    leetcodeUsername: {
      type: String,
      trim: true,
      maxlength: 80
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light"
    },
    lastLoginAt: Date
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
