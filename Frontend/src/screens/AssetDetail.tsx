import { useState } from "react";
import { ArrowLeft, Pencil, Wrench, AlertTriangle, Archive } from "lucide-react";
import StatusPill from "../components/StatusPill";
import Modal from "../components/Modal";
import Button from "../components/Button";
import RaiseMaintenanceModal, { type MaintenanceRequest } from "../components/RaiseMaintenanceModal";
import { useToast } from "../components/Toast";

/* ------------------------------------------------------------------ */
/* Types & mock per-tag data                                             */
/* ------------------------------------------------------------------ */

const tabs = ["Details", "Allocation History", "Maintenance History"] as const;

type AssetStatus = "available" | "allocated" | "maintenance" | "retired" | "lost";

interface AssetData {
  name: string;
  category: string;
  serial: string;
  acquired: string;
  cost: string;
  condition: string;
  location: string;
  department: string;
  status: AssetStatus;
}

const assetDB: Record<string, AssetData> = {
  "AF-0001": {
    name: "Dell Latitude 5420", category: "Electronics", serial: "SN-88213X",
    acquired: "12 Jan 2025", cost: "₹78,000", condition: "Good",
    location: "Mumbai HQ - 4F", department: "Engineering", status: "allocated",
  },
  "AF-0002": {
    name: "Herman Miller Aeron", category: "Furniture", serial: "SN-44012A",
    acquired: "05 Mar 2024", cost: "₹1,20,000", condition: "Excellent",
    location: "Mumbai HQ - 2F", department: "—", status: "available",
  },
  "AF-0003": {
    name: "Toyota Innova - MH01AB1234", category: "Vehicles", serial: "VH-33092",
    acquired: "20 Jun 2023", cost: "₹14,50,000", condition: "Good",
    location: "Parking Bay 2", department: "Logistics", status: "allocated",
  },
  "AF-0004": {
    name: "Epson EB-X05 Projector", category: "Electronics", serial: "SN-99001B",
    acquired: "18 Nov 2024", cost: "₹38,500", condition: "Fair",
    location: "Conference Room B2", department: "—", status: "maintenance",
  },
  "AF-0005": {
    name: "HP LaserJet Pro M404", category: "Electronics", serial: "SN-77412C",
    acquired: "02 Aug 2024", cost: "₹22,000", condition: "Good",
    location: "Mumbai HQ - 3F", department: "Admin", status: "available",
  },
};

const fallbackAsset: AssetData = {
  name: "Unknown Asset", category: "—", serial: "—",
  acquired: "—", cost: "—", condition: "—",
  location: "—", department: "—", status: "available",
};

const allocationHistory = [
  { date: "2026-06-01", event: "Allocated to Priya Shah",    by: "Asset Manager" },
  { date: "2026-03-14", event: "Returned by Raj Mehta",      by: "Raj Mehta" },
  { date: "2025-11-02", event: "Allocated to Raj Mehta",     by: "Asset Manager" },
];

const maintenanceHistory = [
  { date: "2026-05-10", event: "Resolved — screen replacement", by: "TECH-42" },
  { date: "2026-05-02", event: "Raised — display flickering",   by: "Priya Shah" },
];

/* ------------------------------------------------------------------ */
/* Sub-components                                                        */
/* ------------------------------------------------------------------ */

