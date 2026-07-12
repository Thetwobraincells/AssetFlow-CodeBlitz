import { useState } from "react";
import {
  Bell, FileClock, CheckCheck, Search,
  Package, Wrench, CalendarClock, ArrowLeftRight, AlertTriangle, ClipboardCheck, Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Button from "../components/Button";

const tabs = ["Notifications", "Activity Log"] as const;
type Tab = (typeof tabs)[number];

/* ---------- Notifications ---------- */

type NotifType =
  | "asset_assigned" | "maintenance_approved" | "maintenance_rejected"
  | "booking_confirmed" | "booking_cancelled" | "booking_reminder"
  | "transfer_approved" | "overdue_return" | "audit_discrepancy";

const notifMeta: Record<NotifType, { icon: LucideIcon; accent: string; label: string }> = {
  asset_assigned: { icon: Package, accent: "amber", label: "Asset Assigned" },
  maintenance_approved: { icon: Wrench, accent: "teal", label: "Maintenance Approved" },
  maintenance_rejected: { icon: Wrench, accent: "red", label: "Maintenance Rejected" },
  booking_confirmed: { icon: CalendarClock, accent: "teal", label: "Booking Confirmed" },
  booking_cancelled: { icon: CalendarClock, accent: "red", label: "Booking Cancelled" },
  booking_reminder: { icon: Clock, accent: "blue", label: "Booking Reminder" },
  transfer_approved: { icon: ArrowLeftRight, accent: "teal", label: "Transfer Approved" },
  overdue_return: { icon: AlertTriangle, accent: "red", label: "Overdue Return" },
  audit_discrepancy: { icon: ClipboardCheck, accent: "orange", label: "Audit Discrepancy" },
};

const accentText: Record<string, string> = {
  amber: "text-amber", teal: "text-teal", red: "text-red", blue: "text-blue", orange: "text-orange", slate: "text-slate",
};
const accentBg: Record<string, string> = {
  amber: "bg-amber/10", teal: "bg-teal/10", red: "bg-red/10", blue: "bg-blue/10", orange: "bg-orange/10", slate: "bg-slate/10",
};

interface NotificationItem {
  id: string;
  type: NotifType;
  message: string;
  time: string;
  isRead: boolean;
}

const initialNotifications: NotificationItem[] = [
  { id: "n1", type: "overdue_return", message: "AF-0114 (Dell Latitude 5420) is 3 days overdue — held by Priya Shah", time: "5 min ago", isRead: false },
  { id: "n2", type: "audit_discrepancy", message: "Q3 Engineering Audit flagged AF-0088 as Missing", time: "22 min ago", isRead: false },
  { id: "n3", type: "maintenance_approved", message: "Maintenance request for AF-0055 was approved by Asset Manager", time: "1 hr ago", isRead: false },
  { id: "n4", type: "booking_confirmed", message: "Room B2 booked 10:00–11:00 by Raj Mehta", time: "2 hr ago", isRead: true },
  { id: "n5", type: "transfer_approved", message: "Transfer of AF-0114 to Raj Mehta approved by Department Head", time: "3 hr ago", isRead: true },
  { id: "n6", type: "booking_reminder", message: "Your booking for Conference Room A starts in 15 minutes", time: "Yesterday", isRead: true },
  { id: "n7", type: "asset_assigned", message: "AF-0201 (Mic Kit) assigned to you", time: "Yesterday", isRead: true },
  { id: "n8", type: "booking_cancelled", message: "Booking for Company Vehicle MH01AB1234 was cancelled", time: "2 days ago", isRead: true },
];

const notifFilters = ["All", "Unread", ...Object.keys(notifMeta)] as const;

function NotificationsPanel() {
  const [items, setItems] = useState(initialNotifications);
  const [filter, setFilter] = useState<(typeof notifFilters)[number]>("All");

  const filtered = items.filter((n) => {
    if (filter === "All") return true;
    if (filter === "Unread") return !n.isRead;
    return n.type === filter;
  });

  function toggleRead(id: string) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n)));
  }

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as (typeof notifFilters)[number])}
          className="bg-surface border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none"
        >
          {notifFilters.map((f) => (
            <option key={f} value={f}>
              {f === "All" ? "All Types" : f === "Unread" ? "Unread Only" : notifMeta[f as NotifType].label}
            </option>
          ))}
        </select>

        <Button variant="outline" onClick={markAllRead} className="flex items-center gap-2 ml-auto">
          <CheckCheck size={16} /> Mark all as read
        </Button>
      </div>

      <div className="bg-surface border border-border rounded-md overflow-hidden">
        <div className="divide-y divide-border">
          {filtered.map((n) => {
            const meta = notifMeta[n.type];
            const Icon = meta.icon;
            return (
              <button
                key={n.id}
                onClick={() => toggleRead(n.id)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover ${
                  n.isRead ? "" : "bg-amber/[0.03]"
                }`}
              >
                <div className={`shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${accentBg[meta.accent]}`}>
                  <Icon size={16} strokeWidth={1.5} className={accentText[meta.accent]} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.isRead ? "text-text-muted" : "text-text"}`}>{n.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`label-caps ${accentText[meta.accent]}`}>{meta.label}</span>
                    <span className="font-mono text-xs text-text-muted">· {n.time}</span>
                  </div>
                </div>
                {!n.isRead && <span className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-amber" />}
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-sm text-text-muted">No notifications match this filter.</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Activity Log ---------- */

interface LogEntry {
  id: string;
  time: string;
  user: string;
  role: string;
  action: string;
  entityType: string;
}

const activityLog: LogEntry[] = [
  { id: "l1", time: "2026-07-12 14:32:07", user: "Priya Shah", role: "Asset Manager", action: "Allocated AF-0114 to Raj Mehta", entityType: "Allocation" },
  { id: "l2", time: "2026-07-12 14:18:33", user: "System", role: "—", action: "Flagged AF-0092 as overdue return", entityType: "Allocation" },
  { id: "l3", time: "2026-07-12 14:05:12", user: "Amit Kumar", role: "Asset Manager", action: "Resolved maintenance on AF-0055", entityType: "Maintenance" },
  { id: "l4", time: "2026-07-12 13:45:00", user: "Neha Verma", role: "Department Head", action: "Approved transfer request for AF-0201", entityType: "Transfer" },
  { id: "l5", time: "2026-07-12 12:58:41", user: "Raj Mehta", role: "Employee", action: "Booked Room B2 for 10:00–11:00", entityType: "Booking" },
  { id: "l6", time: "2026-07-12 11:20:09", user: "Admin", role: "Admin", action: "Promoted Neha Verma to Department Head", entityType: "User" },
  { id: "l7", time: "2026-07-11 17:03:55", user: "Amit Kumar", role: "Asset Manager", action: "Registered new asset AF-0212", entityType: "Asset" },
  { id: "l8", time: "2026-07-11 15:44:20", user: "Priya Shah", role: "Asset Manager", action: "Marked AF-0088 as Missing in Q3 Audit", entityType: "Audit" },
  { id: "l9", time: "2026-07-11 10:12:03", user: "Raj Mehta", role: "Employee", action: "Raised maintenance request for AF-0055", entityType: "Maintenance" },
  { id: "l10", time: "2026-07-10 09:30:44", user: "Admin", role: "Admin", action: "Created department: Logistics", entityType: "User" },
];

const entityTypes = ["All", "Asset", "Allocation", "Booking", "Maintenance", "Transfer", "Audit", "User"];

function ActivityLogPanel() {
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState("All");

  const filtered = activityLog.filter((l) => {
    const matchesSearch =
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.user.toLowerCase().includes(search.toLowerCase());
    const matchesType = entityType === "All" || l.entityType === entityType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user or action..."
            className="w-full bg-surface border border-border rounded-md pl-8 pr-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-amber/40"
          />
        </div>

        <select
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          className="bg-surface border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none"
        >
          {entityTypes.map((t) => (
            <option key={t} value={t}>{t === "All" ? "Entity: All" : t}</option>
          ))}
        </select>
      </div>

      <div className="bg-surface border border-border rounded-md overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-surface-high">
              <th className="label-caps text-text-muted py-2.5 px-4">Timestamp</th>
              <th className="label-caps text-text-muted py-2.5 px-4">User</th>
              <th className="label-caps text-text-muted py-2.5 px-4">Role</th>
              <th className="label-caps text-text-muted py-2.5 px-4">Action</th>
              <th className="label-caps text-text-muted py-2.5 px-4">Entity</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="border-b border-border/50 last:border-0 hover:bg-surface-hover transition-colors">
                <td className="py-3 px-4 font-mono text-xs text-text-muted whitespace-nowrap">{l.time}</td>
                <td className="py-3 px-4 text-sm text-text">{l.user}</td>
                <td className="py-3 px-4 text-xs text-text-muted">{l.role}</td>
                <td className="py-3 px-4 text-sm text-text">{l.action}</td>
                <td className="py-3 px-4">
                  <span className="label-caps text-text-muted border border-border px-1.5 py-0.5 rounded">{l.entityType}</span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-sm text-text-muted">No log entries match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- Screen ---------- */

export default function LogsNotifications({ initialTab = "Notifications" }: { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const unreadCount = initialNotifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-4">
      <div className="border-b border-border flex gap-6">
        {tabs.map((t) => {
          const Icon = t === "Notifications" ? Bell : FileClock;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 pb-2.5 text-sm border-b-2 transition-colors ${
                tab === t ? "border-amber text-text" : "border-transparent text-text-muted hover:text-text"
              }`}
            >
              <Icon size={14} strokeWidth={1.5} />
              {t}
              {t === "Notifications" && unreadCount > 0 && (
                <span className="font-mono text-xs bg-amber/10 text-amber border border-amber/30 rounded px-1.5 py-0.5">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tab === "Notifications" ? <NotificationsPanel /> : <ActivityLogPanel />}
    </div>
  );
}