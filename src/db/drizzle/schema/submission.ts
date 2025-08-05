import { timestamp, pgTable, uuid, jsonb, text, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const submissions = pgTable("submissions", {
  // Identifiers
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  resumeId: uuid("resume_id").notNull(),
  state: text("state").notNull(), // e.g., "draft", "submitted", "reviewed"
  name: text("name").notNull(),
  email: text("email").notNull(),
  airlinePreference: text("airline_preference").notNull(),
  position: text("position"),
  selectedTemplates: jsonb("selected_templates").$type<string[]>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

// Type exports for type safety
export type InsertSubmission = typeof submissions.$inferInsert;
export type SelectSubmission = typeof submissions.$inferSelect;
