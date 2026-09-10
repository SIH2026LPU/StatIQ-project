import "dotenv/config";
import { getDb } from "./src/db/client";
import { sql } from "drizzle-orm";

async function run() {
  const db = getDb();
  const c = await db.execute(sql`SELECT count(*) from competencies;`);
  const a = await db.execute(sql`SELECT count(*) from assessments;`);
  const q = await db.execute(sql`SELECT count(*) from questions;`);
  console.log("Competencies:", c[0].count);
  console.log("Assessments:", a[0].count);
  console.log("Questions:", q[0].count);
  process.exit(0);
}
run();
