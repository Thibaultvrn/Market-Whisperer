import { useAppShellContext } from "../layout/AppShell";

export default function GeoRiskMapView() {
  const { response } = useAppShellContext();

  return (
    <section className="space-y-3">
      <article className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-8">
        <p className="text-sm font-medium text-zinc-200">
          Geo Risk Map will appear here when the backend provides geographic data.
        </p>
        {response ? (
          <p className="mt-2 text-xs text-zinc-500">
            {response.stocks.length} stocks analyzed — awaiting geographic risk layer.
          </p>
        ) : null}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/50 p-3 text-xs text-zinc-500">
            Americas
          </div>
          <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/50 p-3 text-xs text-zinc-500">
            Europe
          </div>
          <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/50 p-3 text-xs text-zinc-500">
            Asia
          </div>
        </div>
      </article>
    </section>
  );
}
