import { timestamp, pgTable, uuid, jsonb, text, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const resumes = pgTable("resumes", {
  // Identifiers
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  resumeData: jsonb("resume_data").notNull(), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .$onUpdate(() => new Date()),
});

// Type exports for type safety
export type InsertResume = typeof resumes.$inferInsert;
export type SelectResume = typeof resumes.$inferSelect;
