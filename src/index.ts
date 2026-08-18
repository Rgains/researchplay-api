import { webcrypto } from "node:crypto";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import problemRoutes from "./routes/problems";
import briefRoutes from "./routes/briefs";
import agreementRoutes from "./routes/agreements";
import milestoneRoutes from "./routes/milestones";
import recordRoutes from "./routes/records";
import projectRoutes from "./routes/projects";
import budgetRoutes from "./routes/budget";
import adminRoutes from "./routes/admin";
import bidRoutes from "./routes/bids";
import accountRoutes from "./routes/account";
import onboardingRoutes from "./routes/onboarding";
import { dbconnect } from "./store/db";
import logger from "./utils/logger";
import { currentConfig } from './utils/config';
import cookieParser from "cookie-parser";

// MongoDB driver v7 uses the Web Crypto global, which Node 18 does not
// provide by default. Node 20 exposes this natively.
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, "crypto", { value: webcrypto });
}

const app = express();

app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) =>
  res.json({ ok: true, service: "openbrief-api" }),
);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/accounts", accountRoutes);
app.use("/api/v1/bids", bidRoutes);
app.use("/api/v1/budgets", budgetRoutes);
app.use("/api/v1/onboarding", onboardingRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/briefs", briefRoutes);
app.use("/api/v1/agreements", agreementRoutes);
app.use("/api/v1/milestones", milestoneRoutes);
app.use("/api/v1/records", recordRoutes);

// Admin Routes
app.use("/api/v1/admin", adminRoutes);

const PORT = Number(currentConfig.port ?? 4000);

const bootstrap = async () => {
  await dbconnect();
  app.listen(PORT, () => console.log(`OpenBrief API on :${currentConfig.port}`));
  //console.log(currentConfig);
  logger.info("Application Started");
};

bootstrap();

export default app;
