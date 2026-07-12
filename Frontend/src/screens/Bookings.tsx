import { useState } from "react";
import { AlertTriangle, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../components/Button";
import StatusPill, { type Status } from "../components/StatusPill";
import NewBookingModal, { type Booking } from "../components/NewBookingModal";
import { useToast } from "../components/Toast";
import { apiRequest } from "../lib/api";

/* ------------------------------------------------------------------ */
/* Types                                                                 */
/* ------------------------------------------------------------------ */

interface Resource {
  id: string;
  name: string;
  tag: string;
  status: Status;
}

/* ------------------------------------------------------------------ */
/* Week calendar helper                                                  */
/* ------------------------------------------------------------------ */

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekHours = Array.from({ length: 10 }, (_, i) => `${String(8 + i).padStart(2, "0")}:00`);

/* ------------------------------------------------------------------ */
/* Helpers                                                               */
/* ------------------------------------------------------------------ */

function mapBookingStatus(b: any): "upcoming" | "ongoing" | "completed" {
  if (b.status === 'cancelled') return 'completed';
  const now = new Date();
  const start = new Date(b.start_time);
  const end   = new Date(b.end_time);
  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'ongoing';
  return 'completed';
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function toBooking(b: any): Booking {
  return {
    id:      b.id,
    who:     `${b.booked_by?.name || 'Unknown'} — ${b.purpose || ''}`,
    start:   formatTime(b.start_time),
    end:     formatTime(b.end_time),
    purpose: b.purpose || '',
    status:  mapBookingStatus(b),
  };
}

/* ------------------------------------------------------------------ */
/* Screen                                                                */
/* ------------------------------------------------------------------ */

export default function Bookings() {
  const queryClient = useQueryClient();
  const { show, ToastOutlet } = useToast();

  // Fetch all bookings
  const { data: bookingsResponse, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn:  () => apiRequest('/bookings'),
  });

  // Fetch bookable assets (available + booked assets to use as resources)
  const { data: assetsResponse } = useQuery({
    queryKey: ['assets'],
    queryFn:  () => apiRequest('/assets'),
  });

  const allBookings: any[] = bookingsResponse?.data || [];
  const allAssets:   any[] = assetsResponse?.data    || [];

  // Build resource list from assets that appear in bookings, or are bookable
  const bookableAssets = allAssets.filter((a: any) =>
    ['available', 'reserved', 'allocated'].includes(a.status)
  );

  // Group bookings by asset_id
  const bookingsByAsset: Record<string, Booking[]> = {};
  for (const b of allBookings) {
    const key = b.asset_id;
    if (!bookingsByAsset[key]) bookingsByAsset[key] = [];
    bookingsByAsset[key].push(toBooking(b));
  }

  // Merge: assets that have bookings + other bookable assets
  const assetsWithBookings = allAssets.filter((a: any) => bookingsByAsset[a.id]?.length > 0);
  const resourcePool = assetsWithBookings.length > 0 ? assetsWithBookings : bookableAssets;

  const resources: Resource[] = resourcePool.slice(0, 10).map((a: any) => {
    const bkgs = bookingsByAsset[a.id] || [];
    const hasOngoing  = bkgs.some((b) => b.status === 'ongoing');
    const hasUpcoming = bkgs.some((b) => b.status === 'upcoming');
    const status: Status = hasOngoing ? 'ongoing' : hasUpcoming ? 'upcoming' : 'completed';
    return { id: a.id, name: a.name, tag: a.asset_tag, status };
  });

  const [selected, setSelected]           = useState<string>('');
  const [viewMode, setViewMode]           = useState<"day" | "week">("day");
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);

  const selectedId    = selected || resources[0]?.id || '';
  const selectedRes   = resources.find((r) => r.id === selectedId) || resources[0];
  const currentBookings = bookingsByAsset[selectedId] || [];

  async function addBooking(b: Booking) {
    if (!selectedRes) return;
    try {
      // Build ISO datetimes from today + time slot
      const today = new Date().toISOString().slice(0, 10);
      await apiRequest('/bookings', {
        method: 'POST',
        body: JSON.stringify({
          asset_id:   selectedRes.id,
          start_time: `${today}T${b.start}:00.000Z`,
          end_time:   `${today}T${b.end}:00.000Z`,
          purpose:    b.purpose,
        }),
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      show(`Booking confirmed.`);
      setShowNewBooking(false);
    } catch (err: any) {
      show(err.message || 'Failed to create booking', 'info');
    }
  }

  async function cancelBooking(id: string) {
    try {
      await apiRequest(`/bookings/${id}`, { method: 'DELETE' });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      show("Booking cancelled.", "info");
      setDetailBooking(null);
    } catch (err: any) {
      show(err.message || 'Failed to cancel booking', 'info');
    }
  }

  /* Status colour */
  const slotBorder: Record<string, string> = {
    completed: "border-slate/30 bg-surface-low",
    ongoing:   "border-teal/30 bg-teal/5",
    upcoming:  "border-blue/30 bg-blue/5",
  };

  if (bookingsLoading) {
    return <div className="p-8 text-center text-text-muted">Loading bookings...</div>;
  }

  if (resources.length === 0) {
    return <div className="p-8 text-center text-text-muted">No bookable assets found.</div>;
  }

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
                  selectedId === r.id
                    ? "bg-amber/5 border-l-2 border-l-amber"
                    : "hover:bg-surface-hover border-l-2 border-l-transparent"
                }`}
              >
                <div>
                  <p className="text-sm text-text">{r.name}</p>
                  <p className="font-mono text-xs text-text-muted mt-0.5">{r.tag}</p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {(bookingsByAsset[r.id] || []).filter((b) => b.status !== "completed").length} upcoming/ongoing
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
              <h2 className="text-sm font-semibold text-text">{selectedRes?.name}</h2>
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
                <span className="text-xs text-text-muted font-mono">This Week</span>
                <button className="p-1 text-text-muted hover:text-text"><ChevronRight size={16} /></button>
              </div>
              <div className="min-w-[560px]">
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

      {/* ---- Booking detail modal ---- */}
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
                <span className="font-mono text-amber">{detailBooking.id.slice(0, 8)}…</span>
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
      {showNewBooking && selectedRes && (
        <NewBookingModal
          resourceName={selectedRes.name}
          existingBookings={currentBookings}
          onClose={() => setShowNewBooking(false)}
          onSave={addBooking}
        />
      )}

      {ToastOutlet}
    </div>
  );
}