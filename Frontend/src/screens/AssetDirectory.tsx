import { useState } from "react";
import { Search, Plus, Package } from "lucide-react";
import StatusPill from "../components/StatusPill";
import Button from "../components/Button";
import RegisterAssetModal from "../components/RegisterAssetModal";

type AssetStatus = "allocated" | "available" | "reserved" | "maintenance" | "lost" | "retired" | "disposed";

interface Asset {
  tag: string;
  name: string;
  category: string;
  status: AssetStatus;
  location: string;
  department: string;
}

const initialAssets: Asset[] = [
  { tag: "AF-0001", name: "Dell Latitude 5420", category: "Electronics", status: "allocated", location: "Mumbai HQ - 4F", department: "Engineering" },
  { tag: "AF-0002", name: "Herman Miller Aeron", category: "Furniture", status: "available", location: "Mumbai HQ - 2F", department: "—" },
  { tag: "AF-0003", name: "Toyota Innova - MH01AB1234", category: "Vehicles", status: "reserved", location: "Parking Bay 2", department: "Logistics" },
  { tag: "AF-0004", name: "Epson EB-X05 Projector", category: "Electronics", status: "maintenance", location: "Conference Room B2", department: "—" },
  { tag: "AF-0005", name: "HP LaserJet Pro M404", category: "Electronics", status: "available", location: "Mumbai HQ - 3F", department: "Admin" },
  { tag: "AF-0006", name: "Standing Desk - Adj.", category: "Furniture", status: "lost", location: "Unknown", department: "Design" },
  { tag: "AF-0007", name: "Server Rack Unit 02", category: "Electronics", status: "retired", location: "Server Room", department: "IT" },
];

const categories = ["All", "Electronics", "Furniture", "Vehicles"];
const statuses = ["All", "available", "allocated", "reserved", "maintenance", "lost", "retired", "disposed"];

export default function AssetDirectory({ onOpenDetail }: { onOpenDetail: (tag: string) => void }) {
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [showRegister, setShowRegister] = useState(false);

  function handleRegister(newAsset: Asset) {
    setAssets((prev) => [newAsset, ...prev]);
    setShowRegister(false);
  }

  const filtered = assets.filter((a) => {
    const matchesSearch =
      a.tag.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || a.category === category;
    const matchesStatus = status === "All" || a.status === status;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Top bar: search + filters + register */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Asset Tag or name..."
            className="w-full bg-surface border border-border rounded-md pl-8 pr-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-amber/40"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-surface border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c === "All" ? "Category: All" : c}</option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-surface border border-border rounded-md px-3 py-2 text-sm text-text capitalize focus:outline-none"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s === "All" ? "Status: All" : s}</option>
          ))}
        </select>

        <Button variant="primary" onClick={() => setShowRegister(true)} className="flex items-center gap-2 ml-auto">
          <Plus size={16} /> Register Asset
        </Button>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-md overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-surface-high">
              <th className="label-caps text-text-muted py-2.5 px-4">Asset Tag</th>
              <th className="label-caps text-text-muted py-2.5 px-4">Name</th>
              <th className="label-caps text-text-muted py-2.5 px-4">Category</th>
              <th className="label-caps text-text-muted py-2.5 px-4">Status</th>
              <th className="label-caps text-text-muted py-2.5 px-4">Location</th>
              <th className="label-caps text-text-muted py-2.5 px-4">Department</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr
                key={a.tag}
                onClick={() => onOpenDetail(a.tag)}
                className="border-b border-border/50 last:border-0 hover:bg-surface-hover cursor-pointer transition-colors"
              >
                <td className="py-3 px-4">
                  <span className="font-mono text-sm text-amber">{a.tag}</span>
                </td>
                <td className="py-3 px-4 text-sm text-text flex items-center gap-2">
                  <Package size={14} className="text-text-muted" />
                  {a.name}
                </td>
                <td className="py-3 px-4 text-sm text-text-muted">{a.category}</td>
                <td className="py-3 px-4">
                  <StatusPill status={a.status} label={a.status.replace(/^\w/, (c) => c.toUpperCase())} />
                </td>
                <td className="py-3 px-4 text-sm text-text-muted">{a.location}</td>
                <td className="py-3 px-4 text-sm text-text-muted">{a.department}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-sm text-text-muted">
                  No assets match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showRegister && (
        <RegisterAssetModal
          nextTag={`AF-${String(assets.length + 1).padStart(4, "0")}`}
          onClose={() => setShowRegister(false)}
          onRegister={handleRegister}
        />
      )}
    </div>
  );
}