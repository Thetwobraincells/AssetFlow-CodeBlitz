import { useState, useEffect } from "react";
import { ArrowLeft, Pencil, Wrench, AlertTriangle, Archive } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import StatusPill from "../components/StatusPill";
import Modal from "../components/Modal";
import Button from "../components/Button";
import RaiseMaintenanceModal, { type MaintenanceRequest } from "../components/RaiseMaintenanceModal";
import { useToast } from "../components/Toast";
import { apiRequest } from "../lib/api";
import { useSafeMutation } from "../hooks/useSafeMutation";

const tabs = ["Details", "Allocation History", "Maintenance History"] as const;

type AssetStatus = "available" | "allocated" | "maintenance" | "retired" | "lost";

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="label-caps text-text-muted mb-1">{label}</p>
      <p className={`text-sm text-text ${mono ? "font-mono" : ""}`}>{value || "—"}</p>
    </div>
  );
}

function HistoryTimeline({ items }: { items: { date: string; event: string; by: string }[] }) {
  if (!items || items.length === 0) {
    return <div className="p-4 text-center text-sm text-text-muted border border-border rounded-md">No history available.</div>;
  }
  return (
    <div className="bg-surface border border-border rounded-md p-5">
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex gap-4 relative pl-4 border-l border-border">
            <div className="absolute left-[-4.5px] top-1 w-2 h-2 rounded-full bg-amber" />
            <div>
              <p className="font-mono text-xs text-text-muted">{new Date(item.date).toLocaleDateString()}</p>
              <p className="text-sm text-text">{item.event}</p>
              <p className="text-xs text-text-muted">by {item.by}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const conditions = ["excellent", "good", "fair", "poor"];

export default function AssetDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const { data: response, isLoading } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => apiRequest(`/assets/${id}`)
  });
  
  const asset = response?.data;
  const [activeTab, setActiveTab] = useState<typeof tabs[number]>("Details");
  const [showEdit, setShowEdit] = useState(false);
  const [showMaint, setShowMaint] = useState(false);
  const [showRetireConfirm, setShowRetireConfirm] = useState(false);
  const { show, ToastOutlet } = useToast();

  const [editForm, setEditForm] = useState<any>({});

  useEffect(() => {
    if (asset) {
      setEditForm({ ...asset });
    }
  }, [asset]);

  const updateAsset = useSafeMutation(
    ['asset', id],
    (payload: any) => apiRequest(`/assets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    })
  );

  function saveEdit() {
    updateAsset.mutate({
      name: editForm.name,
      condition: editForm.condition,
      location: editForm.location,
      status: editForm.status
    }, {
      onSuccess: () => {
        show("Asset details updated.", "success");
        setShowEdit(false);
      },
      onError: (err: any) => {
        show(err.message || "Failed to update asset.", "error");
      }
    });
  }

  function saveMaint(req: MaintenanceRequest) {
    updateAsset.mutate({ status: "maintenance" }, {
      onSuccess: () => {
        show(`Maintenance request ${req.id} submitted.`);
        setShowMaint(false);
      },
      onError: (err: any) => {
        show(err.message || "Failed to submit request.", "error");
      }
    });
  }

  function retireAsset() {
    updateAsset.mutate({ status: "retired" }, {
      onSuccess: () => {
        show("Asset marked as retired.", "info");
        setShowRetireConfirm(false);
      },
      onError: (err: any) => {
        show(err.message || "Failed to retire asset.", "error");
      }
    });
  }

  function toggleLost() {
    const next = asset?.status === "lost" ? "available" : "lost";
    updateAsset.mutate({ status: next }, {
      onSuccess: () => {
        show(next === "lost" ? "Asset reported as lost." : "Asset marked as found / available.", "info");
      },
      onError: (err: any) => {
        show(err.message || "Failed to update status.", "error");
      }
    });
  }

  const inputCls = "w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-amber/60 placeholder:text-text-muted";

  if (isLoading) {
    return <div className="p-8 text-center text-text-muted">Loading...</div>;
  }
  
  if (!asset) {
    return (
      <div className="space-y-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors">
          <ArrowLeft size={14} /> Back to Asset Directory
        </button>
        <div className="p-8 text-center text-text-muted">Asset not found.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors">
        <ArrowLeft size={14} /> Back to Asset Directory
      </button>

      {/* Header row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="font-mono text-lg text-amber">{asset.asset_tag}</span>
          <StatusPill status={asset.status} label={asset.status.replace(/_/g, " ")} />
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
            className={`flex items-center gap-1.5 text-xs ${asset.status === "lost" ? "text-teal" : "text-orange"}`}
            onClick={toggleLost}
          >
            <AlertTriangle size={13} /> {asset.status === "lost" ? "Mark Found" : "Report Lost"}
          </Button>
          {asset.status !== "retired" && (
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
          <DetailRow label="Category"        value={asset.category?.name || "—"} />
          <DetailRow label="Serial Number"   value={asset.serial_number}   mono />
          <DetailRow label="Acquisition Date" value={asset.acquisition_date ? new Date(asset.acquisition_date).toLocaleDateString() : "—"} />
          <DetailRow label="Acquisition Cost" value={asset.acquisition_cost ? `₹${asset.acquisition_cost}` : "—"}    mono />
          <DetailRow label="Condition"       value={asset.condition} />
          <DetailRow label="Location"        value={asset.location} />
          <DetailRow label="Department"      value={asset.department?.name || "—"} />
        </div>
      )}

      {activeTab === "Allocation History" && (
        <HistoryTimeline items={asset.Allocation?.map((alloc: any) => ({
          date: alloc.created_at,
          event: `Allocated to ${alloc.user?.name || "Unknown"}`,
          by: "System"
        })) || []} />
      )}

      {activeTab === "Maintenance History" && (
        <HistoryTimeline items={asset.MaintenanceRecord?.map((maint: any) => ({
          date: maint.scheduled_date || maint.created_at,
          event: `${maint.status} - ${maint.issue_description}`,
          by: maint.assigned_to_user?.name || "Unassigned"
        })) || []} />
      )}

      {/* ---- Edit Modal ---- */}
      {showEdit && (
        <Modal title="Edit Asset Details" onClose={() => setShowEdit(false)} widthClass="max-w-xl">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-caps text-text-muted block mb-1.5">Name</label>
                <input value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-caps text-text-muted block mb-1.5">Location</label>
                <input value={editForm.location || ""} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} className={inputCls} />
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
                    className={`px-3 py-1.5 rounded-md text-xs border capitalize transition-colors ${
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
              <Button variant="primary" onClick={saveEdit} disabled={updateAsset.isPending}>
                {updateAsset.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ---- Retire Confirm Modal ---- */}
      {showRetireConfirm && (
        <Modal title="Retire Asset" onClose={() => setShowRetireConfirm(false)}>
          <div className="space-y-4">
            <p className="text-sm text-text-muted">
              Are you sure you want to retire <span className="text-text font-medium">{asset.asset_tag}</span>?
              This will remove it from active inventory. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowRetireConfirm(false)}>Cancel</Button>
              <Button variant="outline" className="!border-red/40 !text-red hover:!bg-red/10" onClick={retireAsset} disabled={updateAsset.isPending}>
                {updateAsset.isPending ? "Retiring..." : "Confirm Retire"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ---- Maintenance Modal ---- */}
      {showMaint && (
        <RaiseMaintenanceModal
          prefilledTag={asset.asset_tag}
          prefilledAsset={asset.name}
          onClose={() => setShowMaint(false)}
          onSave={saveMaint}
        />
      )}

      {ToastOutlet}
    </div>
  );
}