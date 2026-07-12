import { useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

const conditions = ["Excellent", "Good", "Fair", "Poor"];
const categoryOptions = ["Electronics", "Furniture", "Vehicles"];

export default function RegisterAssetModal({ onClose }: { onClose: () => void }) {
  const [condition, setCondition] = useState("Excellent");
  const [bookable, setBookable] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Dummy submit — no backend yet, just closes the modal.
    onClose();
  }

  return (
    <Modal title="Register Asset" onClose={onClose} widthClass="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-caps text-text-muted block mb-1.5">Name</label>
            <input
              required
              placeholder="Dell Latitude 5420"
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-amber"
            />
          </div>
          <div>
            <label className="label-caps text-text-muted block mb-1.5">Category</label>
            <select className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none">
              {categoryOptions.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-caps text-text-muted block mb-1.5">Asset Tag</label>
            <input
              disabled
              value="AF-0008 (auto-generated)"
              className="w-full bg-surface-high border border-border rounded-md px-3 py-2 text-sm font-mono text-text-muted"
            />
          </div>
          <div>
            <label className="label-caps text-text-muted block mb-1.5">Serial Number</label>
            <input
              placeholder="SN-88213X"
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm font-mono text-text focus:outline-none focus:ring-1 focus:ring-amber"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-caps text-text-muted block mb-1.5">Acquisition Date</label>
            <input
              type="date"
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-amber"
            />
          </div>
          <div>
            <label className="label-caps text-text-muted block mb-1.5">Acquisition Cost (₹)</label>
            <input
              type="number"
              placeholder="45000"
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm font-mono text-text focus:outline-none focus:ring-1 focus:ring-amber"
            />
          </div>
        </div>

        <div>
          <label className="label-caps text-text-muted block mb-1.5">Condition</label>
          <div className="flex gap-2">
            {conditions.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setCondition(c)}
                className={`px-3 py-1.5 rounded-md text-xs border transition-colors ${
                  condition === c
                    ? "bg-amber/10 border-amber text-amber"
                    : "border-border text-text-muted hover:text-text"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label-caps text-text-muted block mb-1.5">Location</label>
          <input
            placeholder="Mumbai HQ - 4F"
            className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-amber"
          />
        </div>

        <div className="border border-dashed border-border rounded-md p-4 text-center text-xs text-text-muted">
          Drop a photo here or click to upload
        </div>

        <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
          <input
            type="checkbox"
            checked={bookable}
            onChange={(e) => setBookable(e.target.checked)}
            className="accent-amber"
          />
          Shared / Bookable resource
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary">Register Asset</Button>
        </div>
      </form>
    </Modal>
  );
}