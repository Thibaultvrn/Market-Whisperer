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
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
        />
      ) : null}

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-border-subtle bg-base p-4 shadow-elevated transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-6 mt-10 lg:mt-0">
          <p className="text-sm font-semibold tracking-wide text-t-primary">
            Market Whisperer
          </p>
          <p className="mt-0.5 text-xs text-t-tertiary">Risk Intelligence</p>
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
                  className={`flex items-center gap-3 rounded-inner px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "bg-elevated text-t-primary font-medium"
                      : "text-t-secondary hover:bg-elevated/60 hover:text-t-primary"
                  }`}
                >
                  <Icon size={16} className={active ? "text-accent" : ""} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-3 space-y-2 border-t border-border-subtle pt-4">
          <button
            type="button"
            onClick={onOpenLegalNotices}
            className="w-full rounded-inner px-3 py-2 text-left text-xs text-t-tertiary transition-colors hover:bg-elevated hover:text-t-secondary"
          >
            Legal notices
          </button>
          <button
            type="button"
            onClick={onOpenMethodology}
            className="w-full rounded-inner px-3 py-2 text-left text-xs text-t-tertiary transition-colors hover:bg-elevated hover:text-t-secondary"
          >
            Methodology
          </button>
        </div>
      </aside>
    </>
  );
}
