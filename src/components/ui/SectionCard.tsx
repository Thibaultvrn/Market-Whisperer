import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface SectionCardProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export default function SectionCard({ children, className, noPadding }: SectionCardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-border-subtle bg-surface shadow-card",
        !noPadding && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
