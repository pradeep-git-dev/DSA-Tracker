import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import fs from "fs";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { ZodError } from "zod";
import { env } from "./config/env.js";
import { apiLimiter, sanitizeMongoPayload } from "./middleware/security.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { ApiError } from "./utils/ApiError.js";
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import mistakeRoutes from "./routes/mistakes.routes.js";
import revisionRoutes from "./routes/revisions.routes.js";
import patternRoutes from "./routes/patterns.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../../dist");
const clientIndexPath = path.join(distPath, "index.html");

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(
    helmet({
      contentSecurityPolicy: env.nodeEnv === "production" ? undefined : false,
      crossOriginEmbedderPolicy: false
    })
  );
  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: "64kb" }));
  app.use(cookieParser());
  app.use(sanitizeMongoPayload);
  app.use(apiLimiter);

  if (env.nodeEnv !== "test") {
    app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
  }

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/mistakes", mistakeRoutes);
  app.use("/api/revisions", revisionRoutes);
  app.use("/api/patterns", patternRoutes);

  if (fs.existsSync(clientIndexPath)) {
    app.use(express.static(distPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      return res.sendFile(clientIndexPath);
    });
  } else {
    app.get("/", (_req, res) => {
      res.json({
        app: "DSA Tracker API",
        status: "running",
        client: env.clientOrigin,
        health: "/api/health",
        note: "Run npm run client for the React app, or npm run build to let this API serve the built client."
      });
    });
  }

  app.use(notFound);
  app.use((error, req, res, next) => {
    if (error instanceof ZodError) {
      return next(new ApiError(400, "Validation failed.", error.flatten()));
    }
    return next(error);
  });
  app.use(errorHandler);

  return app;
}
