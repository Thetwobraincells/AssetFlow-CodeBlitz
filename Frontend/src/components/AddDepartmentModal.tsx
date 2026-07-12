import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

export interface Department {
  name: string;
  code: string;
  head: string;
  parent: string;
  status: "active" | "inactive";
}

interface Props {
  initial?: Department;
  onClose: () => void;
  onSave: (dept: Department) => void;
}

export default function AddDepartmentModal({ initial, onClose, onSave }: Props) {
  const [name, setName]     = useState(initial?.name   ?? "");
  const [code, setCode]     = useState(initial?.code   ?? "");
  const [head, setHead]     = useState(initial?.head   ?? "");
  const [parent, setParent] = useState(initial?.parent ?? "—");
  const [status, setStatus] = useState<"active" | "inactive">(initial?.status ?? "active");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ name, code: code.toUpperCase(), head: head || "—", parent: parent || "—", status });
  }

  const inputCls =
    "w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-amber/60 placeholder:text-text-muted";

  return (
    <Modal title={initial ? "Edit Department" : "Add Department"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-caps text-text-muted block mb-1.5">Department Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Engineering"
              className={inputCls}
            />
          </div>
          <div>
            <label className="label-caps text-text-muted block mb-1.5">Code</label>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ENG"
              maxLength={6}
              className={`${inputCls} uppercase font-mono`}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-caps text-text-muted block mb-1.5">Department Head</label>
            <input
              value={head}
              onChange={(e) => setHead(e.target.value)}
              placeholder="Aditi Rao (optional)"
              className={inputCls}
            />
          </div>
          <div>
            <label className="label-caps text-text-muted block mb-1.5">Parent Department</label>
            <input
              value={parent === "—" ? "" : parent}
              onChange={(e) => setParent(e.target.value || "—")}
              placeholder="Leave blank if root"
              className={inputCls}
            />
          </div>
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
            {initial ? "Save Changes" : "Add Department"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
