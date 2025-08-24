"use server";

import { Tool } from "@/types";
import { db } from "../lib/db";
import { toolBaseSchema, tools, toolImages, updateToolConditionsSchema, UpdateToolConditionsData } from "../../drizzle/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { deleteToolImages } from "./storage";

// Helper function to map database tool to Tool interface
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbToolToTool(dbTool: any): Tool {
  return {
    id: dbTool.id,
    eventId: dbTool.eventId,
    name: dbTool.name,
    category: dbTool.category,
    total: dbTool.total,
    initialCondition: dbTool.initialCondition,
    finalCondition: dbTool.finalCondition || undefined,
    notes: dbTool.notes || undefined,
    createdAt: dbTool.createdAt,
    updatedAt: dbTool.updatedAt,
    images: dbTool.images || [],
  };
}

export async function getToolsByEventId(eventId: number) {
  const toolsData = await db.query.tools.findMany({
    where: eq(tools.eventId, eventId),
    with: {
      images: true,
    },
  });

  return toolsData;
  // return dbTools.map(mapDbToolToTool);
}

export async function getToolById(id: string): Promise<Tool | null> {
  const dbTool = await db
    .select()
    .from(tools)
    .where(eq(tools.id, parseInt(id)))
    .limit(1);
  return dbTool.length > 0 ? mapDbToolToTool(dbTool[0]) : null;
}

export async function createTool(toolData: unknown, eventId: number) {
  // First validate the base tool data
  const baseValidationResult = toolBaseSchema.safeParse(toolData);

  if (!baseValidationResult.success) {
    throw new Error(`Validation failed: ${baseValidationResult.error.message}`);
  }

  const validatedData = baseValidationResult.data;

  // Check if images are provided (this should be validated in the UI)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const imagesData = (toolData as any).images;
  if (!imagesData || imagesData.length === 0) {
    throw new Error("Minimal 1 foto kondisi awal harus diupload");
  }

  const [dbTool] = await db
    .insert(tools)
    .values({
      eventId: eventId,
      name: validatedData.name,
      category: validatedData.category,
      total: +validatedData.total,
      initialCondition: validatedData.initialCondition,
    })
    .returning();

  revalidatePath('/app/events', 'page');
  
  return dbTool;
}

export async function updateTool(
  id: number,
  updates: Partial<Tool>
): Promise<Tool | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {
    updatedAt: new Date(),
  };

  if (updates.eventId !== undefined) updateData.eventId = updates.eventId;
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.total !== undefined) updateData.total = updates.total;
  if (updates.initialCondition !== undefined)
    updateData.initialCondition = updates.initialCondition;
  if (updates.finalCondition !== undefined)
    updateData.finalCondition = updates.finalCondition;
  if (updates.notes !== undefined) updateData.notes = updates.notes;

  const dbTool = await db
    .update(tools)
    .set(updateData)
    .where(eq(tools.id, id))
    .returning();

  return dbTool.length > 0 ? mapDbToolToTool(dbTool[0]) : null;
}

export async function deleteTool(id: number): Promise<boolean> {
  try {
    // Get tool images first before deletion
    const toolImages = await getToolImages(id);
    
    // Delete images from Supabase Storage if any exist
    if (toolImages.length > 0) {
      const filePaths = toolImages.map(img => img.filePath);
      await deleteToolImages(filePaths);
    }

    // Delete tool from database (this will cascade delete tool_images due to foreign key)
    const result = await db.delete(tools).where(eq(tools.id, id));
    
    // Revalidate paths
    revalidatePath('/app/events', 'page');
    
    return result.count > 0;
  } catch (error) {
    console.error('Error deleting tool with cleanup:', error);
    throw error; // Re-throw error untuk handling di UI
  }
}

// // Function untuk delete multiple tools dengan cleanup
// export async function deleteMultipleTools(toolIds: number[]): Promise<boolean> {
//   try {
//     if (!toolIds || toolIds.length === 0) {
//       throw new Error("Tool IDs tidak boleh kosong");
//     }

//     // Get all tool images before deletion
//     const allToolImages = await Promise.all(
//       toolIds.map(id => getToolImages(id))
//     );
    
//     // Flatten and collect all file paths
//     const allFilePaths = allToolImages.flat().map(img => img.filePath);
    
//     // Delete all images from Supabase Storage if any exist
//     if (allFilePaths.length > 0) {
//       await deleteToolImages(allFilePaths);
//     }

//     // Delete all tools from database
//     const result = await db.delete(tools).where(inArray(tools.id, toolIds));
    
//     // Revalidate paths
//     revalidatePath('/app/events', 'page');
    
//     return result.count > 0;
//   } catch (error) {
//     console.error('Error deleting multiple tools with cleanup:', error);
//     throw error; // Re-throw error untuk handling di UI
//   }
// }

export async function updateToolConditions(
  toolConditions: UpdateToolConditionsData
): Promise<boolean> {
  try {
    // Validate input data dengan Zod schema
    const validationResult = updateToolConditionsSchema.safeParse(toolConditions);

    if (!validationResult.success) {
      throw new Error(`Validation failed: ${validationResult.error.message}`);
    }

    const validatedData = validationResult.data;

    // Update tool conditions
    await Promise.all(
      validatedData.map(async ({ toolId, finalCondition, notes }) => {
        const result = await updateTool(toolId, { finalCondition, notes });
        if (!result) {
          throw new Error(`Gagal update tool dengan ID ${toolId}`);
        }
      })
    );

    // Revalidate paths
    revalidatePath('/app/events', 'page');

    return true;
  } catch (error) {
    console.error('Error updating tool conditions:', error);
    throw error; // Re-throw error untuk handling di UI
  }
}

// New function to save tool images to database
export async function saveToolImages(
  toolId: number,
  images: Array<{
    fileName: string;
    filePath: string;
    publicUrl: string;
    fileSize: number;
    fileType: string;
    imageType: 'initial' | 'final';
  }>
): Promise<void> {
  try {
    if (images.length === 0) return;

    await db.insert(toolImages).values(
      images.map(image => ({
        toolId,
        fileName: image.fileName,
        filePath: image.filePath,
        publicUrl: image.publicUrl,
        fileSize: image.fileSize,
        fileType: image.fileType,
        imageType: image.imageType,
      }))
    );

    revalidatePath('/app/events', 'page');
  } catch (error) {
    console.error('Error saving tool images:', error);
    throw error;
  }
}

// Function to get tool images
export async function getToolImages(toolId: number) {
  try {
    const images = await db
      .select()
      .from(toolImages)
      .where(eq(toolImages.toolId, toolId));
    
    return images;
  } catch (error) {
    console.error('Error getting tool images:', error);
    return [];
  }
}
