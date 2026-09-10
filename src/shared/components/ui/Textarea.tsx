/**
 * Área de texto reutilizável com estado de erro visual.
 */
import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Marca o campo como inválido (borda danger). */
  invalid?: boolean;
}

/**
 * Área de texto acessível (foco visível) com borda danger em estado de erro.
 *
 * @param props - Props do elemento `textarea` + `invalid`.
 * @param ref - Ref encaminhada para o elemento `textarea`.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, invalid = false, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "bg-surface text-text placeholder:text-secondary/70 focus:ring-primary/30 min-h-24 w-full rounded-md border px-3 py-2 text-base transition-colors duration-150 focus:ring-2 focus:outline-none",
        invalid ? "border-danger" : "border-secondary/30",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";
