import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name for tool images
export const TOOL_IMAGES_BUCKET = 'tool-images';

// Helper function to generate unique file names
export function generateFileName(originalName: string, toolId: number, type: 'initial' | 'final'): string {
  const timestamp = Date.now();
  const extension = originalName.split('.').pop();
  return `${toolId}_${type}_${timestamp}.${extension}`;
}

// Helper function to get public URL for uploaded images
export function getImageUrl(filePath: string): string {
  const { data } = supabase.storage
    .from(TOOL_IMAGES_BUCKET)
    .getPublicUrl(filePath);
  return data.publicUrl;
}
