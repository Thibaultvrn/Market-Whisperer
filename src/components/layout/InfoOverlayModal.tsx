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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <button
        type="button"
        aria-label="Close modal overlay"
        onClick={onClose}
        className="absolute inset-0"
      />
      <section className="relative z-10 max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-5 text-zinc-900 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-zinc-200 pb-3">
          <h2 className="text-xl font-semibold text-zinc-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-zinc-300 p-1 text-zinc-700 transition-colors hover:bg-zinc-100"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>
        <div className="space-y-4 text-sm leading-6 text-zinc-800">{children}</div>
      </section>
    </div>
  );
}
