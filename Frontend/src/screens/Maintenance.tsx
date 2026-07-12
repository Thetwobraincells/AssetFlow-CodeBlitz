import { useState } from "react";
import { Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../components/Button";
import RaiseMaintenanceModal, { type MaintenanceRequest } from "../components/RaiseMaintenanceModal";
import AssignTechModal from "../components/AssignTechModal";
import ResolveModal from "../components/ResolveModal";
import { useToast } from "../components/Toast";
import { apiRequest } from "../lib/api";

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
/* Helper: map API shape → Card                                          */
/* ------------------------------------------------------------------ */
function toCard(r: any): Card {
  return {
    id:       r.id,
    tag:      r.asset?.asset_tag || '—',
    asset:    r.asset?.name || r.asset_id,
    reporter: r.reported_by?.name || r.user?.name || 'Unknown',
    priority: r.priority as Priority,
    note:     r.resolution_notes || r.issue_description || '—',
    status:   r.status as MaintStatus,
  };
}

/* ------------------------------------------------------------------ */
/* Screen                                                                */
/* ------------------------------------------------------------------ */

export default function Maintenance() {
  const queryClient = useQueryClient();
  const { show, ToastOutlet } = useToast();

  const { data: response, isLoading } = useQuery({
    queryKey: ['maintenance'],
    queryFn:  () => apiRequest('/maintenance'),
  });
  const cards: Card[] = (response?.data || []).map(toCard);

  const [showRaise, setShowRaise]         = useState(false);
  const [assignTarget, setAssignTarget]   = useState<Card | null>(null);
  const [resolveTarget, setResolveTarget] = useState<Card | null>(null);

  /* State transitions */
  const nextStatus: Partial<Record<MaintStatus, MaintStatus>> = {
    pending:             "approved",
    approved:            "technician_assigned",
    technician_assigned: "in_progress",
    in_progress:         "resolved",
  };

  async function patchStatus(id: string, body: Record<string, any>, successMsg: string) {
    try {
      await apiRequest(`/maintenance/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      show(successMsg, 'success');
    } catch (err: any) {
      show(err.message || 'Failed to update status', 'info');
    }
  }

  function handleAction(card: Card) {
    if (card.status === "approved") {
      setAssignTarget(card);
      return;
    }
    if (card.status === "in_progress") {
      setResolveTarget(card);
      return;
    }
    const next = nextStatus[card.status];
    if (next) {
      const labels: Partial<Record<MaintStatus, string>> = {
        pending:            "approved",
        technician_assigned: "started",
      };
      patchStatus(card.id, { status: next }, `${card.asset} marked as ${labels[card.status] ?? next}.`);
    }
  }

  async function saveAssignment(tech: string) {
    if (!assignTarget) return;
    await patchStatus(assignTarget.id,
      { status: 'technician_assigned', technician_name: tech },
      `${tech} assigned to ${assignTarget.asset}.`
    );
    setAssignTarget(null);
  }

  async function saveResolve(notes: string) {
    if (!resolveTarget) return;
    await patchStatus(resolveTarget.id,
      { status: 'resolved', resolution_notes: notes },
      `${resolveTarget.asset} marked as resolved.`
    );
    setResolveTarget(null);
  }

  async function addCard(req: MaintenanceRequest) {
    // req comes from the modal — it has tag (asset_tag) and note (description)
    // We need asset_id: fetch assets and find by tag, or use note as description
    try {
      // Grab asset id from tag lookup
      const assetsRes = await apiRequest('/assets');
      const matched = (assetsRes.data || []).find((a: any) =>
        a.asset_tag?.toUpperCase() === req.tag?.toUpperCase()
      );
      if (!matched) {
        show('Asset tag not found. Please use a valid tag.', 'info');
        return;
      }
      await apiRequest('/maintenance', {
        method: 'POST',
        body: JSON.stringify({
          asset_id: matched.id,
          issue_description: req.note,
          priority: req.priority,
        }),
      });
      queryClient.invalidateQueries({ queryKey: ['maintenance'] });
      show(`Maintenance request submitted for ${req.asset}.`);
      setShowRaise(false);
    } catch (err: any) {
      show(err.message || 'Failed to submit request', 'info');
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-text-muted">Loading maintenance requests...</div>;
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
                    <p className="text-xs text-text-muted mt-1 line-clamp-2">{c.note}</p>
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