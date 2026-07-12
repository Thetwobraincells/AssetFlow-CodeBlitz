import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

interface Props {
  cardTag: string;
  cardAsset: string;
  onClose: () => void;
  onSave: (techName: string) => void;
}

const technicians = [
  "R. Fernandes", "M. Pillai", "S. Kumar", "A. Joshi", "TECH-42", "TECH-07",
];

export default function AssignTechModal({ cardTag, cardAsset, onClose, onSave }: Props) {
  const [tech, setTech]   = useState("");
  const [custom, setCustom] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(tech === "__custom__" ? custom : tech);
  }

  const inputCls =
    "w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-amber/60 placeholder:text-text-muted";

  return (
    <Modal title="Assign Technician" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-surface-high border border-border rounded-md px-4 py-2.5">
          <span className="font-mono text-sm text-amber">{cardTag}</span>
          <span className="text-sm text-text ml-2">{cardAsset}</span>
        </div>

        <div>
          <label className="label-caps text-text-muted block mb-2">Select Technician</label>
          <div className="space-y-1.5">
            {technicians.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTech(t)}
                className={`w-full text-left px-4 py-2.5 rounded-md border text-sm transition-colors ${
                  tech === t
                    ? "bg-amber/5 border-amber/50 text-text"
                    : "border-border text-text-muted hover:text-text"
                }`}
              >
                {t}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setTech("__custom__")}
              className={`w-full text-left px-4 py-2.5 rounded-md border text-sm transition-colors ${
                tech === "__custom__"
                  ? "bg-amber/5 border-amber/50 text-text"
                  : "border-border text-text-muted hover:text-text"
              }`}
            >
              Other (enter name)
            </button>
          </div>
          {tech === "__custom__" && (
            <input
              required
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Technician name"
              className={`${inputCls} mt-2`}
              autoFocus
            />
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit" disabled={!tech || (tech === "__custom__" && !custom)}>
            Assign
          </Button>
        </div>
      </form>
    </Modal>
  );
}
