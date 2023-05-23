import { drizzle } from "drizzle-orm/planetscale-serverless";
import { mysqlTable, serial, varchar } from "drizzle-orm/mysql-core";

export const calendars = mysqlTable("calendars", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  timeZone: varchar("timeZone", { length: 256 }),
  backgroundColor: varchar("backgroundColor", { length: 256 }),
  userId: varchar("userId", { length: 256 }).notNull(),
});

export const events = mysqlTable("events", {
  id: serial("id").primaryKey(),
  importedId: varchar("importedId", { length: 256 }),
  calendarId: varchar("calendarId", { length: 256 })
    .notNull()
    .references(() => calendars.id),
});
