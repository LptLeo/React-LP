/**
 * Campo de texto reutilizável com estado de erro visual.
 */
import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Marca o campo como inválido (borda danger). */
  invalid?: boolean;
}

/**
 * Input acessível (foco visível) com borda danger em estado de erro.
 *
 * @param props - Props do elemento `input` + `invalid`.
 * @param ref - Ref encaminhada para o elemento `input`.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, invalid = false, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "bg-surface text-text placeholder:text-secondary/70 focus:ring-primary/30 w-full rounded-md border px-3 py-2 text-base transition-colors duration-150 focus:ring-2 focus:outline-none",
        invalid ? "border-danger" : "border-secondary/30",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
