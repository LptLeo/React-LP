/**
 * Modal acessível (overlay + painel).
 */
import { useEffect, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

interface ModalProps {
  /** Controla a exibição do modal. */
  open: boolean;
  /** Título do modal (utilizado como `aria-label`). */
  title: string;
  /** Callback executado ao fechar (Escape ou clique no backdrop). */
  onClose: () => void;
  /** Conteúdo do modal. */
  children: ReactNode;
  /** Classes adicionais do painel. */
  className?: string;
}

/**
 * Modal com fechamento por `Escape` e clique no backdrop.
 *
 * @param props - Props do modal.
 */
export function Modal({
  open,
  title,
  onClose,
  children,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "bg-surface relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg p-6 shadow-lg",
          className,
        )}
      >
        <h2 className="font-display text-text mb-4 text-xl font-semibold">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
