import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toDateTimeInputValue = (value?: Date | string | null) => {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  // datetime-local inputs require a local string without seconds/timezone.
  return date.toISOString().slice(0, 16);
};
