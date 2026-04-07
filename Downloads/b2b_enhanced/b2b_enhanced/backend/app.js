import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import buyerRoutes from "./routes/buyer.js";
import supplierRoutes from "./routes/supplier.js";
import adminRoutes from "./routes/admin.js";
import rfqRoutes from "./routes/rfq.js";
import leadRoutes from "./routes/lead.js";
import { createAdminUser } from "./controllers/adminSetup.js";
import { sanitizeInput } from "./middleware/sanitizeInput.js";
import { notFoundHandler, globalErrorHandler } from "./middleware/errorHandlers.js";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.length === 0) return true;

  const normalizedOrigin = origin.replace(/\/+$/, "");
  return allowedOrigins.some((entry) => {
    // Support wildcard domains in env like: https://*.vercel.app
    if (entry.includes("*.")) {
      const escaped = entry.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
      const regexPattern = `^${escaped.replace("\\*\\.", "([^.]+\\.)*")}$`;
      return new RegExp(regexPattern, "i").test(normalizedOrigin);
    }
    return entry.toLowerCase() === normalizedOrigin.toLowerCase();
  });
};

app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {
      if (isOriginAllowed(origin)) {
        return cb(null, true);
      }
      return cb(new Error("CORS blocked for this origin"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: process.env.BODY_LIMIT || "1mb" }));
app.use(express.urlencoded({ extended: true, limit: process.env.BODY_LIMIT || "1mb" }));
app.use(sanitizeInput);

// General API rate limit
app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    limit: Number(process.env.RATE_LIMIT_MAX || 300),
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
  })
);

// Stricter rate limit for auth endpoints (login/register) — prevents brute force at network layer
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 min
  limit: 20,                   // max 20 attempts per IP per 15 min
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Please try again in 15 minutes." },
});

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// Admin setup (bootstrap first admin)
app.post("/api/setup/admin", createAdminUser);

app.use("/api/auth", authRateLimit, authRoutes);
app.use("/api/buyer", buyerRoutes);
app.use("/api/supplier", supplierRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/rfq", rfqRoutes);
app.use("/api/lead", leadRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
