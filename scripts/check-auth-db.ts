import { getDb, hasPostgres } from "../src/db/client";
import { users, roles, userProfiles } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function verifyAuthDb() {
  if (!hasPostgres()) {
    console.error("PostgreSQL not connected.");
    process.exit(1);
  }

  const db = getDb();
  
  console.log("Verifying PostgreSQL authentication database...");

  const allUsers = await db.select().from(users);
  console.log(`Found ${allUsers.length} users in the database.`);

  for (const user of allUsers) {
    console.log(`- ${user.email} (Role: ${user.role}, Username: ${user.username}, Active: ${user.isActive})`);
    
    // Check if profile exists
    const profiles = await db.select().from(userProfiles).where(eq(userProfiles.userId, user.id));
    if (profiles.length > 0) {
      console.log(`  -> Profile found: ${profiles[0].firstName} ${profiles[0].lastName}`);
    } else {
      console.log(`  -> No profile found for this user.`);
    }
  }

  console.log("Verification complete.");
  process.exit(0);
}

verifyAuthDb().catch(console.error);
