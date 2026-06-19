import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatCurrency as sharedFormatCurrency } from "@finmora/shared";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = sharedFormatCurrency;
