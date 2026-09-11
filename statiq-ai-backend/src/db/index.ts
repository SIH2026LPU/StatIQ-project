import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  // eslint-disable-next-line no-var
  var __statiq_pg_client: postgres.Sql | undefined;
}

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const client =
    global.__statiq_pg_client ??
    postgres(connectionString, {
      max: process.env.NODE_ENV === "production" ? 5 : 1,
      idle_timeout: 10,
      connect_timeout: 1,
    });

  if (process.env.NODE_ENV !== "production") {
    global.__statiq_pg_client = client;
  }

  return drizzle(client, { schema });
}

/** Prefer getDb() — kept for existing imports */
export const db = new Proxy({} as ReturnType<typeof getDb>, {
  get(_target, prop, receiver) {
    return Reflect.get(getDb() as object, prop, receiver);
  },
});

export { schema };
