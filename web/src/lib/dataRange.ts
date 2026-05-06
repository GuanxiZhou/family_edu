import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../db/schema.js";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const db = drizzle(pool, { schema });