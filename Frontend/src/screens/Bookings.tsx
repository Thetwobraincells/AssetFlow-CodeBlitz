import { useState } from "react";
import { AlertTriangle, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "../components/Button";
import StatusPill, { type Status } from "../components/StatusPill";
import NewBookingModal, { type Booking } from "../components/NewBookingModal";
import { useToast } from "../components/Toast";

/* ------------------------------------------------------------------ */
/* Types & initial data                                                  */
/* ------------------------------------------------------------------ */

interface Resource {
  id: string;
  name: string;
  tag: string;
  status: Status;
}

const resources: Resource[] = [
  { id: "res-b2",      name: "Conference Room B2",          tag: "AF-0301", status: "ongoing" as Status },
  { id: "res-scissor", name: "Heavy Duty Scissor Lift",     tag: "AF-0412", status: "upcoming" as Status },
  { id: "res-van",     name: "Company Van — MH01AB1234",    tag: "AF-0177", status: "completed" as Status },
];

const initBookingsByResource: Record<string, Booking[]> = {
  "res-b2": [
    { id: "BK-201", who: "Priya Shah — Sprint Planning",  start: "09:00", end: "10:00", purpose: "Sprint Planning", status: "completed" },
    { id: "BK-202", who: "Raj Mehta — Client Call",       start: "10:00", end: "11:00", purpose: "Client Call",     status: "ongoing" },
  ],
  "res-scissor": [
    { id: "BK-210", who: "Field Ops — Warehouse B", start: "13:00", end: "15:00", purpose: "Warehouse B", status: "upcoming" },
  ],
  "res-van": [
    { id: "BK-190", who: "Logistics — Depot Run", start: "07:00", end: "09:30", purpose: "Depot Run", status: "completed" },
  ],
};

/* ------------------------------------------------------------------ */
/* Week calendar helper                                                  */
/* ------------------------------------------------------------------ */

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekHours = Array.from({ length: 10 }, (_, i) => `${String(8 + i).padStart(2, "0")}:00`);

/* ------------------------------------------------------------------ */
/* Screen                                                                */
/* ------------------------------------------------------------------ */

export default function Bookings() {
  const [selected, setSelected]           = useState(resources[0].id);
  const [bookings, setBookings]           = useState<Record<string, Booking[]>>(initBookingsByResource);
  const [viewMode, setViewMode]           = useState<"day" | "week">("day");
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const { show, ToastOutlet }             = useToast();

  const selectedResource = resources.find((r) => r.id === selected)!;
  const currentBookings  = bookings[selected] ?? [];

  function addBooking(b: Booking) {
    setBookings((prev) => ({
      ...prev,
      [selected]: [...(prev[selected] ?? []), b],
    }));
    show(`Booking ${b.id} confirmed.`);
    setShowNewBooking(false);
  }

  function cancelBooking(id: string) {
    setBookings((prev) => ({
      ...prev,
      [selected]: (prev[selected] ?? []).filter((b) => b.id !== id),
    }));
    show("Booking cancelled.", "info");
    setDetailBooking(null);
  }

  /* Status colour */
  const slotBorder: Record<string, string> = {
    completed: "border-slate/30 bg-surface-low",
    ongoing:   "border-teal/30 bg-teal/5",
    upcoming:  "border-blue/30 bg-blue/5",
  };

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
                  selected === r.id
                    ? "bg-amber/5 border-l-2 border-l-amber"
                    : "hover:bg-surface-hover border-l-2 border-l-transparent"
                }`}
              >
                <div>
                  <p className="text-sm text-text">{r.name}</p>
                  <p className="font-mono text-xs text-text-muted mt-0.5">{r.tag}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {(bookings[r.id] ?? []).filter((b) => b.status !== "completed").length} upcoming/ongoing
                  </p>
                </div>
                <StatusPill status={r.status} label={r.status} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="bg-surface border border-border rounded-md overflow-hidden">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-text">{selectedResource.name}</h2>
              <p className="text-xs text-text-muted">Today's schedule</p>
            </div>
            {/* Day / Week toggle */}
            <div className="flex gap-1">
              {(["day", "week"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setViewMode(m)}
                  className={`label-caps px-2 py-1 rounded border transition-colors ${
                    viewMode === m
                      ? "border-amber/40 text-amber bg-amber/10"
                      : "border-border text-text-muted hover:text-text"
                  }`}
                >
                  {m === "day" ? "Day" : "Week"}
                </button>
              ))}
            </div>
          </div>

          {/* ---- Day view ---- */}
          {viewMode === "day" && (
            <div className="p-4 space-y-2">
              {currentBookings.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setDetailBooking(b)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 border rounded transition-colors hover:brightness-105 ${slotBorder[b.status] ?? "border-border bg-surface-low"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-text-muted w-24 shrink-0">{b.start}–{b.end}</span>
                    <span className="text-sm text-text">{b.who}</span>
                  </div>
                  <StatusPill status={b.status as Status} label={b.status} />
                </button>
              ))}

              {/* Conflict example for Room B2 */}
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

              {currentBookings.length === 0 && (
                <p className="text-sm text-text-muted text-center py-6">No bookings for today.</p>
              )}
            </div>
          )}

          {/* ---- Week view ---- */}
          {viewMode === "week" && (
            <div className="p-4 overflow-x-auto">
              <div className="flex items-center justify-between mb-3">
                <button className="p-1 text-text-muted hover:text-text"><ChevronLeft size={16} /></button>
                <span className="text-xs text-text-muted font-mono">Week of Oct 14 – Oct 20</span>
                <button className="p-1 text-text-muted hover:text-text"><ChevronRight size={16} /></button>
              </div>
              <div className="min-w-[560px]">
                {/* Hour labels + grid */}
                <div className="grid grid-cols-[48px_repeat(7,1fr)] gap-1 mb-1">
                  <div />
                  {weekDays.map((d) => (
                    <div key={d} className="font-mono text-[10px] text-text-muted text-center">{d}</div>
                  ))}
                </div>
                {weekHours.map((h) => (
                  <div key={h} className="grid grid-cols-[48px_repeat(7,1fr)] gap-1 mb-1">
                    <div className="font-mono text-[10px] text-text-muted text-right pr-2 pt-0.5">{h}</div>
                    {weekDays.map((d) => {
                      // Highlight bookings on Tuesday (index 1) and Thursday (index 3) as example
                      const hasBooking = currentBookings.some(
                        (b) => (d === "Tue" || d === "Thu") && h >= b.start.slice(0, 5) && h < b.end.slice(0, 5)
                      );
                      return (
                        <div
                          key={d}
                          className={`h-6 rounded-sm border transition-colors ${
                            hasBooking
                              ? "bg-amber/20 border-amber/30"
                              : "bg-surface-high border-border/50 hover:bg-surface-hover cursor-pointer"
                          }`}
                          title={hasBooking ? "Booked" : `${d} ${h} — Click to book`}
                          onClick={hasBooking ? undefined : () => setShowNewBooking(true)}
                        />
                      );
                    })}
                  </div>
                ))}
                <div className="mt-3 flex items-center gap-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber/20 border border-amber/30" /> Booked</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-surface-high border border-border/50" /> Available</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 border-t border-border">
            <Button
              variant="primary"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => setShowNewBooking(true)}
            >
              <Plus size={16} /> New Booking
            </Button>
          </div>
        </div>
      </div>

      {/* ---- Booking detail drawer / modal ---- */}
      {detailBooking && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDetailBooking(null)} />
          <div className="relative w-full max-w-sm bg-surface border border-border-bright rounded-md shadow-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text">Booking Detail</h3>
              <button onClick={() => setDetailBooking(null)} className="text-text-muted hover:text-text">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">ID</span>
                <span className="font-mono text-amber">{detailBooking.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Time</span>
                <span className="font-mono text-text">{detailBooking.start}–{detailBooking.end}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Booked by</span>
                <span className="text-text">{detailBooking.who}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Status</span>
                <StatusPill status={detailBooking.status as Status} label={detailBooking.status} />
              </div>
            </div>
            {detailBooking.status === "upcoming" && (
              <Button
                variant="outline"
                className="w-full !border-red/40 !text-red hover:!bg-red/10"
                onClick={() => cancelBooking(detailBooking.id)}
              >
                Cancel Booking
              </Button>
            )}
          </div>
        </div>
      )}

      {/* New Booking Modal */}
      {showNewBooking && (
        <NewBookingModal
          resourceName={selectedResource.name}
          existingBookings={currentBookings}
          onClose={() => setShowNewBooking(false)}
          onSave={addBooking}
        />
      )}

      {ToastOutlet}
    </div>
  );
}