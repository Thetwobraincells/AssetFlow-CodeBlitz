import {
  Package, ArrowLeftRight, Wrench, CalendarClock, Repeat, Clock, AlertTriangle,
} from "lucide-react";
import StatCard from "../components/StatCard";
import Button from "../components/Button";
import StatusPill from "../components/StatusPill";

const overdueReturns = [
  { tag: "AF-0114", asset: "Dell Latitude 5420", holder: "Priya Shah", days: 3 },
  { tag: "AF-0092", asset: "Projector - Epson EB-X05", holder: "Marketing Dept", days: 1 },
];

const upcomingReturns = [
  { tag: "AF-0201", asset: "Conference Room Mic Kit", holder: "Raj Mehta", due: "Tomorrow" },
  { tag: "AF-0177", asset: "Company Vehicle - MH01AB1234", holder: "Logistics", due: "In 2 days" },
];

const activity = [
  { time: "14:32:07", user: "Priya Shah", action: "allocated", detail: "AF-0114 → Raj Mehta" },
  { time: "14:18:33", user: "System", action: "alert", detail: "AF-0092 overdue return" },
  { time: "14:05:12", user: "Asset Manager", action: "resolved", detail: "AF-0055 maintenance closed" },
  { time: "13:45:00", user: "Dept Head", action: "approved", detail: "Transfer AF-0201 approved" },
];

export default function Dashboard() {
  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard label="Assets Available" value={214} icon={Package} accent="teal" />
        <StatCard label="Assets Allocated" value={482} icon={ArrowLeftRight} accent="amber" />
        <StatCard label="Maintenance Today" value={6} icon={Wrench} accent="orange" sublabel="2 CRITICAL" />
        <StatCard label="Active Bookings" value={19} icon={CalendarClock} accent="blue" />
        <StatCard label="Pending Transfers" value={4} icon={Repeat} accent="slate" />
        <StatCard label="Upcoming Returns" value={11} icon={Clock} accent="teal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: overdue + upcoming + activity */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Overdue returns — urgent styling */}
          <div className="bg-surface border border-red/30 rounded-md overflow-hidden">
            <div className="p-3 border-b border-border bg-red/5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-red">
                <AlertTriangle size={16} strokeWidth={1.5} />
                Overdue Returns
              </h2>
              <span className="label-caps text-red border border-red/40 px-1.5 py-0.5 rounded">
                {overdueReturns.length} ITEMS
              </span>
            </div>
            <div className="divide-y divide-border">
              {overdueReturns.map((item) => (
                <div key={item.tag} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="font-mono text-amber text-sm">{item.tag}</span>
                    <span className="text-sm text-text ml-2">{item.asset}</span>
                    <p className="text-xs text-text-muted mt-0.5">Held by {item.holder}</p>
                  </div>
                  <span className="font-mono text-xs text-red">{item.days}D OVERDUE</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming returns — calmer styling */}
          <div className="bg-surface border border-border rounded-md overflow-hidden">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text">Upcoming Returns</h2>
            </div>
            <div className="divide-y divide-border">
              {upcomingReturns.map((item) => (
                <div key={item.tag} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="font-mono text-amber text-sm">{item.tag}</span>
                    <span className="text-sm text-text ml-2">{item.asset}</span>
                    <p className="text-xs text-text-muted mt-0.5">Held by {item.holder}</p>
                  </div>
                  <span className="font-mono text-xs text-text-muted">{item.due}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity feed */}
          <div className="bg-surface border border-border rounded-md overflow-hidden">
            <div className="p-3 border-b border-border">
              <h2 className="text-sm font-semibold text-text">Recent Activity</h2>
            </div>
            <table className="w-full text-left">
              <tbody>
                {activity.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-surface-hover">
                    <td className="py-2 px-4 font-mono text-xs text-text-muted w-24">{row.time}</td>
                    <td className="py-2 px-4 text-xs text-text-muted w-32">{row.user}</td>
                    <td className="py-2 px-4 text-sm text-text">{row.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: quick actions */}
        <div className="lg:col-span-4">
          <div className="bg-surface border border-border rounded-md p-4 space-y-3">
            <h2 className="text-sm font-semibold text-text mb-1">Quick Actions</h2>
            <Button variant="primary" className="w-full flex items-center justify-center gap-2">
              <Package size={16} /> Register Asset
            </Button>
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <CalendarClock size={16} /> Book Resource
            </Button>
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <Wrench size={16} /> Raise Maintenance Request
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}