import { useState } from "react";
import {
  Download, TrendingUp, TrendingDown, Package, Gauge, Wrench, AlertTriangle,
} from "lucide-react";
import StatCard from "../components/StatCard";
import Button from "../components/Button";

/* ---------- Mock data ---------- */

const mostUsedAssets = [
  { tag: "AF-0114", name: "Dell Latitude 5420", bookingsOrAllocations: 42 },
  { tag: "AF-0003", name: "Toyota Innova", bookingsOrAllocations: 37 },
  { tag: "AF-0201", name: "Conference Room Mic Kit", bookingsOrAllocations: 31 },
  { tag: "AF-0055", name: "HP LaserJet Pro M404", bookingsOrAllocations: 26 },
];

const idleAssets = [
  { tag: "AF-0088", name: "Standing Desk - Adj.", daysIdle: 96 },
  { tag: "AF-0142", name: "Projector - BenQ MW632ST", daysIdle: 74 },
  { tag: "AF-0067", name: "Herman Miller Aeron", daysIdle: 61 },
  { tag: "AF-0033", name: "Server Rack Unit 04", daysIdle: 58 },
];

const maintenanceByCategory = [
  { label: "Electronics", count: 24 },
  { label: "Vehicles", count: 11 },
  { label: "Furniture", count: 4 },
];

const departmentAllocations = [
  { department: "Engineering", count: 128 },
  { department: "Logistics", count: 64 },
  { department: "IT", count: 52 },
  { department: "Admin", count: 38 },
  { department: "Marketing", count: 21 },
  { department: "Design", count: 17 },
];

const upcomingMaintenance = [
  { tag: "AF-0114", name: "Dell Latitude 5420", reason: "Warranty ends in 12 days", severity: "warn" as const },
  { tag: "AF-0062", name: "Epson EB-X05 Projector", reason: "Due for calibration in 4 days", severity: "critical" as const },
  { tag: "AF-0007", name: "Server Rack Unit 02", reason: "Nearing retirement (5yr threshold)", severity: "info" as const },
  { tag: "AF-0177", name: "Company Vehicle - MH01AB1234", reason: "Service due in 9 days", severity: "warn" as const },
];

// 7 days x 12 hourly slots (8:00–20:00), values = booking count in that slot
const heatmapDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const heatmapHours = Array.from({ length: 12 }, (_, i) => 8 + i);
const heatmapData: number[][] = [
  [1, 2, 4, 6, 5, 2, 1, 3, 6, 7, 4, 1],
  [0, 3, 5, 7, 6, 2, 1, 4, 7, 8, 5, 2],
  [2, 4, 6, 8, 7, 3, 2, 5, 8, 9, 6, 3],
  [1, 3, 5, 7, 6, 2, 1, 4, 7, 8, 5, 2],
  [2, 5, 7, 9, 8, 4, 3, 6, 9, 9, 7, 4],
  [0, 1, 2, 3, 2, 1, 0, 1, 2, 3, 2, 1],
  [0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0],
];
const heatmapMax = Math.max(...heatmapData.flat());

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
  warn: "text-orange border-orange/30 bg-orange/5",
  info: "text-blue border-blue/30 bg-blue/5",
};

/* ---------- Screen ---------- */

const ranges = ["Last 7 days", "Last 30 days", "Last 90 days", "Year to date"];

export default function Reports() {
  const [range, setRange] = useState(ranges[1]);

  function handleExport() {
    // Dummy export — no backend yet. Swap for a real
    // GET /reports/export?type=csv call once the endpoint exists.
    alert("Export queued — CSV will be wired once /reports/export is live.");
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
          {ranges.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <Button variant="outline" onClick={handleExport} className="flex items-center gap-2 ml-auto">
          <Download size={16} /> Export CSV
        </Button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Assets" value={696} icon={Package} accent="amber" />
        <StatCard label="Utilization Rate" value="71%" icon={Gauge} accent="teal" sublabel="+4% vs prior period" />
        <StatCard label="Idle Assets (30d+)" value={39} icon={TrendingDown} accent="slate" />
        <StatCard label="Maintenance / Month" value={12.4} icon={Wrench} accent="orange" />
      </div>

      {/* Utilization: most-used vs idle */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Most-Used Assets" action={<TrendingUp size={14} className="text-teal" />}>
          <MiniBarList
            accent="teal"
            items={mostUsedAssets.map((a) => ({ label: `${a.tag} · ${a.name}`, value: a.bookingsOrAllocations, sublabel: "uses" }))}
          />
        </Panel>
        <Panel title="Idle Assets" action={<TrendingDown size={14} className="text-slate" />}>
          <MiniBarList
            accent="slate"
            items={idleAssets.map((a) => ({ label: `${a.tag} · ${a.name}`, value: a.daysIdle, sublabel: "days idle" }))}
          />
        </Panel>
      </div>

      {/* Maintenance frequency + department allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Maintenance Frequency by Category">
          <MiniBarList
            accent="orange"
            items={maintenanceByCategory.map((c) => ({ label: c.label, value: c.count, sublabel: "requests" }))}
          />
        </Panel>
        <Panel title="Department-wise Allocation Summary">
          <MiniBarList
            accent="amber"
            items={departmentAllocations.map((d) => ({ label: d.department, value: d.count, sublabel: "assets" }))}
          />
        </Panel>
      </div>

      {/* Due for maintenance / nearing retirement */}
      <Panel title="Due for Maintenance / Nearing Retirement" action={<AlertTriangle size={14} className="text-orange" />}>
        <div className="space-y-2">
          {upcomingMaintenance.map((item) => (
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
      </Panel>

      {/* Booking heatmap */}
      <Panel title="Resource Booking Heatmap" action={<span className="label-caps text-text-muted">Peak usage windows</span>}>
        <div className="overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-[40px_repeat(12,1fr)] gap-1 mb-1">
              <div />
              {heatmapHours.map((h) => (
                <div key={h} className="font-mono text-[10px] text-text-muted text-center">{h}:00</div>
              ))}
            </div>
            {heatmapDays.map((day, dayIdx) => (
              <div key={day} className="grid grid-cols-[40px_repeat(12,1fr)] gap-1 mb-1">
                <div className="font-mono text-[10px] text-text-muted flex items-center">{day}</div>
                {heatmapData[dayIdx].map((v, hourIdx) => (
                  <div
                    key={hourIdx}
                    title={`${day} ${heatmapHours[hourIdx]}:00 — ${v} bookings`}
                    className="aspect-square rounded-sm"
                    style={{ backgroundColor: `rgba(242, 169, 59, ${0.08 + (v / heatmapMax) * 0.82})` }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}