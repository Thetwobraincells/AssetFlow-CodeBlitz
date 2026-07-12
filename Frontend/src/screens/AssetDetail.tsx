import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import StatusPill from "../components/StatusPill";

const tabs = ["Details", "Allocation History", "Maintenance History"] as const;

const allocationHistory = [
  { date: "2026-06-01", event: "Allocated to Priya Shah", by: "Asset Manager" },
  { date: "2026-03-14", event: "Returned by Raj Mehta", by: "Raj Mehta" },
  { date: "2025-11-02", event: "Allocated to Raj Mehta", by: "Asset Manager" },
];

const maintenanceHistory = [
  { date: "2026-05-10", event: "Resolved — screen replacement", by: "TECH-42" },
  { date: "2026-05-02", event: "Raised — display flickering", by: "Priya Shah" },
];

export default function AssetDetail({ tag, onBack }: { tag: string; onBack: () => void }) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Details");

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={14} /> Back to Asset Directory
      </button>

      <div className="flex items-center gap-3">
        <span className="font-mono text-lg text-amber">{tag}</span>
        <StatusPill status="allocated" label="Allocated" />
      </div>

      <div className="border-b border-border flex gap-6">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2.5 text-sm border-b-2 transition-colors ${
              tab === t ? "border-amber text-text" : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Details" && (
        <div className="grid grid-cols-2 gap-4 bg-surface border border-border rounded-md p-5">
          <DetailRow label="Name" value="Dell Latitude 5420" />
          <DetailRow label="Category" value="Electronics" />
          <DetailRow label="Serial Number" value="SN-88213X" mono />
          <DetailRow label="Acquisition Date" value="12 Jan 2025" />
          <DetailRow label="Acquisition Cost" value="₹78,000" mono />
          <DetailRow label="Condition" value="Good" />
          <DetailRow label="Location" value="Mumbai HQ - 4F" />
          <DetailRow label="Department" value="Engineering" />
        </div>
      )}

      {tab === "Allocation History" && (
        <HistoryTimeline items={allocationHistory} />
      )}

      {tab === "Maintenance History" && (
        <HistoryTimeline items={maintenanceHistory} />
      )}
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="label-caps text-text-muted mb-1">{label}</p>
      <p className={`text-sm text-text ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function HistoryTimeline({ items }: { items: { date: string; event: string; by: string }[] }) {
  return (
    <div className="bg-surface border border-border rounded-md p-5">
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex gap-4 relative pl-4 border-l border-border">
            <div className="absolute left-[-4.5px] top-1 w-2 h-2 rounded-full bg-amber" />
            <div>
              <p className="font-mono text-xs text-text-muted">{item.date}</p>
              <p className="text-sm text-text">{item.event}</p>
              <p className="text-xs text-text-muted">by {item.by}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}