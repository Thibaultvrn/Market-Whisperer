import type { ReactNode } from "react";

interface ContentContainerProps {
  children: ReactNode;
}

export default function ContentContainer({ children }: ContentContainerProps) {
  return <main className="min-h-[calc(100vh-110px)]">{children}</main>;
}
