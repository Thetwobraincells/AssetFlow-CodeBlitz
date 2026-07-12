import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSafeMutation } from "../hooks/useSafeMutation";
import { apiRequest } from "../lib/api";
import Modal from "./Modal";
import Button from "./Button";
import { useToast } from "./Toast";

const conditions = ["Excellent", "Good", "Fair", "Poor"];

export default function RegisterAssetModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [condition, setCondition] = useState("Excellent");
  const [bookable, setBookable] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [acquisitionDate, setAcquisitionDate] = useState("");
  const [acquisitionCost, setAcquisitionCost] = useState("");
  const { show, ToastOutlet } = useToast();

  const { data: catResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiRequest('/categories')
  });
  const categories = catResponse?.data || [];

  const registerMutation = useSafeMutation(
    ['assets'],
    (newAsset: any) => apiRequest('/assets', { method: 'POST', body: JSON.stringify(newAsset) })
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category && categories.length > 0) return show("Please select a category", "error");

    registerMutation.mutate({
      name,
      category_id: category || categories[0]?.id,
      location,
      condition: condition.toLowerCase(),
      is_bookable: bookable,
      serial_number: serialNumber,
      acquisition_date: acquisitionDate ? new Date(acquisitionDate).toISOString() : new Date().toISOString(),
      acquisition_cost: Number(acquisitionCost) || 0
    }, {
      onSuccess: () => {
        show("Asset registered successfully.", "success");
        onClose();
      }
    });
  }

  return (
    <Modal title="Register Asset" onClose={onClose} widthClass="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-caps text-text-muted block mb-1.5">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dell Latitude 5420"
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-amber"
            />
          </div>
          <div>
            <label className="label-caps text-text-muted block mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none"
            >
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-caps text-text-muted block mb-1.5">Asset Tag</label>
            <input
              disabled
              value="Auto-generated"
              className="w-full bg-surface-high border border-border rounded-md px-3 py-2 text-sm font-mono text-text-muted"
            />
          </div>
          <div>
            <label className="label-caps text-text-muted block mb-1.5">Serial Number</label>
            <input
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
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
              value={acquisitionDate}
              onChange={(e) => setAcquisitionDate(e.target.value)}
              className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-amber"
            />
          </div>
          <div>
            <label className="label-caps text-text-muted block mb-1.5">Acquisition Cost (₹)</label>
            <input
              type="number"
              value={acquisitionCost}
              onChange={(e) => setAcquisitionCost(e.target.value)}
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
            value={location}
            onChange={(e) => setLocation(e.target.value)}
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
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? "Registering..." : "Register Asset"}
          </Button>
        </div>
      </form>
      {ToastOutlet}
    </Modal>
  );
}