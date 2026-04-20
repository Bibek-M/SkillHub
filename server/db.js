import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
});

pool.on("error", (err) => {
  console.error("Neon Pool Error:", err.message);
});
