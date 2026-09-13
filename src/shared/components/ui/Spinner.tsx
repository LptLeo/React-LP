/**
 * Indicador de carregamento (spinner acessível).
 */
import { cn } from "@/shared/lib/cn";

interface SpinnerProps {
  /** Classes adicionais (ex: dimensionamento). */
  className?: string;
}

/**
 * Spinner de carregamento com `role="status"` e texto oculto de acessibilidade.
 *
 * @param props - Props do spinner.
 */
export function Spinner({ className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={cn(
        "inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
    />
  );
}
