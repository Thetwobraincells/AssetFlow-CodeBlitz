import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

interface Props {
  onClose: () => void;
  onSave: (req: AllocationRequest) => void;
}

export interface AllocationRequest {
  id: string;
  assetTag: string;
  assetName: string;
  department: string;
  requestedBy: string;
  neededBy: string;
  notes: string;
  type: "reserve" | "allocate";
}

const departments = ["Engineering", "Facilities", "Field Ops", "Marketing", "Admin", "IT", "Logistics", "Design"];

// Simulated asset lookup
const assetLookup: Record<string, string> = {
  "AF-0001": "Dell Latitude 5420",
  "AF-0002": "Herman Miller Aeron",
  "AF-0003": "Toyota Innova",
  "AF-0004": "Epson EB-X05 Projector",
  "AF-0005": "HP LaserJet Pro M404",
};

export default function NewAllocationRequestModal({ onClose, onSave }: Props) {
  const [assetTag, setAssetTag]       = useState("");
  const [resolvedName, setResolvedName] = useState("");
  const [department, setDepartment]   = useState(departments[0]);
  const [requestedBy, setRequestedBy] = useState("");
  const [neededBy, setNeededBy]       = useState("");
  const [notes, setNotes]             = useState("");
  const [type, setType]               = useState<"reserve" | "allocate">("allocate");

  function handleTagBlur() {
    setResolvedName(assetLookup[assetTag.toUpperCase()] ?? "");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = `REQ-${Math.floor(8000 + Math.random() * 1000)}`;
    onSave({
      id,
      assetTag: assetTag.toUpperCase(),
      assetName: resolvedName || assetTag,
      department,
      requestedBy,
      neededBy,
      notes,
      type,
    });
  }

  const inputCls =
    "w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-amber/60 placeholder:text-text-muted";

  return (
    <Modal title="New Allocation Request" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-caps text-text-muted block mb-1.5">Request Type</label>
          <div className="flex gap-2">
            {(["allocate", "reserve"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`px-3 py-1.5 rounded-md text-xs border capitalize transition-colors ${
                  type === t
                    ? "bg-amber/10 border-amber text-amber"
                    : "border-border text-text-muted hover:text-text"
                }`}
              >
                {t === "allocate" ? "Allocate" : "Reserve"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-caps text-text-muted block mb-1.5">Asset Tag</label>
            <input
              required
              value={assetTag}
              onChange={(e) => setAssetTag(e.target.value)}
              onBlur={handleTagBlur}
              placeholder="AF-0001"
              className={`${inputCls} font-mono uppercase`}
            />
            {resolvedName && (
              <p className="text-xs text-teal mt-1">✓ {resolvedName}</p>
            )}
          </div>
          <div>
            <label className="label-caps text-text-muted block mb-1.5">Requested By</label>
            <input
              required
              value={requestedBy}
              onChange={(e) => setRequestedBy(e.target.value)}
              placeholder="Priya Shah"
              className={inputCls}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-caps text-text-muted block mb-1.5">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className={inputCls}
            >
              {departments.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label-caps text-text-muted block mb-1.5">Needed By</label>
            <input
              required
              type="date"
              value={neededBy}
              onChange={(e) => setNeededBy(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label className="label-caps text-text-muted block mb-1.5">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional context..."
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit">Submit Request</Button>
        </div>
      </form>
    </Modal>
  );
}
