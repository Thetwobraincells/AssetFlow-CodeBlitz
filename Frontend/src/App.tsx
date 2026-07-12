import AppShell from "./layouts/AppShell";
import StatusPill from "./components/StatusPill";
import Button from "./components/Button";

function App() {
  return (
    <AppShell>
      {/* Temporary placeholder to sanity-check the shell — replace with real screens */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <StatusPill status="available" label="Available" />
          <StatusPill status="allocated" label="Allocated" />
          <StatusPill status="maintenance" label="Under Maintenance" />
        </div>
        <div className="flex gap-2">
          <Button variant="primary">Register Asset</Button>
          <Button variant="outline">Export</Button>
        </div>
      </div>
    </AppShell>
  );
}

export default App;