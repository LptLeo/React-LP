/**
 * Cartão padrão de superfície.
 */
import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

/**
 * Container com borda, sombra e padding do design system.
 *
 * @param props - Props do elemento `div`.
 */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-secondary/15 bg-surface rounded-lg border p-6 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}
