import { useState } from "react";
import AppShell from "./layouts/AppShell";
import Dashboard from "./screens/Dashboard";
import AssetDirectory from "./screens/AssetDirectory";
import Allocations from "./screens/Allocations";
import Bookings from "./screens/Bookings";
import Maintenance from "./screens/Maintenance";
import Audits from "./screens/Audits";
import OrgSetup from "./screens/OrgSetup";
import LogsNotifications from "./screens/LogsNotifications";
import Reports from "./screens/Reports";
import Login from "./screens/Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeScreen, setActiveScreen] = useState("dashboard");

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case "assets":        return <AssetDirectory />;
      case "allocations":   return <Allocations />;
      case "bookings":      return <Bookings />;
      case "maintenance":   return <Maintenance />;
      case "audits":        return <Audits />;
      case "org-setup":     return <OrgSetup />;
      case "reports":       return <Reports />;
      case "notifications": return <LogsNotifications key="notifications" initialTab="Notifications" />;
      case "logs":          return <LogsNotifications key="logs" initialTab="Activity Log" />;
      case "dashboard":
      default:              return <Dashboard />;
    }
  };

  return (
    <AppShell
      active={activeScreen}
      onSelect={setActiveScreen}
      onLogout={() => setIsLoggedIn(false)}
    >
      {renderScreen()}
    </AppShell>
  );
}

export default App;