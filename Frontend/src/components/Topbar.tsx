import { Search, Bell, LogOut } from "lucide-react";

const roleColors: Record<string, string> = {
  Admin: "bg-amber/10 text-amber border-amber/30",
  "Asset Manager": "bg-teal/10 text-teal border-teal/30",
  "Department Head": "bg-blue/10 text-blue border-blue/30",
  Employee: "bg-slate/10 text-slate border-slate/30",
};

export default function Topbar({
  title,
  role = "Employee",
  userName = "Shivam",
  onLogout,
  onBellClick,
}: {
  title: string;
  role?: string;
  userName?: string;
  onLogout?: () => void;
  onBellClick?: () => void;
}) {
  return (
    <header className="h-16 border-b border-border bg-bg flex items-center justify-between px-6 shrink-0">
      <h1 className="text-sm font-medium text-text">{title}</h1>

      <div className="flex-1 max-w-md mx-6 relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          placeholder="Search assets, tags, employees..."
          className="w-full bg-surface border border-border rounded-md pl-8 pr-3 py-1.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-amber/40"
        />
      </div>

      <div className="flex items-center gap-4">
        <button onClick={onBellClick} className="relative text-text-muted hover:text-text" title="Notifications">
          <Bell size={18} strokeWidth={1.5} />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber border border-bg" />
        </button>
        <span className={`text-xs px-2 py-1 rounded border font-mono ${roleColors[role]}`}>
          {role}
        </span>
        <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-xs font-medium">
          {userName[0]}
        </div>
        <button
          onClick={onLogout}
          className="text-text-muted hover:text-red transition-colors"
          title="Log out"
        >
          <LogOut size={18} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}