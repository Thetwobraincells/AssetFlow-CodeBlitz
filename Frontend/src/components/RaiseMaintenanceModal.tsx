import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

export interface MaintenanceRequest {
  id: string;
  tag: string;
  asset: string;
  reporter: string;
  priority: "low" | "medium" | "high" | "critical";
  note: string;
  status: "pending";
}

interface Props {
  prefilledTag?: string;
  prefilledAsset?: string;
  onClose: () => void;
  onSave: (req: MaintenanceRequest) => void;
}

const priorities = ["low", "medium", "high", "critical"] as const;

const priorityStyle: Record<string, string> = {
  low:      "bg-slate/10 border-slate text-slate",
  medium:   "bg-blue/10 border-blue text-blue",
  high:     "bg-orange/10 border-orange text-orange",
  critical: "bg-red/10 border-red text-red",
};

export default function RaiseMaintenanceModal({ prefilledTag, prefilledAsset, onClose, onSave }: Props) {
  const [tag, setTag]           = useState(prefilledTag   ?? "");
  const [asset, setAsset]       = useState(prefilledAsset ?? "");
  const [reporter, setReporter] = useState("");
  const [priority, setPriority] = useState<typeof priorities[number]>("medium");
  const [note, setNote]         = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = `MNT-${Math.floor(1000 + Math.random() * 9000)}`;
    onSave({ id, tag: tag.toUpperCase(), asset, reporter: reporter || "Self", priority, note, status: "pending" });
  }

  const inputCls =
    "w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-amber/60 placeholder:text-text-muted";

  return (
    <Modal title="Raise Maintenance Request" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-caps text-text-muted block mb-1.5">Asset Tag</label>
            <input
              required
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              disabled={!!prefilledTag}
              placeholder="AF-0001"
              className={`${inputCls} font-mono uppercase ${prefilledTag ? "opacity-70 cursor-not-allowed" : ""}`}
            />
          </div>
          <div>
            <label className="label-caps text-text-muted block mb-1.5">Asset Name</label>
            <input
              required
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              disabled={!!prefilledAsset}
              placeholder="Dell Latitude 5420"
              className={`${inputCls} ${prefilledAsset ? "opacity-70 cursor-not-allowed" : ""}`}
            />
          </div>
        </div>

        <div>
          <label className="label-caps text-text-muted block mb-1.5">Reported By</label>
          <input
            value={reporter}
            onChange={(e) => setReporter(e.target.value)}
            placeholder="Your name or SYS_AUTO"
            className={inputCls}
          />
        </div>

        <div>
          <label className="label-caps text-text-muted block mb-2">Priority</label>
          <div className="flex gap-2">
            {priorities.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 py-1.5 rounded-md text-xs border capitalize transition-colors ${
                  priority === p ? priorityStyle[p] : "border-border text-text-muted hover:text-text"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label-caps text-text-muted block mb-1.5">Description</label>
          <textarea
            required
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Describe the issue in detail..."
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
