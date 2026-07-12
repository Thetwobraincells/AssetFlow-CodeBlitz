import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { AlertTriangle } from "lucide-react";

export interface Booking {
  id: string;
  who: string;
  start: string;
  end: string;
  purpose: string;
  status: "upcoming" | "ongoing" | "completed";
}

interface Props {
  resourceName: string;
  existingBookings: Booking[];
  onClose: () => void;
  onSave: (booking: Booking) => void;
}

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function hasConflict(start: string, end: string, bookings: Booking[]): boolean {
  const s = toMinutes(start);
  const e = toMinutes(end);
  return bookings.some((b) => {
    if (b.status === "completed") return false;
    const bs = toMinutes(b.start);
    const be = toMinutes(b.end);
    return s < be && e > bs;
  });
}

const hours = Array.from({ length: 16 }, (_, i) => {
  const h = 7 + i;
  return `${String(h).padStart(2, "0")}:00`;
});

export default function NewBookingModal({ resourceName, existingBookings, onClose, onSave }: Props) {
  const [start, setStart]     = useState("09:00");
  const [end, setEnd]         = useState("10:00");
  const [bookedBy, setBookedBy] = useState("");
  const [purpose, setPurpose] = useState("");
  const [conflict, setConflict] = useState(false);

  function checkConflict(s = start, e = end) {
    setConflict(hasConflict(s, e, existingBookings));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (conflict) return;
    const id = `BK-${Math.floor(200 + Math.random() * 100)}`;
    onSave({ id, who: `${bookedBy} — ${purpose}`, start, end, purpose, status: "upcoming" });
  }

  const inputCls =
    "w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-amber/60 placeholder:text-text-muted";

  return (
    <Modal title="New Booking" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-surface-high border border-border rounded-md px-4 py-2.5">
          <p className="text-sm text-text-muted">Resource</p>
          <p className="text-sm font-medium text-text">{resourceName}</p>
        </div>

        <div>
          <label className="label-caps text-text-muted block mb-1.5">Booked By</label>
          <input
            required
            value={bookedBy}
            onChange={(e) => setBookedBy(e.target.value)}
            placeholder="Raj Mehta"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-caps text-text-muted block mb-1.5">Start Time</label>
            <select
              value={start}
              onChange={(e) => { setStart(e.target.value); checkConflict(e.target.value, end); }}
              className={inputCls}
            >
              {hours.map((h) => <option key={h}>{h}</option>)}
            </select>
          </div>
          <div>
            <label className="label-caps text-text-muted block mb-1.5">End Time</label>
            <select
              value={end}
              onChange={(e) => { setEnd(e.target.value); checkConflict(start, e.target.value); }}
              className={inputCls}
            >
              {hours.map((h) => <option key={h}>{h}</option>)}
            </select>
          </div>
        </div>

        {conflict && (
          <div className="flex items-start gap-2 text-xs text-red bg-red/5 border border-red/30 rounded-md p-3">
            <AlertTriangle size={13} className="mt-0.5 shrink-0" />
            <span>This time slot conflicts with an existing booking. Please choose a different time.</span>
          </div>
        )}

        <div>
          <label className="label-caps text-text-muted block mb-1.5">Purpose</label>
          <input
            required
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Sprint Planning"
            className={inputCls}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit" disabled={conflict}>Confirm Booking</Button>
        </div>
      </form>
    </Modal>
  );
}
