import { LucideIcon } from "lucide-react";

export type Event = {
  id: number;
  publicId: number;
  name: string;
  assignmentLetter: string;
  status: "not_started" | "in_progress" | "completed";
  startDate: string | null;
  endDate: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type EventDocument = {
  id: number;
  eventId: number;
  fileName: string;
  filePath: string;
  publicUrl: string;
  fileSize: number;
  fileType: string;
  documentType: string;
  createdAt: Date;
};

export type ToolImage = {
  id: number;
  toolId: number;
  fileName: string;
  filePath: string;
  publicUrl: string;
  fileSize: number;
  fileType: string;
  imageType: "initial" | "final";
  createdAt: Date;
};

export type Tool = {
  id: number;
  eventId: number;
  name: string;
  category: string;
  total: number;
  initialCondition: string;
  finalCondition: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  images?: ToolImage[];
};

export type ToolWithImages = Tool & {
  images: ToolImage[];
};

export type EventWithTools = Event & {
  tools: ToolWithImages[];
  document: EventDocument | null;
};

export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon | null;
  isActive?: boolean;
}

export type ToolCondition = "good" | "damaged" | "missing";
export type ToolCategories = "audio" | "video" | "jaringan" | "utility";