import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(fullName: string | null | undefined): string {
  if (!fullName) return "??";

  const parts = fullName.trim().split(/\s+/);

  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }

  return fullName.slice(0, 2).toUpperCase();
}