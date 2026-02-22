import { useState } from "react";
import TickerSelector from "./TickerSelector";
import { useAppShellContext } from "../layout/AppShell";
import SectionCard from "../ui/SectionCard";

export default function SettingsView() {
  const { favoriteTickers, setFavoriteTickers, setSelectedTickers } = useAppShellContext();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSelectedTickers(favoriteTickers);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  };

  return (
    <div className="space-y-6">
      <SectionCard>
        <TickerSelector value={favoriteTickers} onChange={setFavoriteTickers} />

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-inner bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent/90"
          >
            Apply as selected universe
          </button>
          {saved ? <span className="text-xs text-risk-low">Saved locally</span> : null}
        </div>
      </SectionCard>
    </div>
  );
}
