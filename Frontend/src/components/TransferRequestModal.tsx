import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

interface Props {
  assetTag?: string;
  assetName?: string;
  fromEmployee?: string;
  onClose: () => void;
  onSave: () => void;
}

const employees = [
  "Priya Shah", "Raj Mehta", "Aditi Rao", "T. Silva", "J. Kowalski",
  "M. Chen", "L. Gomez", "R. Fernandes",
];

export default function TransferRequestModal({ assetTag, assetName, fromEmployee, onClose, onSave }: Props) {
  const [to, setTo]         = useState("");
  const [reason, setReason] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave();
  }

  const inputCls =
    "w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-amber/60 placeholder:text-text-muted";

  return (
    <Modal title="Submit Transfer Request" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {assetTag && (
          <div className="bg-surface-high border border-border rounded-md px-4 py-3">
            <span className="font-mono text-sm text-amber">{assetTag}</span>
            {assetName && <span className="text-sm text-text ml-2">{assetName}</span>}
            {fromEmployee && (
              <p className="text-xs text-text-muted mt-1">
                Currently held by <span className="text-text">{fromEmployee}</span>
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-caps text-text-muted block mb-1.5">From Employee</label>
            <input
              value={fromEmployee ?? ""}
              disabled={!!fromEmployee}
              className={`${inputCls} ${fromEmployee ? "opacity-60 cursor-not-allowed" : ""}`}
              placeholder="Current holder"
            />
          </div>
          <div>
            <label className="label-caps text-text-muted block mb-1.5">To Employee</label>
            <select
              required
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={inputCls}
            >
              <option value="">Select employee…</option>
              {employees
                .filter((e) => e !== fromEmployee)
                .map((e) => <option key={e}>{e}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="label-caps text-text-muted block mb-1.5">Reason</label>
          <textarea
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why the asset needs to be transferred..."
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit">Submit Transfer</Button>
        </div>
      </form>
    </Modal>
  );
}
