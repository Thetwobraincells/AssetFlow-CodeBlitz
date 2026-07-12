import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

interface Props {
  cardTag: string;
  cardAsset: string;
  onClose: () => void;
  onSave: (notes: string) => void;
}

export default function ResolveModal({ cardTag, cardAsset, onClose, onSave }: Props) {
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(notes);
  }

  const inputCls =
    "w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-amber/60 placeholder:text-text-muted";

  return (
    <Modal title="Resolve Maintenance" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-surface-high border border-border rounded-md px-4 py-2.5">
          <span className="font-mono text-sm text-amber">{cardTag}</span>
          <span className="text-sm text-text ml-2">{cardAsset}</span>
        </div>

        <div>
          <label className="label-caps text-text-muted block mb-1.5">Resolution Notes</label>
          <textarea
            required
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe what was done to resolve the issue..."
            rows={4}
            className={`${inputCls} resize-none`}
          />
        </div>

        <div className="text-xs text-text-muted bg-teal/5 border border-teal/20 rounded-md px-3 py-2">
          Resolving will mark this card as resolved and update the asset status back to available.
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit">Mark Resolved</Button>
        </div>
      </form>
    </Modal>
  );
}
