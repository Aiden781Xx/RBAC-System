import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, "..", ".env");
const result = dotenv.config({ path: envPath });
if (result.error && process.env.NODE_ENV !== "production") {
  console.warn("Dotenv load warning:", result.error.message);
}

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!uri) {
  console.warn("MONGODB_URI or MONGO_URI not set. Set env or add to backend/.env");
}

beforeAll(async () => {
  if (uri && mongoose.connection.readyState === 0) {
    await mongoose.connect(uri);
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});
