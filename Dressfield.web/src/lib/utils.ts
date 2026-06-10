import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a GEL amount as ₾X.XX - used consistently across cart, checkout, admin, and catalog. */
export function formatPrice(amount: number): string {
  return `₾${amount.toFixed(2)}`
}
