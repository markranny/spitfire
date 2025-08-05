import {
  timestamp,
  pgTable,
  text,
  uuid,
  integer,
  decimal
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import {
  FlightColumnDataType,
  FlightColumnDefinition,
  flightColumnDefinitions,
  FlightColumnKey,
  FlightColumnUnit
} from "@/lib/interfaces/flightColumnDefinition";

export const flightLogs = pgTable("flight_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp('updated_at').notNull().$onUpdate(() => new Date()),
  ...flightColumnDefinitions.reduce((acc: Record<string, any>, column: FlightColumnDefinition) => {
    switch (column.dataType) {
      case FlightColumnDataType.Number:
        acc[column.headerName] = column.unit === FlightColumnUnit.Count
          ? integer(column.headerName)
          : decimal(column.headerName);
        break;
      case FlightColumnDataType.ISO8601:
        acc[column.headerName] = timestamp(column.headerName);
        break;
      case FlightColumnDataType.String:
      default:
        acc[column.headerName] = text(column.headerName);
        break;
    }

    // Ensure required columns are not null
    if (
      column.headerName === FlightColumnKey.DATE_TIME ||
      column.headerName === FlightColumnKey.AIRCRAFT_TYPE ||
      column.headerName === FlightColumnKey.TOTAL_TIME
    ) {
      acc[column.headerName] = acc[column.headerName].notNull();
    }
    return acc;
  }, {}),
});

export type InsertFlightLog = typeof flightLogs.$inferInsert;
export type SelectFlightLogs = typeof flightLogs.$inferSelect;
