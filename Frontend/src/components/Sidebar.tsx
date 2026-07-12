import {
  LayoutDashboard, Package, ArrowLeftRight, CalendarClock,
  Wrench, ClipboardCheck, BarChart3, Settings, Bell, FileClock,
} from "lucide-react";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "assets", label: "Assets", icon: Package },
  { key: "allocations", label: "Allocations", icon: ArrowLeftRight },
  { key: "bookings", label: "Bookings", icon: CalendarClock },
  { key: "maintenance", label: "Maintenance", icon: Wrench },
  { key: "audits", label: "Audits", icon: ClipboardCheck },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "org-setup", label: "Org Setup", icon: Settings },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "logs", label: "Logs", icon: FileClock },
];

export default function Sidebar({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (key: string) => void;
}) {
  return (
    <aside className="w-60 h-screen bg-surface border-r border-border flex flex-col shrink-0">
      <div className="h-16 flex items-center gap-2 px-5 border-b border-border">
        <div className="w-6 h-6 bg-amber rounded-sm" />
        <span className="font-semibold text-text">AssetFlow</span>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map(({ key, label, icon: Icon }) => {
          const isActive = active === key;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm border-l-2 transition-colors ${
                isActive
                  ? "border-amber bg-amber/5 text-text"
                  : "border-transparent text-text-muted hover:text-text hover:bg-surface-hover"
              }`}
            >
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}