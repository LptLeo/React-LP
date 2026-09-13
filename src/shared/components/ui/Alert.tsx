/**
 * Alerta de feedback (erro, sucesso ou aviso).
 */
import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type AlertVariant = "error" | "success" | "warning";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  /** Variante semântica do alerta. */
  variant?: AlertVariant;
}

const variantClasses: Record<AlertVariant, string> = {
  error: "border-danger/30 bg-danger/5 text-danger",
  success: "border-success/30 bg-success/5 text-success",
  warning: "border-warning/30 bg-warning/5 text-warning",
};

/**
 * Alerta com `role="alert"` para feedback acessível.
 *
 * @param props - Props do elemento `div` + `variant`.
 */
export function Alert({ variant = "error", className, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-md border px-4 py-3 text-sm",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
