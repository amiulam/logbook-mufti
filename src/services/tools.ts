import { Tool } from '@/types';
import { db } from '../lib/db';
import { tools } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

// Helper function to map database tool to Tool interface
function mapDbToolToTool(dbTool: any): Tool {
  return {
    id: dbTool.id.toString(),
    eventId: dbTool.eventId.toString(),
    name: dbTool.name,
    category: dbTool.category,
    total: dbTool.total,
    initialCondition: dbTool.initialCondition,
    finalCondition: dbTool.finalCondition || undefined,
    initialPicture: dbTool.initialPicture || undefined,
    finalPicture: dbTool.finalPicture || undefined,
    notes: dbTool.notes || undefined,
    createdAt: dbTool.createdAt.toISOString(),
    updatedAt: dbTool.updatedAt.toISOString(),
  };
}

export async function getToolsByEventId(eventId: number): Promise<Tool[]> {
  const dbTools = await db.select().from(tools).where(eq(tools.eventId, eventId));
  return dbTools.map(mapDbToolToTool);
}

export async function getToolById(id: string): Promise<Tool | null> {
  const dbTool = await db.select().from(tools).where(eq(tools.id, parseInt(id))).limit(1);
  return dbTool.length > 0 ? mapDbToolToTool(dbTool[0]) : null;
}

export async function createTool(toolData: Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tool> {
  const now = new Date();
  const [dbTool] = await db.insert(tools).values({
    eventId: toolData.eventId,
    name: toolData.name,
    category: toolData.category,
    total: toolData.total,
    initialCondition: toolData.initialCondition,
    finalCondition: toolData.finalCondition,
    initialPicture: toolData.initialPicture,
    finalPicture: toolData.finalPicture,
    notes: toolData.notes,
    createdAt: now,
    updatedAt: now,
  }).returning();

  return mapDbToolToTool(dbTool);
}

export async function updateTool(id: string, updates: Partial<Tool>): Promise<Tool | null> {
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (updates.eventId !== undefined) updateData.eventId = updates.eventId;
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.total !== undefined) updateData.total = updates.total;
  if (updates.initialCondition !== undefined) updateData.initialCondition = updates.initialCondition;
  if (updates.finalCondition !== undefined) updateData.finalCondition = updates.finalCondition;
  if (updates.initialPicture !== undefined) updateData.initialPicture = updates.initialPicture;
  if (updates.finalPicture !== undefined) updateData.finalPicture = updates.finalPicture;
  if (updates.notes !== undefined) updateData.notes = updates.notes;

  const dbTool = await db.update(tools)
    .set(updateData)
    .where(eq(tools.id, parseInt(id)))
    .returning();

  return dbTool.length > 0 ? mapDbToolToTool(dbTool[0]) : null;
}

export async function deleteTool(id: string): Promise<boolean> {
  const result = await db.delete(tools).where(eq(tools.id, parseInt(id)));
  return result.count > 0;
}

export async function updateToolConditions(toolConditions: { toolId: string; finalCondition: string; notes?: string }[]): Promise<boolean> {
  try {
    await Promise.all(toolConditions.map(async ({ toolId, finalCondition, notes }) => {
      await updateTool(toolId, { finalCondition, notes });
    }));
    return true;
  } catch (error) {
    console.error('Error updating tool conditions:', error);
    return false;
  }
}