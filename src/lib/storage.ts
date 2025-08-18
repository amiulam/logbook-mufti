export const STORAGE_KEYS = {
  EVENTS: 'logbook_events',
  TOOLS: 'logbook_tools',
} as const;

export function getFromStorage<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

export function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}