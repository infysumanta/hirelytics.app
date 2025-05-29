import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Ensures that style object properties are consistently camelCase
// to prevent hydration mismatches between server and client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeStyle(styleObj: Record<string, any>): Record<string, any> {
  // Convert any kebab-case properties to camelCase
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const safeObj: Record<string, any> = {};
  Object.entries(styleObj).forEach(([key, value]) => {
    // Convert any kebab-case to camelCase
    const camelKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    safeObj[camelKey] = value;
  });
  return safeObj;
}
