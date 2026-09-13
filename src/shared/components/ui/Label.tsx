/**
 * Rótulo de formulário.
 */
import type { LabelHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

/**
 * Label padronizado para campos de formulário.
 *
 * @param props - Props do elemento `label`.
 */
export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-text mb-1 block text-sm font-medium", className)}
      {...props}
    />
  );
}
