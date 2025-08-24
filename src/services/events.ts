"use server";

import { Event } from "@/types";
import { db } from "../lib/db";
import { eventInsertSchema, events } from "@/../drizzle/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Helper function to map database event to Event interface
function mapDbEventToEvent(dbEvent: any): Event {
  return {
    id: dbEvent.id.toString(),
    publicId: dbEvent.public_id,
    name: dbEvent.name,
    assignmentLetter: dbEvent.assignmentLetter || undefined,
    status: dbEvent.status as Event["status"],
    startDate: dbEvent.startDate?.toISOString() || undefined,
    endDate: dbEvent.endDate?.toISOString() || undefined,
    createdAt: dbEvent.createdAt.toISOString(),
    updatedAt: dbEvent.updatedAt.toISOString(),
  };
}

export async function getAllEvents() {
  const eventList = await db.query.events.findMany({
    with: {
      tools: {
        with: {
          images: true,
        }
      },
    },
  });
  return eventList;
}

export async function getEventById(publicId: string) {
  const foundEvent = await db.query.events.findFirst({
    where: eq(events.publicId, +publicId),
    with: {
      tools: true,
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

  const [dbEvent] = await db
    .insert(events)
    .values({
      name: validatedData.name,
      assignmentLetter: validatedData.assignmentLetter,
    })
    .returning();

  revalidatePath("/app", "layout");

  return mapDbEventToEvent(dbEvent);
}

export async function updateEvent(
  id: number,
  updates: Partial<Event>
): Promise<Event | null> {
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.assignmentLetter !== undefined)
    updateData.assignmentLetter = updates.assignmentLetter;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.startDate !== undefined)
    updateData.startDate = updates.startDate
      ? new Date(updates.startDate)
      : null;
  if (updates.endDate !== undefined)
    updateData.endDate = updates.endDate ? new Date(updates.endDate) : null;

  const dbEvent = await db
    .update(events)
    .set(updateData)
    .where(eq(events.id, id))
    .returning();

  revalidatePath("/app/event", "layout");

  return dbEvent.length > 0 ? mapDbEventToEvent(dbEvent[0]) : null;
}

export async function deleteEvent(id: string): Promise<boolean> {
  const result = await db.delete(events).where(eq(events.id, parseInt(id)));
  return result.count > 0;
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

  // return dbEvent ? mapDbEventToEvent(dbEvent) : null;
}

export async function endEvent(id: number): Promise<Event | null> {
  return updateEvent(id, {
    status: "completed",
    endDate: new Date().toISOString(),
  });
}
