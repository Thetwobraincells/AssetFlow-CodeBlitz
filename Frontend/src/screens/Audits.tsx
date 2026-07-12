import { useState } from "react";
import { Plus, Check, AlertTriangle, X, Lock } from "lucide-react";
import Button from "../components/Button";
import StatusPill, { type Status } from "../components/StatusPill";
import Tabs from "../components/Tabs";
import NewAuditCycleModal, { type AuditCycle } from "../components/NewAuditCycleModal";
import RaiseMaintenanceModal, { type MaintenanceRequest } from "../components/RaiseMaintenanceModal";
import { useToast } from "../components/Toast";

/* ------------------------------------------------------------------ */
/* Types                                                                 */
/* ------------------------------------------------------------------ */

type ChecklistStatus = "pending" | "verified" | "missing" | "damaged";

interface ChecklistItem {
  tag: string;
  name: string;
  expected: string;
  status: ChecklistStatus;
}

/* ------------------------------------------------------------------ */
/* Initial data                                                          */
/* ------------------------------------------------------------------ */

const initCycles: AuditCycle[] = [
  { id: "AC-04", name: "Q3 Audit: Engineering Dept", scope: "Engineering", range: "Oct 01 – Oct 15", status: "draft", auditors: ["T.S", "M.C"] },
  { id: "AC-03", name: "Q2 Audit: Facilities",       scope: "Facilities",  range: "Jul 01 – Jul 10", status: "draft", auditors: ["L.G"] },
  { id: "AC-05", name: "Q4 Audit: Field Ops",        scope: "Field Ops",   range: "Nov 01 – Nov 15", status: "draft", auditors: [] },
];

// Map cycle id → checklist items
const initChecklists: Record<string, ChecklistItem[]> = {
  "AC-04": [
    { tag: "AF-10293", name: "Mazak CNC Lathe",       expected: "Whse B-4, Row 12",    status: "verified" },
    { tag: "AF-10884", name: "KUKA Roboter Arm",      expected: "Line A-2, Cell 4",    status: "pending" },
    { tag: "VH-33092", name: "Toyota Forklift",       expected: "Loading Dock C",      status: "missing" },
    { tag: "AF-10294", name: "Industrial HVAC Unit",  expected: "Roof Sector North",   status: "damaged" },
  ],
  "AC-03": [
    { tag: "AF-00111", name: "Pressure Washer Pro",  expected: "Storage Room A",      status: "verified" },
    { tag: "AF-00200", name: "Cordless Drill Set",   expected: "Tool Cabinet B",      status: "pending" },
  ],
  "AC-05": [],
};

/* ------------------------------------------------------------------ */
/* Screen                                                                */
/* ------------------------------------------------------------------ */

