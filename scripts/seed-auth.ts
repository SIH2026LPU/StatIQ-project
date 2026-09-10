import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { getDb, hasPostgres } from "../src/db/client";
import { users, userProfiles, roles, userRoles, organizations } from "../src/db/schema";
import { randomUUID } from "crypto";

async function main() {
  if (!hasPostgres()) {
    console.error("PostgreSQL connection is required for seeding.");
    process.exit(1);
  }

  const db = getDb();

  console.log("Seeding authentication data...");

  // Seed default organization
  let demoOrg = await db.select().from(organizations).where(eq(organizations.code, "DEMO_ORG")).limit(1);
  let orgId = demoOrg[0]?.id;

  if (!orgId) {
    console.log("Creating DEMO_ORG organization...");
    const result = await db.insert(organizations).values({
      name: "Demo Organization",
      code: "DEMO_ORG",
    }).returning({ id: organizations.id });
    orgId = result[0].id;
  }

  // Seed roles table (if we are using the new roles table alongside the enum)
  const defaultRoles = [
    { name: "SUPER_ADMIN", description: "System administrator with full access" },
    { name: "ORG_ADMIN", description: "Organization level administrator" },
    { name: "TRAINER", description: "Content creator and course instructor" },
    { name: "LEARNER", description: "Platform end-user" },
    { name: "CONTENT_MANAGER", description: "Manages learning content" },
  ];

  for (const role of defaultRoles) {
    const existing = await db.select().from(roles).where(eq(roles.name, role.name)).limit(1);
    if (existing.length === 0) {
      console.log(`Creating role ${role.name}...`);
      await db.insert(roles).values(role);
    }
  }

  // Seed demo users
  const demoUsers = [
    {
      email: "admin@statiq.demo",
      password: "demo123",
      role: "ORG_ADMIN" as const,
      username: "demoadmin",
      firstName: "Kavita",
      lastName: "Iyer",
    },
    {
      email: "orgadmin@statiq.demo",
      password: "demo123",
      role: "ORG_ADMIN" as const,
      username: "orgadmin",
      firstName: "Org",
      lastName: "Admin",
    },
    {
      email: "trainer@statiq.demo",
      password: "demo123",
      role: "TRAINER" as const,
      username: "demotrainer",
      firstName: "Ravi",
      lastName: "Menon",
    },
    {
      email: "learner@statiq.demo",
      password: "demo123",
      role: "LEARNER" as const,
      username: "demolearner",
      firstName: "Ananya",
      lastName: "Sharma",
    },
  ];

  for (const u of demoUsers) {
    const existingUser = await db.select().from(users).where(eq(users.email, u.email)).limit(1);
    
    if (existingUser.length === 0) {
      console.log(`Creating user ${u.email}...`);
      const passwordHash = await hash(u.password, 10);
      
      const insertedUser = await db.insert(users).values({
        email: u.email,
        passwordHash,
        role: u.role,
        organizationId: orgId,
        username: u.username,
        emailVerified: true,
        status: 'ACTIVE',
      }).returning({ id: users.id });
      
      const userId = insertedUser[0].id;
      
      // Create user profile
      await db.insert(userProfiles).values({
        userId,
        firstName: u.firstName,
        lastName: u.lastName,
      });

      // Attach to roles table
      const dbRole = await db.select().from(roles).where(eq(roles.name, u.role)).limit(1);
      if (dbRole[0]) {
        await db.insert(userRoles).values({
          userId,
          roleId: dbRole[0].id,
        });
      }
    } else {
      const passwordHash = await hash(u.password, 10);
      await db.update(users).set({
        passwordHash,
        role: u.role,
        status: "ACTIVE",
        isActive: true,
      }).where(eq(users.id, existingUser[0].id));
      console.log(`User ${u.email} already exists, password reset to demo123.`);
    }
  }

  console.log("Authentication data seeded successfully.");
}

main().catch(console.error).finally(() => process.exit(0));
