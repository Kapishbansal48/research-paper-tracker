import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "Missing DATABASE_URL. Set it in backend/.env (see .env.example)."
  );
}

// Supabase / most managed Postgres providers require SSL.
export const pool = new Pool({
  connectionString,
  ssl: connectionString && connectionString.includes("localhost")
    ? false
    : { rejectUnauthorized: false },
});

export async function ensureSchema() {
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  await pool.query(schema);
}
