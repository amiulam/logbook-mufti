import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  timestamp,
  serial,
  pgEnum,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import z from "zod";

// Enums
export const eventStatusEnum = pgEnum("event_status", [
  "not_started",
  "in_progress",
  "completed",
]);

// Table Schemas
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  publicId: integer('public_id').notNull().default(Math.floor(Math.random() * 90000000) + 10000000),
  name: text("name").notNull(),
  assignmentLetter: text("assignment_letter").notNull(),
  status: eventStatusEnum("status").notNull().default("not_started"),
  startDate: timestamp("start_date", { mode: "string" }),
  endDate: timestamp("end_date", { mode: "string" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tools = pgTable("tools", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .references(() => events.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  total: integer("total").notNull(),
  initialCondition: text("initial_condition").notNull(),
  finalCondition: text("final_condition"),
  initialPicture: text("initial_picture"),
  finalPicture: text("final_picture"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const eventRelations = relations(events, ({ many }) => ({
  tools: many(tools),
}));

export const toolRelations = relations(tools, ({ one }) => ({
  event: one(events, {
    fields: [tools.eventId],
    references: [events.id],
  }),
}));

// Zod Schema
export const eventInsertSchema = createInsertSchema(events, {
  name: z.string().min(3, {
    error: "Nama kegiatan harus diisi",
  }),
  assignmentLetter: z.string().min(3, {
    error: "Surat tugas harus diisi",
  }),
}).pick({
  name: true,
  assignmentLetter: true,
});
