import { useState } from "react";
import { Plus, Check, AlertTriangle, X, Lock } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../components/Button";
import StatusPill, { type Status } from "../components/StatusPill";
import Tabs from "../components/Tabs";
import NewAuditCycleModal, { type AuditCycle } from "../components/NewAuditCycleModal";
import RaiseMaintenanceModal, { type MaintenanceRequest } from "../components/RaiseMaintenanceModal";
import { useToast } from "../components/Toast";
import { apiRequest } from "../lib/api";

/* ------------------------------------------------------------------ */
/* Types                                                                 */
/* ------------------------------------------------------------------ */

type ChecklistStatus = "pending" | "verified" | "missing" | "damaged";

interface ChecklistItem {
  id: string;
  tag: string;
  name: string;
  expected: string;
  status: ChecklistStatus;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                               */
/* ------------------------------------------------------------------ */

function formatRange(start: string, end: string): string {
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

function toCycle(c: any): AuditCycle {
  return {
    id:       c.id,
    name:     c.name,
    scope:    c.scope_department?.name || c.scope_location || '—',
    range:    formatRange(c.date_range_start, c.date_range_end),
    status:   c.status as "draft",
    auditors: [],
  };
}

function toItem(item: any): ChecklistItem {
  return {
    id:       item.id,
    tag:      item.asset?.asset_tag || '—',
    name:     item.asset?.name || '—',
    expected: item.expected_location || '—',
    status:   item.status as ChecklistStatus,
  };
}

/* ------------------------------------------------------------------ */
/* Screen                                                                */
/* ------------------------------------------------------------------ */

export default function Audits() {
  const queryClient = useQueryClient();
  const { show, ToastOutlet } = useToast();

  const [view, setView]           = useState("cycles");
  const [selectedCycleId, setSelectedId] = useState<string>('');
  const [showNewCycle, setShowNewCycle]   = useState(false);
  const [showRaiseMaint, setShowRaiseMaint] = useState<{ tag: string; asset: string } | null>(null);

  // Fetch all cycles
  const { data: cyclesRes, isLoading } = useQuery({
    queryKey: ['audits'],
    queryFn:  () => apiRequest('/audits'),
  });
  const cycles: AuditCycle[] = (cyclesRes?.data || []).map(toCycle);
  const rawCycles: any[]     = cyclesRes?.data || [];

  // Active selected cycle
  const activeCycleId = selectedCycleId || rawCycles[0]?.id || '';
  const selectedCycle = cycles.find((c) => c.id === activeCycleId);
  const isClosed      = selectedCycle?.status === 'closed' as any;

  // Fetch cycle details when in checklist view
  const { data: cycleDetailRes } = useQuery({
    queryKey: ['audits', activeCycleId],
    queryFn:  () => apiRequest(`/audits/${activeCycleId}`),
    enabled:  view === 'checklist' && !!activeCycleId,
  });
  const checklist: ChecklistItem[] = (cycleDetailRes?.data?.items || []).map(toItem);
  const discrepancies = checklist.filter((it) => it.status === 'missing' || it.status === 'damaged');

  /* Open checklist for a cycle */
  function openChecklist(cycleId: string) {
    setSelectedId(cycleId);
    setView("checklist");
  }

  /* Update checklist item status */
  async function updateItem(cycleId: string, itemId: string, status: ChecklistStatus) {
    try {
      await apiRequest(`/audits/${cycleId}/items/${itemId}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      queryClient.invalidateQueries({ queryKey: ['audits', cycleId] });
      show(`Item marked as ${status}.`, "info");
    } catch (err: any) {
      show(err.message || 'Failed to update item', 'info');
    }
  }

  /* Close an audit cycle */
  async function closeCycle() {
    try {
      await apiRequest(`/audits/${activeCycleId}/close`, { method: 'POST' });
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      queryClient.invalidateQueries({ queryKey: ['audits', activeCycleId] });
      show(`Cycle ${activeCycleId} closed. Discrepancy report generated.`, "info");
    } catch (err: any) {
      show(err.message || 'Failed to close cycle', 'info');
    }
  }

  /* Add new cycle */
  async function addCycle(cycle: AuditCycle) {
    try {
      // Get departments to resolve scope
      const deptsRes = await apiRequest('/departments');
      const matched  = (deptsRes.data || []).find((d: any) =>
        d.name?.toLowerCase() === cycle.scope?.toLowerCase()
      );
      await apiRequest('/audits', {
        method: 'POST',
        body: JSON.stringify({
          name: cycle.name,
          scope_department_id: matched?.id || null,
          scope_location: matched ? null : cycle.scope,
          date_range_start: cycle.range.split(' – ')[0],
          date_range_end:   cycle.range.split(' – ')[1],
        }),
      });
      queryClient.invalidateQueries({ queryKey: ['audits'] });
      show(`Audit cycle "${cycle.name}" created.`);
      setShowNewCycle(false);
    } catch (err: any) {
      show(err.message || 'Failed to create cycle', 'info');
    }
  }

  /* Handle maintenance raise from discrepancy report */
  function handleRaiseMaint(req: MaintenanceRequest) {
    show(`Maintenance request ${req.id} raised for ${req.tag}.`);
    setShowRaiseMaint(null);
  }

  if (isLoading) {
    return <div className="p-8 text-center text-text-muted">Loading audit cycles...</div>;
  }

  return (
    <div className="space-y-4">
      <Tabs
        tabs={[
          { key: "cycles",    label: "Audit Cycles" },
          { key: "checklist", label: selectedCycle ? `${activeCycleId} Checklist` : "Checklist" },
        ]}
        active={view}
        onSelect={setView}
      />

      {/* ---- CYCLES ---- */}
      {view === "cycles" && (
        <div className="bg-surface border border-border rounded-md overflow-hidden">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text">Audit Cycles</h2>
            <Button variant="primary" className="flex items-center gap-1.5" onClick={() => setShowNewCycle(true)}>
              <Plus size={14} /> New Audit Cycle
            </Button>
          </div>
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="label-caps text-text-muted text-left px-4 py-2.5">ID</th>
                <th className="label-caps text-text-muted text-left px-4 py-2.5">Name</th>
                <th className="label-caps text-text-muted text-left px-4 py-2.5">Scope</th>
                <th className="label-caps text-text-muted text-left px-4 py-2.5">Date Range</th>
                <th className="label-caps text-text-muted text-left px-4 py-2.5">Status</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cycles.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-sm text-text-muted">No audit cycles found.</td>
                </tr>
              )}
              {cycles.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-surface-hover cursor-pointer"
                  onClick={() => openChecklist(c.id)}
                >
                  <td className="px-4 py-3 font-mono text-xs text-amber">{c.id.slice(0, 8)}…</td>
                  <td className="px-4 py-3 text-sm text-text">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-text-muted">{c.scope}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{c.range}</td>
                  <td className="px-4 py-3">
                    <StatusPill status={c.status as Status} label={c.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs text-text-muted hover:text-text font-mono">Open →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---- CHECKLIST ---- */}
      {view === "checklist" && (
        <div className="space-y-4">
          {/* Discrepancy report */}
          {isClosed && discrepancies.length > 0 && (
            <div className="bg-red/5 border border-red/30 rounded-md p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-red mb-3">
                <Lock size={14} /> Cycle Closed — Discrepancy Report
              </h2>
              <ul className="text-sm text-text-muted space-y-2">
                {discrepancies.map((it) => (
                  <li key={it.id} className="flex items-center gap-2 flex-wrap">
                    <span className={`font-mono ${it.status === "missing" ? "text-red" : "text-orange"}`}>{it.tag}</span>
                    <span>{it.name} —</span>
                    {it.status === "missing" && (
                      <span>missing → asset status flipped to <strong className="text-red">LOST</strong></span>
                    )}
                    {it.status === "damaged" && (
                      <>
                        <span>damaged → flagged for review</span>
                        <Button
                          variant="outline"
                          className="!px-2 !py-0.5 text-xs"
                          onClick={() => setShowRaiseMaint({ tag: it.tag, asset: it.name })}
                        >
                          Raise Maintenance
                        </Button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-surface border border-border rounded-md overflow-hidden">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-text">
                  {activeCycleId.slice(0, 8)}… — Verification Checklist
                </h2>
                <p className="text-xs text-text-muted mt-0.5">
                  {selectedCycle?.name} · Scope: {selectedCycle?.scope}
                </p>
              </div>
              {!isClosed && (
                <Button
                  variant="outline"
                  className="flex items-center gap-1.5 !border-red/40 !text-red hover:!bg-red/10"
                  onClick={closeCycle}
                >
                  <Lock size={14} /> Close Audit Cycle
                </Button>
              )}
              {isClosed && (
                <span className="flex items-center gap-1.5 text-xs text-text-muted border border-border rounded-md px-3 py-1.5">
                  <Lock size={13} /> Cycle Closed
                </span>
              )}
            </div>

            <div className="divide-y divide-border">
              {checklist.length === 0 && (
                <p className="text-sm text-text-muted text-center py-10">
                  No items in this checklist yet. Assets will populate when the cycle starts.
                </p>
              )}
              {checklist.map((it) => (
                <div key={it.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="font-mono text-xs text-amber">{it.tag}</span>
                    <span className="text-sm text-text ml-2">{it.name}</span>
                    <p className="text-xs text-text-muted mt-0.5">Expected: {it.expected}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusPill status={it.status as Status} label={it.status} />
                    {!isClosed && it.status === "pending" && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => updateItem(activeCycleId, it.id, "verified")}
                          className="p-1.5 rounded border border-teal/30 text-teal hover:bg-teal/10 transition-colors"
                          title="Verified"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          onClick={() => updateItem(activeCycleId, it.id, "damaged")}
                          className="p-1.5 rounded border border-orange/30 text-orange hover:bg-orange/10 transition-colors"
                          title="Damaged"
                        >
                          <AlertTriangle size={13} />
                        </button>
                        <button
                          onClick={() => updateItem(activeCycleId, it.id, "missing")}
                          className="p-1.5 rounded border border-red/30 text-red hover:bg-red/10 transition-colors"
                          title="Missing"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showNewCycle && (
        <NewAuditCycleModal onClose={() => setShowNewCycle(false)} onSave={addCycle} />
      )}
      {showRaiseMaint && (
        <RaiseMaintenanceModal
          prefilledTag={showRaiseMaint.tag}
          prefilledAsset={showRaiseMaint.asset}
          onClose={() => setShowRaiseMaint(null)}
          onSave={handleRaiseMaint}
        />
      )}

      {ToastOutlet}
    </div>
  );
}