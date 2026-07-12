import { useState } from "react";
import AppShell from "./layouts/AppShell";
import Dashboard from "./screens/Dashboard";
import Login from "./screens/Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <AppShell onLogout={() => setIsLoggedIn(false)}>
      <Dashboard />
    </AppShell>
  );
}

export default App;