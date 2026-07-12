import { useEffect, useState } from "react";
import {
  Package, ArrowLeftRight, Wrench, CalendarClock, Repeat, Clock, AlertTriangle,
} from "lucide-react";
import StatCard from "../components/StatCard";
import Button from "../components/Button";
import { apiRequest } from "../lib/api";

interface KPI {
  available: number;
  allocated: number;
  maintenance_today: number;
  critical_maintenance: number;
  active_bookings: number;
  pending_transfers: number;
  upcoming_returns: number;
}

interface AllocRow {
  id: string;
  asset: { asset_tag: string; name: string };
  employee: { name: string; department?: { name: string } };
  due_date?: string;
  status: string;
  days_overdue?: number;
}

interface NotifRow {
  id: string;
  created_at: string;
  message: string;
  type: string;
}

export default function Dashboard({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const [kpis, setKpis] = useState<KPI | null>(null);
  const [allocations, setAllocations] = useState<AllocRow[]>([]);
  const [notifications, setNotifications] = useState<NotifRow[]>([]);

  useEffect(() => {
    // KPIs
    apiRequest('/reports/kpis').then((r) => setKpis(r.data)).catch(() => null);
    // Allocations for overdue/upcoming
    apiRequest('/allocations').then((r) => setAllocations(r.data || [])).catch(() => null);
    // Recent notifications for activity feed
    apiRequest('/notifications').then((r) => setNotifications((r.data || []).slice(0, 6))).catch(() => null);
  }, []);

  const overdueReturns = allocations.filter((a) => a.status === 'overdue');
  const upcomingReturns = allocations.filter((a) => a.status === 'active' && a.due_date);

  function formatDue(due?: string) {
    if (!due) return '—';
    const d = new Date(due);
    const now = new Date();
    const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff > 1) return `In ${diff} days`;
    return d.toLocaleDateString();
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard label="Assets Available"  value={kpis?.available        ?? '—'} icon={Package}      accent="teal" />
        <StatCard label="Assets Allocated"  value={kpis?.allocated        ?? '—'} icon={ArrowLeftRight} accent="amber" />
        <StatCard label="Maintenance Today" value={kpis?.maintenance_today ?? '—'} icon={Wrench}        accent="orange"
          sublabel={kpis?.critical_maintenance ? `${kpis.critical_maintenance} CRITICAL` : undefined} />
        <StatCard label="Active Bookings"   value={kpis?.active_bookings  ?? '—'} icon={CalendarClock} accent="blue" />
        <StatCard label="Pending Transfers" value={kpis?.pending_transfers ?? '—'} icon={Repeat}        accent="slate" />
        <StatCard label="Upcoming Returns"  value={kpis?.upcoming_returns ?? '—'} icon={Clock}         accent="teal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: overdue + upcoming + activity */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Overdue returns */}
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
              {overdueReturns.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-4">No overdue returns 🎉</p>
              ) : overdueReturns.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="font-mono text-amber text-sm">{item.asset?.asset_tag}</span>
                    <span className="text-sm text-text ml-2">{item.asset?.name}</span>
                    <p className="text-xs text-text-muted mt-0.5">Held by {item.employee?.name}</p>
                  </div>
                  <span className="font-mono text-xs text-red">
                    {item.days_overdue != null ? `${item.days_overdue}D OVERDUE` : 'OVERDUE'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming returns */}
          <div className="bg-surface border border-border rounded-md overflow-hidden">
            <div className="p-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text">Upcoming Returns</h2>
            </div>
            <div className="divide-y divide-border">
              {upcomingReturns.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-4">No upcoming returns</p>
              ) : upcomingReturns.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="font-mono text-amber text-sm">{item.asset?.asset_tag}</span>
                    <span className="text-sm text-text ml-2">{item.asset?.name}</span>
                    <p className="text-xs text-text-muted mt-0.5">Held by {item.employee?.name}</p>
                  </div>
                  <span className="font-mono text-xs text-text-muted">{formatDue(item.due_date)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity feed from notifications */}
          <div className="bg-surface border border-border rounded-md overflow-hidden">
            <div className="p-3 border-b border-border">
              <h2 className="text-sm font-semibold text-text">Recent Activity</h2>
            </div>
            <table className="w-full text-left">
              <tbody>
                {notifications.length === 0 ? (
                  <tr>
                    <td className="py-4 px-4 text-xs text-text-muted text-center" colSpan={3}>
                      No recent activity
                    </td>
                  </tr>
                ) : notifications.map((n) => (
                  <tr key={n.id} className="border-b border-border/50 last:border-0 hover:bg-surface-hover">
                    <td className="py-2 px-4 font-mono text-xs text-text-muted w-24">{formatTime(n.created_at)}</td>
                    <td className="py-2 px-4 text-xs text-text-muted w-24 capitalize">{n.type?.replace(/_/g, ' ')}</td>
                    <td className="py-2 px-4 text-sm text-text">{n.message}</td>
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
            <Button variant="primary" className="w-full flex items-center justify-center gap-2" onClick={() => onNavigate("assets")}>
              <Package size={16} /> Register Asset
            </Button>
            <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={() => onNavigate("bookings")}>
              <CalendarClock size={16} /> Book Resource
            </Button>
            <Button variant="outline" className="w-full flex items-center justify-center gap-2" onClick={() => onNavigate("maintenance")}>
              <Wrench size={16} /> Raise Maintenance Request
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}