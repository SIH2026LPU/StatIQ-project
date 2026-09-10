import { getDb } from "../db";

async function main() {
  const db = getDb();
  console.log("Altering tutor_conversations...");

  try {
    // Drop the old constraint
    await db.execute(`ALTER TABLE "tutor_conversations" DROP CONSTRAINT IF EXISTS "tutor_conversations_employee_id_employees_id_fk";`);
    
    // Rename the column
    await db.execute(`ALTER TABLE "tutor_conversations" RENAME COLUMN "employee_id" TO "user_id";`);
    
    // Add the new constraint
    await db.execute(`ALTER TABLE "tutor_conversations" ADD CONSTRAINT "tutor_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE cascade ON UPDATE no action;`);

    // Rename the index
    await db.execute(`ALTER INDEX IF EXISTS "tutor_conversations_employee_idx" RENAME TO "tutor_conversations_user_idx";`);

    console.log("Successfully altered tutor_conversations to use user_id.");
  } catch (error) {
    console.error("Error altering table:", error);
  }
  process.exit(0);
}

main();
