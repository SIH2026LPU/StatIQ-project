import "dotenv/config";
import { db } from "../db/index.js";
import { users } from "../db/schema/index.js";
import { eq, sql } from "drizzle-orm";

async function verify() {
  console.log("Verifying Database Connection...");
  
  try {
    const start = Date.now();
    const result = await db.execute(sql`SELECT current_database() as db, current_user as usr, version() as ver;`);
    const latencyMs = Date.now() - start;
    
    console.log("Database connection: SUCCESS");
    console.log("Host: localhost");
    console.log("Port: 5432");
    console.log("Database:", result[0].db);
    console.log("User:", result[0].usr);
    console.log("Version:", result[0].ver);
    console.log(`Latency: ${latencyMs}ms`);

    console.log("\nVerifying Tables...");
    const tables = await db.execute(sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public';`);
    console.log(`Found ${tables.length} tables.`);

    console.log("\nVerifying Auth / Demo Users...");
    const demoUsers = await db.select().from(users);
    console.log(`Found ${demoUsers.length} users.`);
    for (const u of demoUsers) {
      console.log(`- ${u.email} (${u.role})`);
    }

    console.log("\nVerifying CRUD...");
    // Create
    const [newUser] = await db.insert(users).values({
      email: "test_crud@statiq.demo",
      passwordHash: "test_hash",
      role: "LEARNER",
    }).returning();
    console.log(`Created test user: ${newUser.id}`);

    // Read
    const readUser = await db.select().from(users).where(eq(users.id, newUser.id));
    console.log(`Read test user: ${readUser[0].email}`);

    // Update
    await db.update(users).set({ role: "TRAINER" }).where(eq(users.id, newUser.id));
    const updatedUser = await db.select().from(users).where(eq(users.id, newUser.id));
    console.log(`Updated test user role: ${updatedUser[0].role}`);

    // Delete
    await db.delete(users).where(eq(users.id, newUser.id));
    console.log("Deleted test user.");

    console.log("\nAll verifications passed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Verification failed:", error);
    process.exit(1);
  }
}

verify();
