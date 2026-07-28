import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { ensureSchema } from "./db.js";
import papersRouter from "./routes/papers.js";
import analyticsRouter from "./routes/analytics.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : "*";

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/papers", papersRouter);
app.use("/api/analytics", analyticsRouter);

async function start() {
  try {
    await ensureSchema();
    console.log("Database schema ready.");
  } catch (err) {
    console.error("Failed to set up database schema:", err.message);
  }
  app.listen(PORT, () => console.log(`API server running on port ${PORT}`));
}

start();
