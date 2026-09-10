import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "postgresql://statiq:statiq@localhost:5432/statiq"
});

async function run() {
  await pool.query(`UPDATE employees SET full_name = 'Ananya Sharma' WHERE full_name = 'Learner Demo'`);
  await pool.query(`UPDATE employees SET full_name = 'Ravi Menon' WHERE full_name = 'Trainer Demo'`);
  await pool.query(`UPDATE employees SET full_name = 'Kavita Iyer' WHERE full_name = 'Admin Demo'`);
  
  console.log("Updated employee names in the database.");
  process.exit(0);
}

run();
