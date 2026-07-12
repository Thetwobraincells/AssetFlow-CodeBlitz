import { ReactNode, useState } from "react";
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
  onLogout,
}: {
  children: ReactNode;
  onLogout?: () => void;
}) {
  const [active, setActive] = useState("dashboard");

  return (
    <div className="flex bg-bg min-h-screen">
      <Sidebar active={active} onSelect={setActive} />
      <div className="flex-1 flex flex-col">
        <Topbar title={titles[active]} onLogout={onLogout} />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}