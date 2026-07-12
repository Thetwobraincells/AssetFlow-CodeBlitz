import { useState } from "react";
import { Plus } from "lucide-react";
import Button from "../components/Button";
import RaiseMaintenanceModal, { type MaintenanceRequest } from "../components/RaiseMaintenanceModal";
import AssignTechModal from "../components/AssignTechModal";
import ResolveModal from "../components/ResolveModal";
import { useToast } from "../components/Toast";

/* ------------------------------------------------------------------ */
/* Types                                                                 */
/* ------------------------------------------------------------------ */

type Priority = "low" | "medium" | "high" | "critical";
type MaintStatus = "pending" | "approved" | "technician_assigned" | "in_progress" | "resolved";

interface Card {
  id: string;
  tag: string;
  asset: string;
  reporter: string;
  priority: Priority;
  note: string;
  status: MaintStatus;
}

/* ------------------------------------------------------------------ */
/* Style maps                                                            */
/* ------------------------------------------------------------------ */

const priorityColor: Record<Priority, string> = {
  low:      "bg-slate",
  medium:   "bg-blue",
  high:     "bg-orange",
  critical: "bg-red",
};

const priorityBadge: Record<Priority, string> = {
  low:      "bg-slate/10 text-slate border-slate/30",
  medium:   "bg-blue/10 text-blue border-blue/30",
  high:     "bg-orange/10 text-orange border-orange/30",
  critical: "bg-red/10 text-red border-red/30",
};

/* ------------------------------------------------------------------ */
/* Column definitions                                                    */
/* ------------------------------------------------------------------ */

const columns: { key: MaintStatus; title: string; dot: string; actionLabel?: string }[] = [
  { key: "pending",             title: "Pending",             dot: "bg-slate",   actionLabel: "Approve" },
  { key: "approved",            title: "Approved",            dot: "bg-teal",    actionLabel: "Assign Tech" },
  { key: "technician_assigned", title: "Technician Assigned", dot: "bg-blue",    actionLabel: "Start Work" },
  { key: "in_progress",         title: "In Progress",         dot: "bg-orange",  actionLabel: "Resolve" },
  { key: "resolved",            title: "Resolved",            dot: "bg-teal" },
];

/* ------------------------------------------------------------------ */
/* Initial data                                                          */
/* ------------------------------------------------------------------ */

const initCards: Card[] = [
  { id: "MNT-0001", tag: "AF-2110", asset: "Hydraulic Press A",         reporter: "SYS_AUTO",  priority: "critical", note: "Pressure valve leak detected.",         status: "pending" },
  { id: "MNT-0002", tag: "AF-8442", asset: "Conveyor Motor 04",          reporter: "T. Silva",  priority: "high",     note: "Thermal sensor pre-failure reading.",   status: "approved" },
  { id: "MNT-0003", tag: "AF-0062", asset: "Projector — Epson EB-X05",   reporter: "M. Chen",   priority: "medium",   note: "Tech: R. Fernandes assigned.",          status: "technician_assigned" },
  { id: "MNT-0004", tag: "AF-3099", asset: "Forklift L-Series",          reporter: "OP-104",    priority: "high",     note: "Battery cell replacement underway.",    status: "in_progress" },
  { id: "MNT-0005", tag: "AF-5501", asset: "CNC Lathe QT-250MY",         reporter: "TECH-42",   priority: "low",      note: "Scheduled calibration completed.",      status: "resolved" },
];

/* ------------------------------------------------------------------ */
/* Screen                                                                */
/* ------------------------------------------------------------------ */

export default function Maintenance() {
  const [cards, setCards]               = useState<Card[]>(initCards);
  const [showRaise, setShowRaise]       = useState(false);
  const [assignTarget, setAssignTarget] = useState<Card | null>(null);
  const [resolveTarget, setResolveTarget] = useState<Card | null>(null);
  const { show, ToastOutlet }           = useToast();

  /* State transitions */
  const nextStatus: Partial<Record<MaintStatus, MaintStatus>> = {
    pending:             "approved",
    approved:            "technician_assigned",
    technician_assigned: "in_progress",
    in_progress:         "resolved",
  };

  function handleAction(card: Card) {
    if (card.status === "approved") {
      // Assign tech — open modal
      setAssignTarget(card);
      return;
    }
    if (card.status === "in_progress") {
      // Resolve — open modal
      setResolveTarget(card);
      return;
    }
    // Approve or Start Work — direct transition
    const next = nextStatus[card.status];
    if (next) {
      setCards((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, status: next } : c))
      );
      const labels: Partial<Record<MaintStatus, string>> = {
        pending: "approved",
        technician_assigned: "started",
      };
      show(`${card.asset} marked as ${labels[card.status] ?? next}.`, "success");
    }
  }

  function saveAssignment(tech: string) {
    if (!assignTarget) return;
    setCards((prev) =>
      prev.map((c) =>
        c.id === assignTarget.id
          ? { ...c, status: "technician_assigned", note: `Tech: ${tech} assigned.` }
          : c
      )
    );
    show(`${tech} assigned to ${assignTarget.asset}.`);
    setAssignTarget(null);
  }

  function saveResolve(notes: string) {
    if (!resolveTarget) return;
    setCards((prev) =>
      prev.map((c) =>
        c.id === resolveTarget.id
          ? { ...c, status: "resolved", note: notes }
          : c
      )
    );
    show(`${resolveTarget.asset} marked as resolved.`);
    setResolveTarget(null);
  }

  function addCard(req: MaintenanceRequest) {
    setCards((prev) => [
      { ...req, id: req.id, status: "pending" },
      ...prev,
    ]);
    show(`Maintenance request ${req.id} submitted.`);
    setShowRaise(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">Track maintenance requests from report through resolution.</p>
        <Button variant="primary" className="flex items-center gap-1.5" onClick={() => setShowRaise(true)}>
          <Plus size={14} /> Raise Request
        </Button>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-start">
        {columns.map((col) => {
          const colCards = cards.filter((c) => c.status === col.key);
          return (
            <div key={col.key}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <h2 className="label-caps text-text">{col.title}</h2>
                </div>
                <span className="text-xs font-mono bg-surface-high border border-border rounded px-1.5 py-0.5 text-text-muted">
                  {colCards.length}
                </span>
              </div>

              <div className="space-y-3">
                {colCards.map((c) => (
                  <div
                    key={c.id}
                    className={`relative bg-surface border ${
                      c.priority === "critical" ? "border-red/30" : "border-border"
                    } rounded-md p-3 overflow-hidden`}
                  >
                    {/* Priority bar */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${priorityColor[c.priority]}`} />
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
                      {col.actionLabel && (
                        <Button
                          variant="ghost"
                          className="!px-2 !py-1 text-xs"
                          onClick={() => handleAction(c)}
                        >
                          {col.actionLabel}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {colCards.length === 0 && (
                  <div className="text-xs text-text-muted border border-dashed border-border rounded-md p-4 text-center">
                    No items
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {showRaise && (
        <RaiseMaintenanceModal onClose={() => setShowRaise(false)} onSave={addCard} />
      )}
      {assignTarget && (
        <AssignTechModal
          cardTag={assignTarget.tag}
          cardAsset={assignTarget.asset}
          onClose={() => setAssignTarget(null)}
          onSave={saveAssignment}
        />
      )}
      {resolveTarget && (
        <ResolveModal
          cardTag={resolveTarget.tag}
          cardAsset={resolveTarget.asset}
          onClose={() => setResolveTarget(null)}
          onSave={saveResolve}
        />
      )}

      {ToastOutlet}
    </div>
  );
}