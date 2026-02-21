import type { ReactNode } from "react";

interface ContentContainerProps {
  children: ReactNode;
}

export default function ContentContainer({ children }: ContentContainerProps) {
  return (
    <main className="min-h-[calc(100vh-110px)] rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-3 sm:p-4">
      {children}
    </main>
  );
}
