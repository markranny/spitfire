import {
  timestamp,
  pgTable,
  text,
  uuid,
  boolean
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const aircraftModels = pgTable("aircraft_models", {
  // Model Information and Identifiers
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  model: text("model").notNull(),
  aliases: text("aliases"),

  // Properties
  isFixedWing: boolean("is_fixed_wing").notNull(),
  isHelicopter: boolean("is_helicopter").notNull(),
  isSingleEngine: boolean("is_single_engine").notNull(),
  isTurbine: boolean("is_turbine").notNull(),
  isMilitary: boolean("is_military").notNull(),

  // Tracking
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp('updated_at').notNull().$onUpdate(() => new Date()),
});

export type InsertAircraftModel = typeof aircraftModels.$inferInsert;
export type SelectAircraftModels = typeof aircraftModels.$inferSelect;
