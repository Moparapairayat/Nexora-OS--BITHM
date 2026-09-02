import cors from "cors";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";
import { academicShieldRouter } from "./modules/academic-shield/academic-shield.routes.js";
import { adminRouter } from "./modules/admin/admin.routes.js";
import { authRouter, usersRouter } from "./modules/auth/auth.routes.js";
import { codeLabRouter } from "./modules/code-lab/code-lab.routes.js";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes.js";
import { dataRouter } from "./modules/data/data.routes.js";
import { diagramsRouter } from "./modules/diagrams/diagrams.routes.js";
import { opsRouter } from "./modules/ops/ops.routes.js";
import { uploadsRouter } from "./modules/uploads/uploads.routes.js";

export const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigins.length === 1 ? env.corsOrigins[0] : env.corsOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Please try again later." },
});

app.use((_request, response, next) => {
  response.setHeader("X-Nexora-Trace-Id", `trace-${Date.now()}`);
  next();
});

function healthPayload() {
  return {
    ok: true,
    service: "nexora-api",
    mode: env.aiMode,
    dataMode: env.dataMode,
    storageMode: env.storageMode,
    uptimeSeconds: Math.round(process.uptime()),
  };
}

app.get("/health", (_request, response) => {
  response.json(healthPayload());
});

app.get("/api/health", (_request, response) => {
  response.json({
    ...healthPayload(),
    apiPath: "/api/health",
  });
});

app.use("/api/auth", authRateLimiter, authRouter);
app.use("/api/users", usersRouter);
app.use("/api/admin", adminRouter);
app.use("/api/code-lab", codeLabRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/data", dataRouter);
app.use("/api/diagrams", diagramsRouter);
app.use("/api/ops", opsRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/plagiarism", academicShieldRouter);
app.use("/api/writing", academicShieldRouter);
app.use("/api/citations", academicShieldRouter);

app.use((request, response) => {
  response.status(404).json({
    error: "Route not found",
    path: request.path,
  });
});
