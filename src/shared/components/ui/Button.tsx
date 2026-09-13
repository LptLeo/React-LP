/**
 * Componente de botão reutilizável.
 *
 * Segue os tokens do design system (cores semânticas, raios e transições).
 */
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Variação visual do botão. */
  variant?: ButtonVariant;
  /** Tamanho do botão. */
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary/90",
  secondary: "bg-secondary/10 text-text hover:bg-secondary/20",
  danger: "bg-danger text-white hover:bg-danger/90",
  ghost: "text-secondary hover:bg-secondary/10 hover:text-text",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
};

/**
 * Botão com variantes semânticas e estados de foco/hover/desabilitado.
 *
 * @param props - Props do elemento `button` + `variant` e `size`.
 */
export function Button({
  variant = "primary",
  size = "md",
  className,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "focus-visible:outline-primary inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
