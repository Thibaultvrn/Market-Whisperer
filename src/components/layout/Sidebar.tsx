import Link from "next/link";
import { useRouter } from "next/router";
import {
  Globe,
  Newspaper,
  Radar,
  Settings,
  type LucideIcon
} from "lucide-react";

const menuItems = [
  { href: "/feed", label: "Weekly Market Outlook", icon: Newspaper },
  { href: "/map", label: "Geopolitical Risk Map", icon: Globe },
  { href: "/radar", label: "Next 7 Days Risk Radar", icon: Radar },
  { href: "/settings", label: "Settings", icon: Settings }
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLegalNotices: () => void;
  onOpenMethodology: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  onOpenLegalNotices,
  onOpenMethodology
}: SidebarProps) {
  const router = useRouter();

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close navigation drawer"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/50"
        />
      ) : null}

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed left-0 top-0 z-40 flex h-full w-60 flex-col border-r border-zinc-800/70 bg-zinc-950 p-3 transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 mt-10 lg:mt-0">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">Market Whisperer</p>
          <p className="mt-1 text-xs text-zinc-500">Weekly Market Outlook</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const active = router.pathname === item.href;
              const Icon = item.icon as LucideIcon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-2 rounded-md border-l-2 px-2.5 py-2 text-sm transition-colors ${
                    active
                      ? "border-l-cyan-400 bg-zinc-900/60 text-zinc-50"
                      : "border-l-transparent text-zinc-300 hover:bg-zinc-900/40"
                  }`}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-3 border-t border-zinc-800/60 pt-3">
          <div className="grid gap-2">
            <button
              type="button"
              onClick={onOpenLegalNotices}
              className="rounded-md border border-zinc-800/60 bg-zinc-900/20 px-2.5 py-2 text-left text-xs text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Legal notices
            </button>
            <button
              type="button"
              onClick={onOpenMethodology}
              className="rounded-md border border-zinc-800/60 bg-zinc-900/20 px-2.5 py-2 text-left text-xs text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Methodology
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
