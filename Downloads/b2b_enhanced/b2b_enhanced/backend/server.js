import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, ".env");
dotenv.config({ path: envPath });

console.log(`[ENV] loaded from ${envPath}`);

// ── Startup security checks ──────────────────────────────────────
const REQUIRED_ENV = ["MONGODB_URI", "JWT_SECRET"];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(`[FATAL] Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const jwtSecret = process.env.JWT_SECRET || "";
if (jwtSecret.length < 32) {
  console.warn(
    "[SECURITY WARNING] JWT_SECRET is too short (< 32 chars). " +
    "Generate a strong secret: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
  );
}
// ────────────────────────────────────────────────────────────────

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/b2b_db";
const port = process.env.PORT || 5000;

console.log(`[DB] connecting using MONGODB_URI=${uri.startsWith("mongodb://127.0.0.1") ? "local" : uri.startsWith("mongodb+srv") ? "atlas" : "custom"}`);

mongoose
  .connect(uri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

const server = app.listen(port, () => console.log(`Server running on port ${port}`));

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log("MongoDB connection closed");
      process.exit(0);
    });
  });
});

