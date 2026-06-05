import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(env.mongoUri, {
      autoIndex: env.nodeEnv !== "production",
      serverSelectionTimeoutMS: 5000 // Fail fast if unreachable
    });
    console.log("Connected to MongoDB Atlas.");
  } catch (error) {
    console.warn("MongoDB Atlas connection failed. Falling back to local MongoDB...", error.message);
    const localUri = "mongodb://127.0.0.1:27017/dsa_tracker";
    await mongoose.connect(localUri, {
      autoIndex: env.nodeEnv !== "production"
    });
    console.log("Connected to Local MongoDB:", localUri);
  }
}
