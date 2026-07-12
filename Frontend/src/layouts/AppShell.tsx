import type { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

const titles: Record<string, string> = {
  dashboard: "Dashboard",
  assets: "Asset Directory",
  allocations: "Allocations & Transfers",
  bookings: "Resource Booking",
  maintenance: "Maintenance",
  audits: "Audit Cycles",
  reports: "Reports & Analytics",
  "org-setup": "Organization Setup",
  notifications: "Notifications",
  logs: "Activity Logs",
};

export default function AppShell({
  children,
  active,
  onSelect,
  onLogout,
}: {
  children: ReactNode;
  active: string;
  onSelect: (key: string) => void;
  onLogout?: () => void;
}) {
  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar active={active} onSelect={onSelect} />
      <div className="flex-1 flex flex-col">
        <Topbar title={titles[active]} onLogout={onLogout} onBellClick={() => onSelect("notifications")} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}