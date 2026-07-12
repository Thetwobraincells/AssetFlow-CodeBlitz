import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { Plus, X } from "lucide-react";

export interface AssetCategory {
  name: string;
  fields: string;
  status: "active" | "inactive";
}

interface Props {
  initial?: AssetCategory;
  onClose: () => void;
  onSave: (cat: AssetCategory) => void;
}

export default function AddCategoryModal({ initial, onClose, onSave }: Props) {
  const [name, setName]     = useState(initial?.name   ?? "");
  const [status, setStatus] = useState<"active" | "inactive">(initial?.status ?? "active");
  const [fieldInput, setFieldInput] = useState("");
  const [fields, setFields] = useState<string[]>(
    initial?.fields && initial.fields !== "—"
      ? initial.fields.split(", ").map((f) => f.trim())
      : []
  );

  function addField() {
    const trimmed = fieldInput.trim();
    if (trimmed && !fields.includes(trimmed)) {
      setFields((prev) => [...prev, trimmed]);
    }
    setFieldInput("");
  }

  function removeField(f: string) {
    setFields((prev) => prev.filter((x) => x !== f));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ name, fields: fields.length ? fields.join(", ") : "—", status });
  }

  const inputCls =
    "w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-amber/60 placeholder:text-text-muted";

  return (
    <Modal title={initial ? "Edit Asset Category" : "Add Asset Category"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-caps text-text-muted block mb-1.5">Category Name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Electronics"
            className={inputCls}
          />
        </div>

        <div>
          <label className="label-caps text-text-muted block mb-1.5">Custom Fields</label>
          <div className="flex gap-2 mb-2">
            <input
              value={fieldInput}
              onChange={(e) => setFieldInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addField(); } }}
              placeholder="e.g. warranty_period_months"
              className={`${inputCls} font-mono text-xs`}
            />
            <button
              type="button"
              onClick={addField}
              className="shrink-0 p-2 rounded-md border border-border text-text-muted hover:text-text hover:border-border-bright transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          {fields.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {fields.map((f) => (
                <span
                  key={f}
                  className="flex items-center gap-1 font-mono text-xs px-2 py-1 rounded bg-surface-high border border-border text-text-muted"
                >
                  {f}
                  <button type="button" onClick={() => removeField(f)} className="hover:text-red">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="label-caps text-text-muted block mb-1.5">Status</label>
          <div className="flex gap-2">
            {(["active", "inactive"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-md text-xs border capitalize transition-colors ${
                  status === s
                    ? s === "active"
                      ? "bg-teal/10 border-teal text-teal"
                      : "bg-red/10 border-red text-red"
                    : "border-border text-text-muted hover:text-text"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit">
            {initial ? "Save Changes" : "Add Category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
