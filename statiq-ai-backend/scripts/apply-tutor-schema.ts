import postgres from 'postgres';
import 'dotenv/config';

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
  try {
    console.log("Applying tutor schema...");
    await sql`CREATE TYPE "public"."tutor_message_role" AS ENUM('user', 'assistant', 'system');`.catch(e => console.log(e.message));
    
    await sql`
      CREATE TABLE IF NOT EXISTS "tutor_conversations" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "employee_id" uuid NOT NULL,
        "title" varchar(255) DEFAULT 'New Conversation' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "tutor_conversations_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action
      );
    `.catch(e => console.log(e.message));

    await sql`
      CREATE TABLE IF NOT EXISTS "tutor_messages" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "conversation_id" uuid NOT NULL,
        "role" "tutor_message_role" NOT NULL,
        "content" text NOT NULL,
        "source_metadata" jsonb,
        "created_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "tutor_messages_conversation_id_tutor_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."tutor_conversations"("id") ON DELETE cascade ON UPDATE no action
      );
    `.catch(e => console.log(e.message));

    await sql`CREATE INDEX IF NOT EXISTS "tutor_conversations_employee_idx" ON "tutor_conversations" USING btree ("employee_id");`.catch(e => console.log(e.message));
    await sql`CREATE INDEX IF NOT EXISTS "tutor_messages_conversation_idx" ON "tutor_messages" USING btree ("conversation_id");`.catch(e => console.log(e.message));
    
    console.log("Tutor schema applied successfully!");
  } catch (error) {
    console.error("Error applying schema", error);
  } finally {
    await sql.end();
  }
}

main();
