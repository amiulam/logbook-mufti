import { ACCEPTED_DOC_TYPES, ACCEPTED_IMAGE_TYPES } from "@/lib/constant";
import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  timestamp,
  serial,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import z from "zod";

// Enums
export const eventStatusEnum = pgEnum("event_status", [
  "not_started",
  "in_progress",
  "completed",
]);

export const toolImageTypeEnum = pgEnum("image_type", ["initial", "final"]);

// Table Schemas
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  publicId: integer("public_id").notNull().unique(),
  name: text("name").notNull(),
  assignmentLetter: text("assignment_letter").notNull(),
  status: eventStatusEnum("status").notNull().default("not_started"),
  startDate: timestamp("start_date", { mode: "string" }),
  endDate: timestamp("end_date", { mode: "string" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: text("user_id")
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
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
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// New table for storing multiple images per tool
export const toolImages = pgTable("tool_images", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_id")
    .references(() => tools.id, { onDelete: "cascade" })
    .notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  publicUrl: text("public_url").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(),
  imageType: toolImageTypeEnum("image_type").notNull().default("initial"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// New table for storing event documents (assignment letters)
export const eventDocuments = pgTable("event_documents", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .references(() => events.id, { onDelete: "cascade" })
    .notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  publicUrl: text("public_url").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(),
  documentType: text("document_type").notNull().default("assignment_letter"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const eventRelations = relations(events, ({ one, many }) => ({
  tools: many(tools),
  document: one(eventDocuments),
  user: one(user),
}));

export const toolRelations = relations(tools, ({ one, many }) => ({
  event: one(events, {
    fields: [tools.eventId],
    references: [events.id],
  }),
  images: many(toolImages),
}));

export const toolImageRelations = relations(toolImages, ({ one }) => ({
  tool: one(tools, {
    fields: [toolImages.toolId],
    references: [tools.id],
  }),
}));

export const eventDocumentRelations = relations(eventDocuments, ({ one }) => ({
  event: one(events, {
    fields: [eventDocuments.eventId],
    references: [events.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  event: many(events),
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

// Base tool schema without images
export const toolBaseSchema = createInsertSchema(tools, {
  name: z.string().min(1, {
    error: "Nama alat harus diisi",
  }),
  category: z.string({
    error: "Kategori harus diisi",
  }),
  total: z.string().min(1, {
    error: "Jumlah minimal 1",
  }),
  initialCondition: z
    .string({
      error: "Kondisi awal harus diisi",
    })
    .min(1),
}).pick({
  name: true,
  category: true,
  total: true,
  initialCondition: true,
});

// Extended schema with images validation
export const toolInsertSchema = toolBaseSchema.extend({
  images: z.array(z.any()).min(1, {
    error: "Minimal 1 foto kondisi awal harus diupload",
  }),
});

export const toolImageInsertSchema = createInsertSchema(toolImages, {
  fileName: z.string().min(1, {
    error: "Nama file harus diisi",
  }),
  filePath: z.string().min(1, {
    error: "Path file harus diisi",
  }),
  publicUrl: z.string().url({
    error: "URL file tidak valid",
  }),
  fileSize: z.number().positive({
    error: "Ukuran file harus positif",
  }),
  fileType: z.string().min(1, {
    error: "Tipe file harus diisi",
  }),
  imageType: z.enum(["initial", "final"], {
    error: "Tipe image harus initial atau final",
  }),
}).pick({
  fileName: true,
  filePath: true,
  publicUrl: true,
  fileSize: true,
  fileType: true,
  imageType: true,
});

// Schema untuk event documents
export const eventDocumentInsertSchema = createInsertSchema(eventDocuments, {
  fileName: z.string().min(1, {
    error: "Nama file harus diisi",
  }),
  filePath: z.string().min(1, {
    error: "Path file harus diisi",
  }),
  publicUrl: z.string().url({
    error: "URL file tidak valid",
  }),
  fileSize: z.number().positive({
    error: "Ukuran file harus positif",
  }),
  fileType: z.string().min(1, {
    error: "Tipe file harus diisi",
  }),
  documentType: z.string().min(1, {
    error: "Tipe dokumen harus diisi",
  }),
}).pick({
  fileName: true,
  filePath: true,
  publicUrl: true,
  fileSize: true,
  fileType: true,
  documentType: true,
});

// Schema untuk end event dengan tool conditions
export const endEventSchema = z
  .object({
    toolConditions: z
      .array(
        z.object({
          toolId: z.number(),
          sameAsInitial: z.boolean().default(false),
          finalCondition: z.string().optional(),
          notes: z.string().optional(),
          finalImages: z.array(z.any()).default([]),
        }),
      )
      .min(1, "Minimal 1 tool condition harus diisi"),
  })
  .superRefine((data, ctx) => {
    data.toolConditions.forEach((cond, index) => {
      if (cond.sameAsInitial) {
        // when same as initial, ensure optional fields are effectively ignored
        return;
      }
      if (!cond.finalCondition || cond.finalCondition.length < 1) {
        ctx.addIssue({
          code: "custom",
          message: "Kondisi akhir harus diisi",
          path: ["toolConditions", index, "finalCondition"],
        });
      }
      // Only require final images when the tool is not marked as missing
      const isMissing = cond.finalCondition === "missing";
      if (!isMissing && (!cond.finalImages || cond.finalImages.length < 1)) {
        ctx.addIssue({
          code: "custom",
          message: "Minimal 1 foto kondisi akhir harus diupload",
          path: ["toolConditions", index, "finalImages"],
        });
      }
    });
  });

// Type untuk end event form data
export type EndEventFormData = z.infer<typeof endEventSchema>;

// Schema untuk update tool conditions (tanpa images)
export const updateToolConditionsSchema = z
  .array(
    z.object({
      toolId: z.number().positive("Tool ID harus berupa angka positif"),
      finalCondition: z.string().min(1, "Kondisi akhir harus diisi"),
      notes: z.string().optional(),
    }),
  )
  .min(1, "Minimal 1 tool condition harus diupdate");

// Type untuk update tool conditions
export type UpdateToolConditionsData = z.infer<
  typeof updateToolConditionsSchema
>;

// Extended schema to include document with file type validation
export const createEventWithDocumentSchema = eventInsertSchema.extend({
  document: z
    .instanceof(File)
    .refine((file) => file instanceof File, {
      message: "Document harus diupload",
    })
    .refine(
      (file) => {
        if (!file) return false;

        return ACCEPTED_DOC_TYPES.includes(file.type);
      },
      {
        message: "File harus berupa dokumen", // (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, ODT, ODS, ODP, RTF, ZIP)
      },
    )
    .refine(
      (file) => {
        if (!file) return false;

        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        return file.size <= maxSize;
      },
      {
        message: "Ukuran file maksimal 5MB",
      },
    ),
});

// Create schema with images validation
export const addToolSchema = toolBaseSchema.extend({
  images: z
    .array(z.instanceof(File))
    .min(1, {
      error: "Minimal 1 foto kondisi awal harus diupload",
    })
    .refine(
      (files) => {
        // Validate that all files are images
        return files.every((file) => ACCEPTED_IMAGE_TYPES.includes(file.type));
      },
      {
        message:
          "Semua file harus berupa gambar (JPG, PNG, GIF, WebP, BMP, SVG)",
      },
    )
    .refine(
      (files) => {
        // Validate file size (5MB max each)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        return files.every((file) => file.size <= maxSize);
      },
      {
        message: "Ukuran file maksimal 5MB per gambar",
      },
    ),
});
