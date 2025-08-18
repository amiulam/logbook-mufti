export interface Event {
  id: string;
  name: string;
  assignmentLetter?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tool {
  id: string;
  eventId: string;
  name: string;
  category: string;
  total: number;
  initialCondition: string;
  finalCondition?: string;
  initialPicture?: string;
  finalPicture?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ToolCondition = 'good' | 'damaged' | 'missing' | 'needs_repair';