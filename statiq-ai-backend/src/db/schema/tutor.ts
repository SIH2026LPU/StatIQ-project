import { pgTable, uuid, text, varchar, timestamp, jsonb, index, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./org";

export const tutorMessageRoleEnum = pgEnum("tutor_message_role", ["user", "assistant", "system"]);

export const tutorConversations = pgTable(
  "tutor_conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull().default("New Conversation"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("tutor_conversations_user_idx").on(t.userId),
  })
);

export const tutorMessages = pgTable(
  "tutor_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => tutorConversations.id, { onDelete: "cascade" }),
    role: tutorMessageRoleEnum("role").notNull(),
    content: text("content").notNull(),
    sourceMetadata: jsonb("source_metadata").$type<any[]>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    conversationIdx: index("tutor_messages_conversation_idx").on(t.conversationId),
  })
);

export const tutorConversationsRelations = relations(tutorConversations, ({ many }) => ({
  messages: many(tutorMessages),
}));

export const tutorMessagesRelations = relations(tutorMessages, ({ one }) => ({
  conversation: one(tutorConversations, {
    fields: [tutorMessages.conversationId],
    references: [tutorConversations.id],
  }),
}));
