import { useState } from "react";
import { Package, Laptop, Car, DoorOpen } from "lucide-react";
import Button from "../components/Button";

const DEMO_EMAIL = "admin@assetflow.io";
const DEMO_PASSWORD = "demo1234";

type Mode = "login" | "signup";

export default function Login({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    // Dummy auth check — no backend wired yet.
    // Swap this block for a real API call once auth endpoint exists.
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      setError("");
      onLoginSuccess();
    } else {
      setError("Invalid credentials. Try the demo account below.");
    }
  }

  function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    // Dummy signup — always creates an Employee account, no role field exists.
    setError("");
    onLoginSuccess();
  }

  function fillDemoCreds() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  }

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Left hero panel */}
      <div className="hidden md:flex md:w-[55%] relative overflow-hidden bg-surface-low border-r border-border items-center justify-center p-12">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-text) 1px, transparent 1px), linear-gradient(90deg, var(--color-text) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-md bg-amber flex items-center justify-center">
              <Package size={18} className="text-bg" />
            </div>
            <span className="text-lg font-semibold text-text">AssetFlow</span>
          </div>
          <h1 className="text-2xl font-semibold text-text mb-2">
            Track every asset. Zero spreadsheets.
          </h1>
          <p className="text-sm text-text-muted mb-10">
            Centralized allocation, booking, and maintenance for every physical
            asset your org owns.
          </p>
          <div className="flex gap-8 text-text-muted">
            <Laptop size={28} strokeWidth={1.2} />
            <Car size={28} strokeWidth={1.2} />
            <DoorOpen size={28} strokeWidth={1.2} />
            <Package size={28} strokeWidth={1.2} />
          </div>
        </div>
      </div>

      {/* Right auth form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h2 className="text-xl font-semibold text-text mb-1">
            {mode === "login" ? "Log in" : "Create account"}
          </h2>
          <p className="text-sm text-text-muted mb-6">
            {mode === "login"
              ? "Welcome back to AssetFlow."
              : "Signup creates an Employee account. Admins grant role upgrades later."}
          </p>

          <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="label-caps text-text-muted block mb-1.5">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-amber focus:border-amber"
                  placeholder="Priya Shah"
                  required
                />
              </div>
            )}

            <div>
              <label className="label-caps text-text-muted block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-amber focus:border-amber"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label className="label-caps text-text-muted block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-amber focus:border-amber"
                placeholder="••••••••"
                required
              />
            </div>

            {mode === "signup" && (
              <div>
                <label className="label-caps text-text-muted block mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:ring-1 focus:ring-amber focus:border-amber"
                  placeholder="••••••••"
                  required
                />
              </div>
            )}

            {mode === "login" && (
              <div className="flex justify-end">
                <button type="button" className="text-xs text-amber hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            {error && <p className="text-xs text-red">{error}</p>}

            <Button variant="primary" type="submit" className="w-full">
              {mode === "login" ? "Log in" : "Create account"}
            </Button>
          </form>

          {mode === "login" && (
            <div className="mt-4 p-3 bg-surface border border-border rounded-md">
              <p className="text-xs text-text-muted mb-1">Demo credentials (no backend yet):</p>
              <p className="font-mono text-xs text-amber">{DEMO_EMAIL} / {DEMO_PASSWORD}</p>
              <button
                type="button"
                onClick={fillDemoCreds}
                className="text-xs text-teal hover:underline mt-1"
              >
                Autofill
              </button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-border text-center text-sm text-text-muted">
            {mode === "login" ? (
              <>
                New here?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("signup"); setError(""); }}
                  className="text-amber hover:underline"
                >
                  Create an Employee account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(""); }}
                  className="text-amber hover:underline"
                >
                  Log in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}