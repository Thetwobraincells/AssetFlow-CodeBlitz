import { useState } from "react";
import AppShell from "./layouts/AppShell";
import Dashboard from "./screens/Dashboard";
import AssetDirectory from "./screens/AssetDirectory";
import AssetDetail from "./screens/AssetDetail";
import Allocations from "./screens/Allocations";
import Bookings from "./screens/Bookings";
import Maintenance from "./screens/Maintenance";
import Audits from "./screens/Audits";
import OrgSetup from "./screens/OrgSetup";
import LogsNotifications from "./screens/LogsNotifications";
import Reports from "./screens/Reports";
import Login from "./screens/Login";

function App() {
  const [isLoggedIn, setIsLoggedIn]     = useState(false);
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const [detailId, setDetailId]       = useState<string | null>(null);

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  function openDetail(id: string) {
    setDetailId(id);
    setActiveScreen("asset-detail");
  }

  function closeDetail() {
    setDetailId(null);
    setActiveScreen("assets");
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case "assets":
        return <AssetDirectory onOpenDetail={openDetail} />;
      case "asset-detail":
        return detailId ? <AssetDetail id={detailId} onBack={closeDetail} /> : <AssetDirectory onOpenDetail={openDetail} />;
      case "allocations":   return <Allocations />;
      case "bookings":      return <Bookings />;
      case "maintenance":   return <Maintenance />;
      case "audits":        return <Audits />;
      case "org-setup":     return <OrgSetup />;
      case "reports":       return <Reports />;
      case "notifications": return <LogsNotifications key="notifications" initialTab="Notifications" />;
      case "logs":          return <LogsNotifications key="logs" initialTab="Activity Log" />;
      case "dashboard":
      default:              return <Dashboard onNavigate={handleNavSelect} />;
    }
  };

  function handleNavSelect(screen: string) {
    // Clear detail context when navigating away
    if (screen !== "asset-detail") setDetailId(null);
    setActiveScreen(screen);
  }

  return (
    <AppShell
      active={activeScreen === "asset-detail" ? "assets" : activeScreen}
      onSelect={handleNavSelect}
      onLogout={() => setIsLoggedIn(false)}
    >
      {renderScreen()}
    </AppShell>
  );
}

export default App;