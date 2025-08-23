export type Event = {
  id: number;
  publicId: number;
  name: string;
  assignmentLetter: string;
  status: 'not_started' | 'in_progress' | 'completed';
  startDate: string | null;
  endDate: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type Tool = {
  id: number;
  eventId: number;
  name: string;
  category: string;
  total: number;
  initialCondition: string;
  finalCondition: string | null;
  initialPicture: string | null;
  finalPicture: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type EventWithTools = Event & {
  tools: Tool[];
}

export type ToolCondition = 'good' | 'damaged' | 'missing' | 'needs_repair';