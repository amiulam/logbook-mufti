"use server";

import { Event } from "@/types";
import { db } from "../lib/db";
import { eventInsertSchema, events, eventDocuments } from "@/../drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { deleteEventDocuments, UploadedDocument } from "./storage";
import { deleteTool, getToolsByEventId } from "./tools";
import { updateEventSchema } from "@/schemas";

export async function getAllEvents() {
  const eventList = await db.query.events.findMany({
    with: {
      tools: {
        with: {
          images: true,
        }
      },
      document: true,
    },
  });
  return eventList;
}

export async function getEventById(publicId: string) {
  const foundEvent = await db.query.events.findFirst({
    where: eq(events.publicId, +publicId),
    with: {
      tools: true,
      document: true,
    },
  });

  if (!foundEvent) {
    return null;
  }

  return foundEvent;
}

export async function createEvent(eventData: unknown): Promise<Event> {
  const validationResult = eventInsertSchema.safeParse(eventData);

  if (!validationResult.success) {
    throw new Error(`Validation failed: ${validationResult.error.message}`);
  }

  const validatedData = validationResult.data;

  // Generate unique public ID with collision handling
  const generateUniquePublicId = async (): Promise<number> => {
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      const publicId = Math.floor(Math.random() * 90000000) + 10000000;

      // Check if this publicId already exists
      const existingEvent = await db
        .select({ id: events.id })
        .from(events)
        .where(eq(events.publicId, publicId))
        .limit(1);

      if (existingEvent.length === 0) {
        return publicId;
      }

      attempts++;
    }

    throw new Error('Failed to generate unique public ID after multiple attempts');
  };

  const [dbEvent] = await db
    .insert(events)
    .values({
      name: validatedData.name,
      assignmentLetter: validatedData.assignmentLetter,
      publicId: await generateUniquePublicId(),
    })
    .returning();

  revalidatePath("/app", "layout");

  return dbEvent;
}

export async function updateEvent(
  id: number,
  updates: unknown
): Promise<Event | null> {
  const validation = updateEventSchema.safeParse(updates);
  if (!validation.success) {
    throw new Error(`Validation failed: ${validation.error.message}`);
  }

  const validated = validation.data;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (validated.name !== undefined) updateData.name = validated.name;
  if (validated.assignmentLetter !== undefined)
    updateData.assignmentLetter = validated.assignmentLetter;
  if (validated.status !== undefined) updateData.status = validated.status;
  if (validated.startDate !== undefined)
    updateData.startDate = validated.startDate ? new Date(validated.startDate) : null;
  if (validated.endDate !== undefined)
    updateData.endDate = validated.endDate ? new Date(validated.endDate) : null;

  const dbEvent = await db
    .update(events)
    .set(updateData)
    .where(eq(events.id, id))
    .returning();

  revalidatePath("/app/events", "page");

  return dbEvent.length > 0 ? dbEvent[0] : null;
}

export async function deleteEvent(id: number): Promise<boolean> {
  try {
    // Get all tools for this event first
    const eventTools = await getToolsByEventId(id);

    // Delete all tools (this will cascade delete tool images due to foreign key)
    if (eventTools.length > 0) {
      await Promise.all(
        eventTools.map(tool => deleteTool(tool.id))
      );
    }

    // Get event documents before deletion
    const eventDocs = await db
      .select()
      .from(eventDocuments)
      .where(eq(eventDocuments.eventId, id));

    // Delete event documents from Supabase Storage if any exist
    if (eventDocs.length > 0) {
      const filePaths = eventDocs.map(doc => doc.filePath);
      await deleteEventDocuments(filePaths);
    }

    // Delete event documents from database
    await db.delete(eventDocuments).where(eq(eventDocuments.eventId, id));

    // Finally delete the event itself
    const result = await db.delete(events).where(eq(events.id, id));

    // Revalidate paths
    revalidatePath("/app", "layout");

    return result.count > 0;
  } catch (error) {
    console.error('Error deleting event with cleanup:', error);
    throw error;
  }
}

export async function startEvent(id: number) {
  await db
    .update(events)
    .set({
      status: "in_progress",
      startDate: new Date().toISOString(),
    })
    .where(eq(events.id, id))
    .returning();

  revalidatePath("/app", "layout");
}

export async function endEvent(id: number) {
  await db
    .update(events)
    .set({
      status: "completed",
      endDate: new Date().toISOString(),
    })
    .where(eq(events.id, id))
    .returning();

  revalidatePath("/app", "layout");
}

export async function saveEventDocument(documentData: UploadedDocument, eventId: number) {
  try {
    await db
      .insert(eventDocuments)
      .values({ ...documentData, eventId })
      .returning();

    revalidatePath("/app", "layout");
  } catch (error) {
    console.error('Error saving event document:', error);
    throw error;
  }
}
