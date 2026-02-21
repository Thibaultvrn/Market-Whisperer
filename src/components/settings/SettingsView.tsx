import { useState } from "react";
import TickerSelector from "./TickerSelector";
import { useAppShellContext } from "../layout/AppShell";

export default function SettingsView() {
  const { favoriteTickers, setFavoriteTickers, setSelectedTickers } = useAppShellContext();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSelectedTickers(favoriteTickers.slice(0, 8));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1200);
  };

  return (
    <section className="space-y-3">
      <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4">
        <TickerSelector value={favoriteTickers} onChange={setFavoriteTickers} />

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-cyan-500 px-3.5 py-2 text-sm font-semibold text-zinc-950 transition-colors hover:bg-cyan-400"
          >
            Apply as selected universe
          </button>
          {saved ? <span className="text-xs text-green-300">Saved locally</span> : null}
        </div>
      </div>
    </section>
  );
}
