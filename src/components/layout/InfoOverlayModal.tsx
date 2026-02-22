import { X } from "lucide-react";
import type { ReactNode } from "react";

interface InfoOverlayModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function InfoOverlayModal({
  isOpen,
  title,
  onClose,
  children
}: InfoOverlayModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close modal overlay"
        onClick={onClose}
        className="absolute inset-0"
      />
      <section className="relative z-10 max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-card border border-border-subtle bg-surface p-6 shadow-elevated">
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-border-subtle pb-4">
          <h2 className="text-xl font-semibold text-t-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-inner border border-border-default p-1.5 text-t-tertiary transition-colors hover:bg-elevated hover:text-t-primary"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>
        <div className="space-y-5 text-sm leading-6 text-t-secondary">{children}</div>
      </section>
    </div>
  );
}
