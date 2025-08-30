import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getConditionColor = (condition: string) => {
  switch (condition.toLowerCase()) {
    case "good":
      return "bg-green-100 text-green-800";
    case "damaged":
      return "bg-orange-100 text-orange-800";
    case "missing":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getInitials = (fullName: string | null): string | null => {
  if (!fullName) {
    return null;
  }

  const names = fullName.trim().split(" ");

  if (names.length === 0) return "";
  if (names.length === 1) return names[0].charAt(0).toUpperCase();

  const firstInitial = names[0].charAt(0);
  const lastInitial = names[names.length - 1].charAt(0);

  return `${firstInitial}${lastInitial}`.toUpperCase();
};
