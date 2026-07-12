import { useState } from "react";
import { Plus, Check, AlertTriangle, X, Lock } from "lucide-react";
import Button from "../components/Button";
import StatusPill, { type Status } from "../components/StatusPill";
import Tabs from "../components/Tabs";

const cycles = [
  { id: "AC-04", name: "Q3 Audit: Engineering Dept", scope: "Engineering", range: "Oct 01 – Oct 15", status: "active" as Status, auditors: ["T.S", "M.C"] },
  { id: "AC-03", name: "Q2 Audit: Facilities", scope: "Facilities", range: "Jul 01 – Jul 10", status: "closed" as Status, auditors: ["L.G"] },
  { id: "AC-05", name: "Q4 Audit: Field Ops", scope: "Field Ops", range: "Nov 01 – Nov 15", status: "draft" as Status, auditors: [] },
];

const items = [
  { tag: "AF-10293", name: "Mazak CNC Lathe", expected: "Whse B-4, Row 12", status: "verified" as Status },
  { tag: "AF-10884", name: "KUKA Roboter Arm", expected: "Line A-2, Cell 4", status: "pending" as Status },
  { tag: "VH-33092", name: "Toyota Forklift", expected: "Loading Dock C", status: "missing" as Status },
  { tag: "AF-10294", name: "Industrial HVAC Unit", expected: "Roof Sector North", status: "damaged" as Status },
];

export default function Audits() {
  const [view, setView] = useState("cycles");
  const [closed, setClosed] = useState(false);

  return (
    <div className="space-y-4">
      <Tabs
        tabs={[
          { key: "cycles", label: "Audit Cycles" },
          { key: "checklist", label: "AC-04 Checklist" },
        ]}
        active={view}
        onSelect={setView}
      />

      {view === "cycles" && (
        <div className="bg-surface border border-border rounded-md overflow-hidden">
          <div className="p-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text">Audit Cycles</h2>
            <Button variant="primary" className="flex items-center gap-1.5">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cycles.map((c) => (
                <tr key={c.id} className="hover:bg-surface-hover">
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
                  <td className="px-4 py-3"><StatusPill status={c.status} label={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === "checklist" && (
        <div className="space-y-4">
          {closed && (
            <div className="bg-red/5 border border-red/30 rounded-md p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-red mb-2">
                <Lock size={14} /> Cycle Closed — Discrepancy Report
              </h2>
              <ul className="text-sm text-text-muted space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="font-mono text-red">VH-33092</span> Toyota Forklift — missing → asset status flipped to <strong className="text-red">LOST</strong>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-mono text-orange">AF-10294</span> Industrial HVAC Unit — damaged → flagged for review
                  <Button variant="outline" className="!px-2 !py-0.5 text-xs ml-2">Raise Maintenance</Button>
                </li>
              </ul>
            </div>
          )}

          <div className="bg-surface border border-border rounded-md overflow-hidden">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-text">AC-04 — Verification Checklist</h2>
                <p className="text-xs text-text-muted mt-0.5">Assigned auditors only. Marks are final once the cycle is closed.</p>
              </div>
              {!closed && (
                <Button variant="outline" className="flex items-center gap-1.5 !border-red/40 !text-red hover:!bg-red/10" onClick={() => setClosed(true)}>
                  <Lock size={14} /> Close Audit Cycle
                </Button>
              )}
            </div>
            <div className="divide-y divide-border">
              {items.map((it) => (
                <div key={it.tag} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="font-mono text-xs text-amber">{it.tag}</span>
                    <span className="text-sm text-text ml-2">{it.name}</span>
                    <p className="text-xs text-text-muted mt-0.5">Expected: {it.expected}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusPill status={it.status} label={it.status} />
                    {!closed && it.status === "pending" && (
                      <div className="flex gap-1">
                        <button className="p-1.5 rounded border border-teal/30 text-teal hover:bg-teal/10" title="Verify">
                          <Check size={13} />
                        </button>
                        <button className="p-1.5 rounded border border-orange/30 text-orange hover:bg-orange/10" title="Damaged">
                          <AlertTriangle size={13} />
                        </button>
                        <button className="p-1.5 rounded border border-red/30 text-red hover:bg-red/10" title="Missing">
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
    </div>
  );
}