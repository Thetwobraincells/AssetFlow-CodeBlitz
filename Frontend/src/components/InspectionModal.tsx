import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { AlertTriangle } from "lucide-react";

interface Props {
  assetTag: string;
  assetName: string;
  returnedBy: string;
  onClose: () => void;
  onSave: (result: InspectionResult) => void;
}

export type InspectionVerdict = "pass" | "damaged" | "flag_maintenance";

export interface InspectionResult {
  verdict: InspectionVerdict;
  notes: string;
}

const verdicts: { key: InspectionVerdict; label: string; style: string }[] = [
  { key: "pass",             label: "Pass — Good Condition",          style: "bg-teal/10 border-teal text-teal" },
  { key: "damaged",          label: "Damaged — Needs Repair",         style: "bg-orange/10 border-orange text-orange" },
  { key: "flag_maintenance", label: "Flag for Maintenance Review",    style: "bg-red/10 border-red text-red" },
];

export default function InspectionModal({ assetTag, assetName, returnedBy, onClose, onSave }: Props) {
  const [verdict, setVerdict] = useState<InspectionVerdict>("pass");
  const [notes, setNotes]     = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ verdict, notes });
  }

  const inputCls =
    "w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-amber/60 placeholder:text-text-muted";

  return (
    <Modal title="Log Return Inspection" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-surface-high border border-border rounded-md px-4 py-3">
          <span className="font-mono text-sm text-amber">{assetTag}</span>
          <span className="text-sm text-text ml-2">{assetName}</span>
          <p className="text-xs text-text-muted mt-1">Returned by: <span className="text-text">{returnedBy}</span></p>
        </div>

        <div>
          <label className="label-caps text-text-muted block mb-2">Inspection Verdict</label>
          <div className="space-y-2">
            {verdicts.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => setVerdict(v.key)}
                className={`w-full text-left px-4 py-2.5 rounded-md border text-sm transition-colors ${
                  verdict === v.key ? v.style : "border-border text-text-muted hover:text-text"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {verdict !== "pass" && (
          <div className="flex items-start gap-2 text-xs text-orange bg-orange/5 border border-orange/20 rounded-md p-3">
            <AlertTriangle size={13} className="mt-0.5 shrink-0" />
            <span>
              {verdict === "damaged"
                ? "Asset status will be updated to 'maintenance' and a maintenance request will be auto-raised."
                : "Asset will be flagged for Asset Manager review."}
            </span>
          </div>
        )}

        <div>
          <label className="label-caps text-text-muted block mb-1.5">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe condition observed..."
            rows={3}
            className={`${inputCls} resize-none`}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit">Log Inspection</Button>
        </div>
      </form>
    </Modal>
  );
}
