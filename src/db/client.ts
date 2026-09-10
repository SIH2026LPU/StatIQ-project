import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@/db/schema";

let cached: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function hasPostgres() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Start docker compose or set a hosted Postgres URL.");
  }
  if (!cached) {
    const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
    cached = drizzle(sql, { schema });
  }
  return cached;
}
