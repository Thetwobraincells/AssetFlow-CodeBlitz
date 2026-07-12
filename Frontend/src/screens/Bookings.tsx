import { useState } from "react";
import { AlertTriangle, Plus } from "lucide-react";
import Button from "../components/Button";
import StatusPill, { type Status } from "../components/StatusPill";

const resources = [
  { id: "res-b2", name: "Conference Room B2", tag: "AF-0301", status: "ongoing" as Status },
  { id: "res-scissor", name: "Heavy Duty Scissor Lift", tag: "AF-0412", status: "upcoming" as Status },
  { id: "res-van", name: "Company Van — MH01AB1234", tag: "AF-0177", status: "completed" as Status },
];

const bookingsByResource: Record<string, { id: string; who: string; start: string; end: string; status: Status }[]> = {
  "res-b2": [
    { id: "BK-201", who: "Priya Shah — Sprint Planning", start: "09:00", end: "10:00", status: "completed" },
    { id: "BK-202", who: "Raj Mehta — Client Call", start: "10:00", end: "11:00", status: "ongoing" },
  ],
  "res-scissor": [
    { id: "BK-210", who: "Field Ops — Warehouse B", start: "13:00", end: "15:00", status: "upcoming" },
  ],
  "res-van": [
    { id: "BK-190", who: "Logistics — Depot Run", start: "07:00", end: "09:30", status: "completed" },
  ],
};

export default function Bookings() {
  const [selected, setSelected] = useState(resources[0].id);
  const bookings = bookingsByResource[selected];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Resource list */}
      <div className="lg:col-span-4">
        <div className="bg-surface border border-border rounded-md overflow-hidden">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text">Bookable Resources</h2>
          </div>
          <div className="divide-y divide-border">
            {resources.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelected(r.id)}
                className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                  selected === r.id ? "bg-amber/5 border-l-2 border-l-amber" : "hover:bg-surface-hover border-l-2 border-l-transparent"
                }`}
              >
                <div>
                  <p className="text-sm text-text">{r.name}</p>
                  <p className="font-mono text-xs text-text-muted mt-0.5">{r.tag}</p>
                </div>
                <StatusPill status={r.status} label={r.status} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar / agenda for selected resource */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="bg-surface border border-border rounded-md overflow-hidden">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-text">{resources.find((r) => r.id === selected)?.name}</h2>
              <p className="text-xs text-text-muted">Today's schedule</p>
            </div>
            <div className="flex gap-1">
              <button className="label-caps px-2 py-1 rounded border border-amber/40 text-amber bg-amber/10">Day</button>
              <button className="label-caps px-2 py-1 rounded border border-border text-text-muted hover:text-text">Week</button>
            </div>
          </div>

          <div className="p-4 space-y-2">
            {bookings.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-3 py-2.5 bg-surface-low border border-border rounded">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-text-muted w-24 shrink-0">{b.start}–{b.end}</span>
                  <span className="text-sm text-text">{b.who}</span>
                </div>
                <StatusPill status={b.status} label={b.status} />
              </div>
            ))}

            {/* Rejected overlap example — PRD §6.5 / Room B2 case */}
            {selected === "res-b2" && (
              <div className="flex items-center justify-between px-3 py-2.5 bg-red/5 border border-red/30 rounded opacity-80">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-red w-24 shrink-0">09:30–10:30</span>
                  <span className="text-sm text-text-muted line-through">New request — Marketing sync</span>
                </div>
                <span className="flex items-center gap-1 text-xs text-red font-mono">
                  <AlertTriangle size={12} /> CONFLICTS WITH BK-201/202
                </span>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-border">
            <Button variant="primary" className="w-full flex items-center justify-center gap-2">
              <Plus size={16} /> New Booking
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}