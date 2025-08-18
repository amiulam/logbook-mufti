import { Event, Tool } from '@/types';
import { getFromStorage, saveToStorage, STORAGE_KEYS, generateId } from './storage';

export function getAllEvents(): Event[] {
  return getFromStorage<Event>(STORAGE_KEYS.EVENTS);
}

export function getEventById(id: string): Event | null {
  const events = getAllEvents();
  return events.find(event => event.id === id) || null;
}

export function createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Event {
  const event: Event = {
    ...eventData,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const events = getAllEvents();
  events.push(event);
  saveToStorage(STORAGE_KEYS.EVENTS, events);
  
  return event;
}

export function updateEvent(id: string, updates: Partial<Event>): Event | null {
  const events = getAllEvents();
  const eventIndex = events.findIndex(event => event.id === id);
  
  if (eventIndex === -1) return null;
  
  events[eventIndex] = {
    ...events[eventIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  saveToStorage(STORAGE_KEYS.EVENTS, events);
  return events[eventIndex];
}

export function deleteEvent(id: string): boolean {
  const events = getAllEvents();
  const filteredEvents = events.filter(event => event.id !== id);
  
  if (filteredEvents.length === events.length) return false;
  
  saveToStorage(STORAGE_KEYS.EVENTS, filteredEvents);
  
  // Also delete associated tools
  const tools = getFromStorage<Tool>(STORAGE_KEYS.TOOLS);
  const filteredTools = tools.filter(tool => tool.eventId !== id);
  saveToStorage(STORAGE_KEYS.TOOLS, filteredTools);
  
  return true;
}

export function startEvent(id: string): Event | null {
  return updateEvent(id, {
    status: 'in_progress',
    startDate: new Date().toISOString(),
  });
}

export function endEvent(id: string): Event | null {
  return updateEvent(id, {
    status: 'completed',
    endDate: new Date().toISOString(),
  });
}