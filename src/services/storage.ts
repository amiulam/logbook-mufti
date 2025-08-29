"use server";

import { supabase, TOOL_IMAGES_BUCKET, EVENT_DOCUMENTS_BUCKET, generateFileName, generateDocumentFileName } from '@/lib/supabase';

export interface UploadedImage {
  fileName: string;
  filePath: string;
  publicUrl: string;
  fileSize: number;
  fileType: string;
  imageType: 'initial' | 'final';
}

export async function uploadToolImages(
  files: File[],
  toolId: number,
  type: 'initial' | 'final'
): Promise<UploadedImage[]> {
  try {
    const uploadedImages: UploadedImage[] = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error(`File ${file.name} is not an image`);
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error(`File ${file.name} is too large. Maximum size is 5MB`);
      }

      // Generate unique file name
      const fileName = generateFileName(file.name, toolId, type);
      const filePath = `${toolId}/${type}/${fileName}`;

      // Convert File to ArrayBuffer for upload
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from(TOOL_IMAGES_BUCKET)
        .upload(filePath, uint8Array, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Failed to upload ${file.name}: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(TOOL_IMAGES_BUCKET)
        .getPublicUrl(filePath);

      uploadedImages.push({
        fileName: file.name,
        filePath: filePath,
        publicUrl: urlData.publicUrl,
        fileSize: file.size,
        fileType: file.type,
        imageType: type
      });
    }

    return uploadedImages;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
}

export async function deleteToolImage(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(TOOL_IMAGES_BUCKET)
      .remove([filePath]);

    if (error) {
      throw new Error(`Failed to delete image: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
}

export async function deleteToolImages(filePaths: string[]): Promise<boolean> {
  try {
    if (filePaths.length === 0) return true;

    const { error } = await supabase.storage
      .from(TOOL_IMAGES_BUCKET)
      .remove(filePaths);

    if (error) {
      throw new Error(`Failed to delete images: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting images:', error);
    return false;
  }
}

export type UploadedDocument = {
  fileName: string;
  filePath: string;
  publicUrl: string;
  fileSize: number;
  fileType: string;
  documentType: string;
}

export async function uploadEventDocument(
  file: File,
  eventId: number,
  documentType: string = 'assignment_letter'
): Promise<UploadedDocument> {
  try {
    // Validate file type (allow common document types)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png'
    ];

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed. Allowed types: PDF, DOC, DOCX, TXT, JPG, PNG`);
    }

    // Validate file size (max 10MB for documents)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`File ${file.name} is too large. Maximum size is 10MB`);
    }

    // Generate unique file name
    const fileName = generateDocumentFileName(file.name, eventId, documentType);
    const filePath = `${eventId}/${documentType}/${fileName}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from(EVENT_DOCUMENTS_BUCKET)
      .upload(filePath, uint8Array, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Failed to upload ${file.name}: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(EVENT_DOCUMENTS_BUCKET)
      .getPublicUrl(filePath);

    return {
      fileName: file.name,
      filePath: filePath,
      publicUrl: urlData.publicUrl,
      fileSize: file.size,
      fileType: file.type,
      documentType: documentType
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

export async function deleteEventDocument(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(EVENT_DOCUMENTS_BUCKET)
      .remove([filePath]);

    if (error) {
      throw new Error(`Failed to delete document: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    return false;
  }
}

export async function deleteEventDocuments(filePaths: string[]): Promise<boolean> {
  try {
    if (filePaths.length === 0) return true;

    const { error } = await supabase.storage
      .from(EVENT_DOCUMENTS_BUCKET)
      .remove(filePaths);

    if (error) {
      throw new Error(`Failed to delete documents: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting documents:', error);
    return false;
  }
}
