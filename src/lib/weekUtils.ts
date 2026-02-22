/** Get Monday of week (ISO week) for a date string YYYY-MM-DD */
export function getWeekKey(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00Z");
  const day = d.getUTCDay();
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
  d.setUTCDate(diff);
  return d.toISOString().slice(0, 10);
}

/** Format week key as "Dec 16–22, 2025" */
export function formatWeekLabel(weekKey: string): string {
  const mon = new Date(weekKey + "T12:00:00Z");
  const sun = new Date(mon);
  sun.setUTCDate(sun.getUTCDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${fmt(mon)} – ${fmt(sun)}`;
}

/** Whether event should appear for selected week (same week only). */
export function eventVisibleForWeek(
  expectedDate: string | null | undefined,
  selectedWeekKey: string
): boolean {
  if (!expectedDate) return false;
  const eventWeek = getWeekKey(expectedDate);
  return eventWeek === selectedWeekKey;
}
