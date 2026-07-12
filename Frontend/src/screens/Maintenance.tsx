import { Plus } from "lucide-react";
import Button from "../components/Button";

type Priority = "low" | "medium" | "high" | "critical";

const priorityColor: Record<Priority, string> = {
  low: "border-l-slate",
  medium: "border-l-blue",
  high: "border-l-orange",
  critical: "border-l-red",
};

const priorityBadge: Record<Priority, string> = {
  low: "bg-slate/10 text-slate border-slate/30",
  medium: "bg-blue/10 text-blue border-blue/30",
  high: "bg-orange/10 text-orange border-orange/30",
  critical: "bg-red/10 text-red border-red/30",
};

type Card = { tag: string; asset: string; reporter: string; priority: Priority; note: string };

const columns: { key: string; title: string; dot: string; cards: Card[] }[] = [
  {
    key: "pending",
    title: "Pending",
    dot: "bg-slate",
    cards: [
      { tag: "AF-2110", asset: "Hydraulic Press A", reporter: "SYS_AUTO", priority: "critical", note: "Pressure valve leak detected." },
    ],
  },
  {
    key: "approved",
    title: "Approved",
    dot: "bg-teal",
    cards: [
      { tag: "AF-8442", asset: "Conveyor Motor 04", reporter: "T. Silva", priority: "high", note: "Thermal sensor pre-failure reading." },
    ],
  },
  {
    key: "technician_assigned",
    title: "Technician Assigned",
    dot: "bg-blue",
    cards: [
      { tag: "AF-0062", asset: "Projector — Epson EB-X05", reporter: "M. Chen", priority: "medium", note: "Tech: R. Fernandes assigned." },
    ],
  },
  {
    key: "in_progress",
    title: "In Progress",
    dot: "bg-orange",
    cards: [
      { tag: "AF-3099", asset: "Forklift L-Series", reporter: "OP-104", priority: "high", note: "Battery cell replacement underway." },
    ],
  },
  {
    key: "resolved",
    title: "Resolved",
    dot: "bg-teal",
    cards: [
      { tag: "AF-5501", asset: "CNC Lathe QT-250MY", reporter: "TECH-42", priority: "low", note: "Scheduled calibration completed." },
    ],
  },
];

export default function Maintenance() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Track maintenance requests from report through resolution.</p>
        <Button variant="primary" className="flex items-center gap-1.5">
          <Plus size={14} /> Raise Request
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-start">
        {columns.map((col) => (
          <div key={col.key}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <h2 className="label-caps text-text">{col.title}</h2>
              </div>
              <span className="text-xs font-mono bg-surface-high border border-border rounded px-1.5 py-0.5 text-text-muted">
                {col.cards.length}
              </span>
            </div>

            <div className="space-y-3">
              {col.cards.map((c) => (
                <div
                  key={c.tag}
                  className={`relative bg-surface border ${
                    c.priority === "critical" ? "border-red/30" : "border-border"
                  } rounded-md p-3 overflow-hidden`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${priorityColor[c.priority].replace("border-l-", "bg-")}`} />
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-amber">{c.tag}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono uppercase ${priorityBadge[c.priority]}`}>
                      {c.priority}
                    </span>
                  </div>
                  <h3 className="text-sm font-medium text-text">{c.asset}</h3>
                  <p className="text-xs text-text-muted mt-1">{c.note}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/60">
                    <span className="text-xs text-text-muted">{c.reporter}</span>
                    {col.key !== "resolved" && (
                      <Button variant="ghost" className="!px-2 !py-1 text-xs">
                        {col.key === "pending" && "Approve"}
                        {col.key === "approved" && "Assign Tech"}
                        {col.key === "technician_assigned" && "Start Work"}
                        {col.key === "in_progress" && "Resolve"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {col.cards.length === 0 && (
                <div className="text-xs text-text-muted border border-dashed border-border rounded-md p-4 text-center">
                  No items
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}