export default function Audits() {
  const [view, setView]                 = useState("cycles");
  const [selectedCycleId, setSelectedId] = useState("AC-04");
  const [cycles, setCycles]             = useState<AuditCycle[]>(initCycles);
  const [checklists, setChecklists]     = useState<Record<string, ChecklistItem[]>>(initChecklists);
  const [closedCycles, setClosedCycles] = useState<Set<string>>(new Set());
  const [showNewCycle, setShowNewCycle] = useState(false);
  const [showRaiseMaint, setShowRaiseMaint] = useState<{ tag: string; asset: string } | null>(null);
  const { show, ToastOutlet }           = useToast();

  const selectedCycle = cycles.find((c) => c.id === selectedCycleId);
  const checklist     = checklists[selectedCycleId] ?? [];
  const isClosed      = closedCycles.has(selectedCycleId);

  /* Open checklist for a cycle */
  function openChecklist(cycleId: string) {
    setSelectedId(cycleId);
    setView("checklist");
  }

  /* Update checklist item status */
  function updateItem(cycleId: string, tag: string, status: ChecklistStatus) {
    setChecklists((prev) => ({
      ...prev,
      [cycleId]: (prev[cycleId] ?? []).map((it) =>
        it.tag === tag ? { ...it, status } : it
      ),
    }));
    show(`${tag} marked as ${status}.`, "info");
  }

  /* Close an audit cycle */
  function closeCycle() {
    setClosedCycles((prev) => new Set([...prev, selectedCycleId]));
    show(`Cycle ${selectedCycleId} closed. Discrepancy report generated.`, "info");
  }

  /* Add new cycle */
  function addCycle(cycle: AuditCycle) {
    setCycles((prev) => [...prev, { ...cycle, status: "draft" }]);
    setChecklists((prev) => ({ ...prev, [cycle.id]: [] }));
    show(`Audit cycle "${cycle.name}" created.`);
    setShowNewCycle(false);
  }

  /* Handle maintenance raise from discrepancy report */
  function handleRaiseMaint(req: MaintenanceRequest) {
    show(`Maintenance request ${req.id} raised for ${req.tag}.`);
    setShowRaiseMaint(null);
  }

  /* Discrepancy items (missing/damaged in a closed cycle) */
  const discrepancies = checklist.filter((it) => it.status === "missing" || it.status === "damaged");

  return (
    <div className="space-y-4">
      <Tabs
        tabs={[
          { key: "cycles",    label: "Audit Cycles" },
          { key: "checklist", label: selectedCycle ? `${selectedCycleId} Checklist` : "Checklist" },
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
                <th className="label-caps text-text-muted text-left px-4 py-2.5">Auditors</th>
                <th className="label-caps text-text-muted text-left px-4 py-2.5">Status</th>
                <th />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cycles.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-surface-hover cursor-pointer"
                  onClick={() => openChecklist(c.id)}
                >
                  <td className="px-4 py-3 font-mono text-xs text-amber">{c.id}</td>
                  <td className="px-4 py-3 text-sm text-text">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-text-muted">{c.scope}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-muted">{c.range}</td>
                  <td className="px-4 py-3">
                    <div className="flex -space-x-2">
                      {c.auditors.map((a) => (
                        <span key={a} className="w-6 h-6 rounded-full bg-surface-hover border border-border flex items-center justify-center text-[10px] text-text-muted">
                          {a}
                        </span>
                      ))}
                      {c.auditors.length === 0 && <span className="text-xs text-text-muted">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill
                      status={closedCycles.has(c.id) ? "closed" as Status : c.status as Status}
                      label={closedCycles.has(c.id) ? "closed" : c.status}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-xs text-text-muted hover:text-text font-mono">
                      Open →
                    </button>
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
          {/* Discrepancy report (shown when cycle closed) */}
          {isClosed && discrepancies.length > 0 && (
            <div className="bg-red/5 border border-red/30 rounded-md p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-red mb-3">
                <Lock size={14} /> Cycle {selectedCycleId} Closed — Discrepancy Report
              </h2>
              <ul className="text-sm text-text-muted space-y-2">
                {discrepancies.map((it) => (
                  <li key={it.tag} className="flex items-center gap-2 flex-wrap">
                    <span className={`font-mono ${it.status === "missing" ? "text-red" : "text-orange"}`}>
                      {it.tag}
                    </span>
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
                  {selectedCycleId} — Verification Checklist
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
                <div key={it.tag} className="flex items-center justify-between px-4 py-3">
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
                          onClick={() => updateItem(selectedCycleId, it.tag, "verified")}
                          className="p-1.5 rounded border border-teal/30 text-teal hover:bg-teal/10 transition-colors"
                          title="Verified"
                        >
                          <Check size={13} />
                        </button>
                        <button
                          onClick={() => updateItem(selectedCycleId, it.tag, "damaged")}
                          className="p-1.5 rounded border border-orange/30 text-orange hover:bg-orange/10 transition-colors"
                          title="Damaged"
                        >
                          <AlertTriangle size={13} />
                        </button>
                        <button
                          onClick={() => updateItem(selectedCycleId, it.tag, "missing")}
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