import { useState } from "react";
import {
  Download, TrendingUp, TrendingDown, Package, Gauge, Wrench, AlertTriangle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import StatCard from "../components/StatCard";
import Button from "../components/Button";
import { useToast } from "../components/Toast";
import { apiRequest } from "../lib/api";

/* ---------- Small chart helpers ---------- */

function MiniBarList({
  items,
  accent = "amber",
}: {
  items: { label: string; value: number; sublabel?: string }[];
  accent?: "amber" | "teal" | "red" | "blue" | "orange" | "slate";
}) {
  const max = Math.max(...items.map((i) => i.value), 1);
  const barBg: Record<string, string> = {
    amber: "bg-amber", teal: "bg-teal", red: "bg-red", blue: "bg-blue", orange: "bg-orange", slate: "bg-slate",
  };
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-text">{item.label}</span>
            <span className="font-mono text-text-muted">
              {item.value}
              {item.sublabel ? ` ${item.sublabel}` : ""}
            </span>
          </div>
          <div className="h-1.5 bg-surface-high rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${barBg[accent]}`}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <p className="text-xs text-text-muted text-center py-2">No data available</p>
      )}
    </div>
  );
}

function Panel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-md overflow-hidden">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text">{title}</h2>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

const severityStyles = {
  critical: "text-red border-red/30 bg-red/5",
  warn:     "text-orange border-orange/30 bg-orange/5",
  info:     "text-blue border-blue/30 bg-blue/5",
};

/* ---------- Screen ---------- */

const ranges = ["Last 7 days", "Last 30 days", "Last 90 days", "Year to date"];

// Booking activity heatmap — static display (no backend endpoint)
const heatmapDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const heatmapSlots = ["8–10am", "10–12pm", "12–2pm", "2–4pm", "4–6pm", "6–8pm"];
const heatmapData: number[][] = [
  [3, 7, 5, 8, 6, 2],
  [2, 8, 6, 9, 7, 3],
  [4, 9, 8, 10, 8, 3],
  [3, 8, 6, 9, 7, 2],
  [5, 9, 8, 10, 9, 4],
  [1, 3, 4, 4, 3, 1],
  [0, 1, 2, 2, 1, 0],
];
const heatmapMax = Math.max(...heatmapData.flat());

