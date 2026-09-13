/**
 * Utilidade de composição de classes (Tailwind).
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes com `clsx` e resolve conflitos do Tailwind com `twMerge`.
 *
 * @param inputs - Lista de valores de classe (strings, objetos condicionais...).
 * @returns String de classes mesclada.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
