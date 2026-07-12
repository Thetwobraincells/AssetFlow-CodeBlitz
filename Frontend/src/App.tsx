import { useState } from "react";
import AppShell from "./layouts/AppShell";
import Dashboard from "./screens/Dashboard";
import AssetDirectory from "./screens/AssetDirectory";
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
      case "assets":
        return <AssetDirectory />;
      case "notifications":
        return <LogsNotifications key={activeScreen} initialTab="Notifications" />;
      case "logs":
        return <LogsNotifications key={activeScreen} initialTab="Activity Log" />;
      case "reports":
        return <Reports />;
      case "dashboard":
      default:
        return <Dashboard />;
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