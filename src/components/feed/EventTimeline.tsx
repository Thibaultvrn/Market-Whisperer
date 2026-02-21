import type { FutureEvent } from "../../lib/types";
import EventCard from "./EventCard";

interface EventTimelineProps {
  events: FutureEvent[];
  onOpen: (event: FutureEvent) => void;
}

export default function EventTimeline({ events, onOpen }: EventTimelineProps) {
  return (
    <section className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3">
      <h2 className="mb-2 text-[17px] font-semibold text-zinc-100">Upcoming Catalysts</h2>
      {events.length === 0 ? (
        <p className="text-sm text-zinc-400">
          No upcoming catalysts found for the current portfolio.
        </p>
      ) : (
        <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
          {events.map((event) => (
            <EventCard key={`${event.title}-${event.type}`} event={event} onOpen={onOpen} />
          ))}
        </div>
      )}
    </section>
  );
}