const conditions = ["Excellent", "Good", "Fair", "Poor"];

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="label-caps text-text-muted mb-1">{label}</p>
      <p className={`text-sm text-text ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function HistoryTimeline({ items }: { items: { date: string; event: string; by: string }[] }) {
  return (
    <div className="bg-surface border border-border rounded-md p-5">
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex gap-4 relative pl-4 border-l border-border">
            <div className="absolute left-[-4.5px] top-1 w-2 h-2 rounded-full bg-amber" />
            <div>
              <p className="font-mono text-xs text-text-muted">{item.date}</p>
              <p className="text-sm text-text">{item.event}</p>
              <p className="text-xs text-text-muted">by {item.by}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Screen                                                                */
/* ------------------------------------------------------------------ */

export default function AssetDetail({ tag, onBack }: { tag: string; onBack: () => void }) {
  const initial   = assetDB[tag] ?? fallbackAsset;
  const [asset, setAsset]               = useState<AssetData>(initial);
  const [assetStatus, setAssetStatus]   = useState<AssetStatus>(initial.status);
  const [activeTab, setActiveTab]       = useState<typeof tabs[number]>("Details");
  const [showEdit, setShowEdit]         = useState(false);
  const [showMaint, setShowMaint]       = useState(false);
  const [showRetireConfirm, setShowRetireConfirm] = useState(false);
  const { show, ToastOutlet }           = useToast();

  /* Edit form local state */
  const [editForm, setEditForm] = useState({ ...asset });

  function saveEdit() {
    setAsset(editForm);
    show("Asset details updated.", "success");
    setShowEdit(false);
  }

  function saveMaint(req: MaintenanceRequest) {
    setAssetStatus("maintenance");
    show(`Maintenance request ${req.id} submitted.`);
    setShowMaint(false);
  }

  function retireAsset() {
    setAssetStatus("retired");
    show("Asset marked as retired.", "info");
    setShowRetireConfirm(false);
  }

  function toggleLost() {
    const next = assetStatus === "lost" ? "available" : "lost";
    setAssetStatus(next);
    show(next === "lost" ? "Asset reported as lost." : "Asset marked as found / available.", "info");
  }

  const inputCls =
    "w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-amber/60 placeholder:text-text-muted";

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors">
        <ArrowLeft size={14} /> Back to Asset Directory
      </button>

      {/* Header row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="font-mono text-lg text-amber">{tag}</span>
          <StatusPill status={assetStatus} label={assetStatus} />
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="flex items-center gap-1.5 text-xs" onClick={() => setShowEdit(true)}>
            <Pencil size={13} /> Edit Asset
          </Button>
          <Button variant="ghost" className="flex items-center gap-1.5 text-xs" onClick={() => setShowMaint(true)}>
            <Wrench size={13} /> Raise Maintenance
          </Button>
          <Button
            variant="ghost"
            className={`flex items-center gap-1.5 text-xs ${assetStatus === "lost" ? "text-teal" : "text-orange"}`}
            onClick={toggleLost}
          >
            <AlertTriangle size={13} /> {assetStatus === "lost" ? "Mark Found" : "Report Lost"}
          </Button>
          {assetStatus !== "retired" && (
            <Button
              variant="ghost"
              className="flex items-center gap-1.5 text-xs text-red hover:text-red"
              onClick={() => setShowRetireConfirm(true)}
            >
              <Archive size={13} /> Retire Asset
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border flex gap-6">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`pb-2.5 text-sm border-b-2 transition-colors ${
              activeTab === t ? "border-amber text-text" : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === "Details" && (
        <div className="grid grid-cols-2 gap-4 bg-surface border border-border rounded-md p-5">
          <DetailRow label="Name"            value={asset.name} />
          <DetailRow label="Category"        value={asset.category} />
          <DetailRow label="Serial Number"   value={asset.serial}   mono />
          <DetailRow label="Acquisition Date" value={asset.acquired} />
          <DetailRow label="Acquisition Cost" value={asset.cost}    mono />
          <DetailRow label="Condition"       value={asset.condition} />
          <DetailRow label="Location"        value={asset.location} />
          <DetailRow label="Department"      value={asset.department} />
        </div>
      )}

      {activeTab === "Allocation History" && (
        <HistoryTimeline items={allocationHistory} />
      )}

      {activeTab === "Maintenance History" && (
        <HistoryTimeline items={maintenanceHistory} />
      )}

      {/* ---- Edit Modal ---- */}
      {showEdit && (
        <Modal title="Edit Asset Details" onClose={() => setShowEdit(false)} widthClass="max-w-xl">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-caps text-text-muted block mb-1.5">Name</label>
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="label-caps text-text-muted block mb-1.5">Category</label>
                <input value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-caps text-text-muted block mb-1.5">Location</label>
                <input value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="label-caps text-text-muted block mb-1.5">Department</label>
                <input value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="label-caps text-text-muted block mb-1.5">Condition</label>
              <div className="flex gap-2">
                {conditions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, condition: c })}
                    className={`px-3 py-1.5 rounded-md text-xs border transition-colors ${
                      editForm.condition === c
                        ? "bg-amber/10 border-amber text-amber"
                        : "border-border text-text-muted hover:text-text"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowEdit(false)}>Cancel</Button>
              <Button variant="primary" onClick={saveEdit}>Save Changes</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ---- Retire Confirm Modal ---- */}
      {showRetireConfirm && (
        <Modal title="Retire Asset" onClose={() => setShowRetireConfirm(false)}>
          <div className="space-y-4">
            <p className="text-sm text-text-muted">
              Are you sure you want to retire <span className="text-text font-medium">{tag}</span>?
              This will remove it from active inventory. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowRetireConfirm(false)}>Cancel</Button>
              <Button variant="outline" className="!border-red/40 !text-red hover:!bg-red/10" onClick={retireAsset}>
                Confirm Retire
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ---- Maintenance Modal ---- */}
      {showMaint && (
        <RaiseMaintenanceModal
          prefilledTag={tag}
          prefilledAsset={asset.name}
          onClose={() => setShowMaint(false)}
          onSave={saveMaint}
        />
      )}

      {ToastOutlet}
    </div>
  );
}