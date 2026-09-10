import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "postgresql://statiq:statiq@localhost:5432/statiq"
});

async function run() {
  await pool.query(`UPDATE employees SET is_synthetic = false`);
  
  console.log("Updated is_synthetic flag for all employees.");
  process.exit(0);
}

run();
