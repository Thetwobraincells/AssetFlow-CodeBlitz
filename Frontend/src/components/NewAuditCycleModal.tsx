import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

export interface AuditCycle {
  id: string;
  name: string;
  scope: string;
  range: string;
  status: "draft";
  auditors: string[];
}

interface Props {
  onClose: () => void;
  onSave: (cycle: AuditCycle) => void;
}

const departments = ["Engineering", "Facilities", "Field Ops", "Marketing", "IT", "Admin", "Logistics"];

export default function NewAuditCycleModal({ onClose, onSave }: Props) {
  const [name, setName]         = useState("");
  const [scope, setScope]       = useState(departments[0]);
  const [startDate, setStart]   = useState("");
  const [endDate, setEnd]       = useState("");
  const [auditorInput, setAuditorInput] = useState("");
  const [auditors, setAuditors] = useState<string[]>([]);

  function addAuditor() {
    const initials = auditorInput.trim().toUpperCase().slice(0, 4);
    if (initials && !auditors.includes(initials)) {
      setAuditors((prev) => [...prev, initials]);
    }
    setAuditorInput("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const quarter = `AC-${String(Math.floor(10 + Math.random() * 90))}`;
    onSave({
      id: quarter,
      name,
      scope,
      range: `${startDate} – ${endDate}`,
      status: "draft",
      auditors,
    });
  }

  const inputCls =
    "w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-amber/60 placeholder:text-text-muted";

  return (
    <Modal title="New Audit Cycle" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-caps text-text-muted block mb-1.5">Cycle Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Q4 Audit: Engineering Dept"
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-caps text-text-muted block mb-1.5">Scope (Department)</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className={inputCls}
            >
              {departments.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label-caps text-text-muted block mb-1.5">Start Date</label>
              <input
                required
                type="date"
                value={startDate}
                onChange={(e) => setStart(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="label-caps text-text-muted block mb-1.5">End Date</label>
              <input
                required
                type="date"
                value={endDate}
                onChange={(e) => setEnd(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="label-caps text-text-muted block mb-1.5">Auditors (initials)</label>
          <div className="flex gap-2">
            <input
              value={auditorInput}
              onChange={(e) => setAuditorInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAuditor(); } }}
              placeholder="T.S"
              className={`${inputCls} uppercase font-mono`}
            />
            <button
              type="button"
              onClick={addAuditor}
              className="shrink-0 px-3 py-2 rounded-md border border-border text-text-muted hover:text-text text-xs"
            >
              Add
            </button>
          </div>
          {auditors.length > 0 && (
            <div className="flex gap-2 mt-2">
              {auditors.map((a) => (
                <span
                  key={a}
                  className="flex items-center gap-1 font-mono text-xs px-2 py-1 rounded bg-surface-high border border-border text-text-muted cursor-pointer hover:text-red"
                  onClick={() => setAuditors((prev) => prev.filter((x) => x !== a))}
                  title="Remove"
                >
                  {a} ×
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit">Create Audit Cycle</Button>
        </div>
      </form>
    </Modal>
  );
}
