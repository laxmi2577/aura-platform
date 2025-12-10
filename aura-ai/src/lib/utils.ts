import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * CSS Class Merger.
 * Utility for constructing dynamic class strings.
 * Combines `clsx` for conditional logic and `tailwind-merge` to resolve conflicting Tailwind utility classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}