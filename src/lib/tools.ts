import { Tool } from '@/types';
import { getFromStorage, saveToStorage, STORAGE_KEYS, generateId } from './storage';

export function getToolsByEventId(eventId: string): Tool[] {
  const tools = getFromStorage<Tool>(STORAGE_KEYS.TOOLS);
  return tools.filter(tool => tool.eventId === eventId);
}

export function getToolById(id: string): Tool | null {
  const tools = getFromStorage<Tool>(STORAGE_KEYS.TOOLS);
  return tools.find(tool => tool.id === id) || null;
}

export function createTool(toolData: Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>): Tool {
  const tool: Tool = {
    ...toolData,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const tools = getFromStorage<Tool>(STORAGE_KEYS.TOOLS);
  tools.push(tool);
  saveToStorage(STORAGE_KEYS.TOOLS, tools);
  
  return tool;
}

export function updateTool(id: string, updates: Partial<Tool>): Tool | null {
  const tools = getFromStorage<Tool>(STORAGE_KEYS.TOOLS);
  const toolIndex = tools.findIndex(tool => tool.id === id);
  
  if (toolIndex === -1) return null;
  
  tools[toolIndex] = {
    ...tools[toolIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  saveToStorage(STORAGE_KEYS.TOOLS, tools);
  return tools[toolIndex];
}

export function deleteTool(id: string): boolean {
  const tools = getFromStorage<Tool>(STORAGE_KEYS.TOOLS);
  const filteredTools = tools.filter(tool => tool.id !== id);
  
  if (filteredTools.length === tools.length) return false;
  
  saveToStorage(STORAGE_KEYS.TOOLS, filteredTools);
  return true;
}

export function updateToolConditions(toolConditions: { toolId: string; finalCondition: string; notes?: string }[]): boolean {
  try {
    toolConditions.forEach(({ toolId, finalCondition, notes }) => {
      updateTool(toolId, { finalCondition, notes });
    });
    return true;
  } catch (error) {
    console.error('Error updating tool conditions:', error);
    return false;
  }
}