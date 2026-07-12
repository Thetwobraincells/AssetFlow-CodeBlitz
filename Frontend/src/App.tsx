import { useState } from "react";
import AppShell from "./layouts/AppShell";
import Dashboard from "./screens/Dashboard";
import AssetDirectory from "./screens/AssetDirectory";
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