export default function Reports() {
  const [range, setRange] = useState(ranges[1]);
  const { show, ToastOutlet } = useToast();

  // Fetch all report data
  const { data: kpisRes }         = useQuery({ queryKey: ['reports/kpis'],                 queryFn: () => apiRequest('/reports/kpis') });
  const { data: utilizationRes }  = useQuery({ queryKey: ['reports/utilization'],          queryFn: () => apiRequest('/reports/utilization') });
  const { data: maintenanceRes }  = useQuery({ queryKey: ['reports/maintenance-frequency'], queryFn: () => apiRequest('/reports/maintenance-frequency') });
  const { data: idleRes }         = useQuery({ queryKey: ['reports/idle-assets'],           queryFn: () => apiRequest('/reports/idle-assets') });

  const kpis        = kpisRes?.data        || {};
  const utilization = utilizationRes?.data  || [];
  const maintenance = maintenanceRes?.data  || [];
  const idleAssets  = idleRes?.data         || [];

  // Map utilization: most-used assets
  const mostUsed = (Array.isArray(utilization) ? utilization : []).map((a: any) => ({
    label: `${a.asset_tag || ''} · ${a.name || a.asset_name || ''}`,
    value: a.usage_count || a.bookings_count || a.count || 0,
    sublabel: 'uses',
  }));

  // Map maintenance frequency
  const maintFreq = (Array.isArray(maintenance) ? maintenance : []).map((c: any) => ({
    label: c.category || c.name || '—',
    value: c.count || c.requests || 0,
    sublabel: 'requests',
  }));

  // Map idle assets
  const idle = (Array.isArray(idleAssets) ? idleAssets : []).map((a: any) => ({
    label: `${a.asset_tag || ''} · ${a.name || ''}`,
    value: a.idle_days || a.days_idle || 0,
    sublabel: 'days idle',
  }));

  // Upcoming maintenance from idle assets with flags
  const upcomingMaint = (Array.isArray(idleAssets) ? idleAssets : [])
    .filter((a: any) => a.idle_days > 30)
    .slice(0, 4)
    .map((a: any) => ({
      tag:      a.asset_tag || '—',
      name:     a.name || '—',
      reason:   `Idle for ${a.idle_days || 0} days`,
      severity: a.idle_days > 90 ? 'critical' : a.idle_days > 60 ? 'warn' : 'info' as const,
    }));

  function handleExport() {
    show("Export queued — CSV download not yet wired to a backend endpoint.", "info");
  }

  return (
    <div className="space-y-4">
      {/* Header: range + export */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="bg-surface border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none"
        >
          {ranges.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <Button variant="outline" onClick={handleExport} className="flex items-center gap-2 ml-auto">
          <Download size={16} /> Export CSV
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Assets"       value={kpis.total_assets       ?? '—'} icon={Package}     accent="amber" />
        <StatCard label="Utilization Rate"   value={kpis.utilization_rate   ? `${kpis.utilization_rate}%` : '—'} icon={Gauge} accent="teal"
          sublabel={kpis.utilization_delta ? `${kpis.utilization_delta > 0 ? '+' : ''}${kpis.utilization_delta}% vs prior` : undefined} />
        <StatCard label="Idle Assets (30d+)" value={kpis.idle_assets_count  ?? idle.length} icon={TrendingDown} accent="slate" />
        <StatCard label="Maintenance / Month" value={kpis.avg_maintenance_per_month ?? '—'} icon={Wrench} accent="orange" />
      </div>

      {/* Utilization: most-used vs idle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Most-Used Assets" action={<TrendingUp size={14} className="text-teal" />}>
          <MiniBarList accent="teal" items={mostUsed} />
        </Panel>
        <Panel title="Idle Assets" action={<TrendingDown size={14} className="text-slate" />}>
          <MiniBarList accent="slate" items={idle} />
        </Panel>
      </div>

      {/* Maintenance frequency + department allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Maintenance Frequency by Category">
          <MiniBarList accent="orange" items={maintFreq} />
        </Panel>
        <Panel title="Due for Maintenance / Long Idle" action={<AlertTriangle size={14} className="text-orange" />}>
          {upcomingMaint.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-2">No assets flagged</p>
          ) : (
            <div className="space-y-2">
              {upcomingMaint.map((item) => (
                <div
                  key={item.tag}
                  className={`flex items-center justify-between px-3 py-2 rounded-md border ${severityStyles[item.severity]}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-amber">{item.tag}</span>
                    <span className="text-sm text-text">{item.name}</span>
                  </div>
                  <span className="text-xs font-mono">{item.reason}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* Booking heatmap (static display) */}
      <Panel
        title="Resource Booking Heatmap"
        action={<span className="label-caps text-text-muted">Avg. active bookings per 2-hr slot</span>}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-[4px]" style={{ marginLeft: 44 }}>
            {heatmapSlots.map((slot) => (
              <div
                key={slot}
                style={{ width: 56 }}
                className="text-[10px] font-mono text-text-muted text-center shrink-0 leading-none"
              >
                {slot}
              </div>
            ))}
          </div>

          <div className="space-y-[4px]">
            {heatmapDays.map((day, dayIdx) => (
              <div key={day} className="flex items-center gap-[4px]">
                <span className="text-[10px] font-mono text-text-muted shrink-0 text-right" style={{ width: 36 }}>
                  {day}
                </span>
                {heatmapData[dayIdx].map((v, slotIdx) => (
                  <div
                    key={slotIdx}
                    title={`${day} · ${heatmapSlots[slotIdx]} — ${v} bookings`}
                    className="rounded-[3px] shrink-0 cursor-default"
                    style={{
                      width: 56,
                      height: 22,
                      backgroundColor:
                        v === 0
                          ? "rgba(242,169,59,0.06)"
                          : `rgba(242,169,59,${0.12 + (v / heatmapMax) * 0.88})`,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-[4px] self-start" style={{ marginLeft: 44 }}>
            <span className="text-[10px] font-mono text-text-muted mr-1">Less</span>
            {[0.06, 0.22, 0.42, 0.62, 0.88].map((op) => (
              <div
                key={op}
                className="rounded-[3px]"
                style={{ width: 22, height: 10, backgroundColor: `rgba(242,169,59,${op})` }}
              />
            ))}
            <span className="text-[10px] font-mono text-text-muted ml-1">More active</span>
          </div>
        </div>
      </Panel>
      {ToastOutlet}
    </div>
  );
}