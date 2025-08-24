import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getConditionColor = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'good':
      return 'bg-green-100 text-green-800';
    case 'damaged':
      return 'bg-orange-100 text-orange-800';
    case 'missing':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};