import z from "zod";

// Validation schema for updating a tool
export const updateToolSchema = z.object({
  name: z.string().min(1, "Nama alat harus diisi").optional(),
  category: z.string().min(1, "Kategori harus diisi").optional(),
  total: z.coerce.number().int().positive("Jumlah minimal 1").optional(),
  initialCondition: z.string().min(1, "Kondisi awal harus diisi").optional(),
  finalCondition: z.string().min(1).optional(),
  notes: z.string().nullable().optional(),
});

// Validation schema for updating an event
export const updateEventSchema = z.object({
  name: z.string().min(3, "Nama kegiatan minimal 3 karakter").optional(),
  assignmentLetter: z.string().optional(),
  status: z.enum(["not_started", "in_progress", "completed"]).optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});