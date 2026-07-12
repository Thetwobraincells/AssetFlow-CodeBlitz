import { useState } from "react";
import { Search, Plus, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/api";
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

export default function AssetDirectory({ onOpenDetail }: { onOpenDetail: (id: string) => void }) {
  const { data: response, isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: () => apiRequest('/assets')
  });
  const assets = response?.data || [];

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [showRegister, setShowRegister] = useState(false);

  const categories = ["All", ...new Set(assets.map((a: any) => a.category?.name).filter(Boolean)) as string[]];
  const statuses = ["All", "available", "allocated", "reserved", "under_maintenance", "lost", "retired", "disposed"];

  const filtered = assets.filter((a: any) => {
    const matchesSearch =
      a.asset_tag.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || a.category?.name === category;
    const matchesStatus = status === "All" || a.status === status;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (isLoading) {
    return <div className="p-8 text-center text-text-muted">Loading assets...</div>;
  }

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
            {filtered.map((a: any) => (
              <tr
                key={a.asset_tag}
                onClick={() => onOpenDetail(a.id)}
                className="border-b border-border/50 last:border-0 hover:bg-surface-hover cursor-pointer transition-colors"
              >
                <td className="py-3 px-4">
                  <span className="font-mono text-sm text-amber">{a.asset_tag}</span>
                </td>
                <td className="py-3 px-4 text-sm text-text flex items-center gap-2">
                  <Package size={14} className="text-text-muted" />
                  {a.name}
                </td>
                <td className="py-3 px-4 text-sm text-text-muted">{a.category?.name || "—"}</td>
                <td className="py-3 px-4">
                  <StatusPill status={a.status} label={a.status.replace(/_/g, " ").replace(/^\w/, (c: string) => c.toUpperCase())} />
                </td>
                <td className="py-3 px-4 text-sm text-text-muted">{a.location}</td>
                <td className="py-3 px-4 text-sm text-text-muted">{a.department?.name || "—"}</td>
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
          onClose={() => setShowRegister(false)}
        />
      )}
    </div>
  );
}