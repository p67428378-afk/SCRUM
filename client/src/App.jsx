import React, { useState, useEffect } from "react";
import DashboardPage from "./pages/DashboardPage";
import ConfigurePaymentPage from "./pages/ConfigurePaymentPage";
import { authService } from "./services/api";

// Simple Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-md mx-auto mt-20 bg-error/10 border border-error/20 rounded-xl text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-error">
            error
          </span>
          <h2 className="text-xl font-bold text-on-surface">
            Something went wrong.
          </h2>
          <p className="text-on-surface-variant text-sm">
            Please refresh the page or check the console for details.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition-all"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    authService.isAuthenticated(),
  );
  const [currentPage, setCurrentPage] = useState("dashboard"); // 'dashboard' | 'configure'
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("testpassword");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      if (isRegister) {
        await authService.register({ email, name, password });
        setIsRegister(false);
        setAuthError("Registration successful! Please log in.");
      } else {
        await authService.login({ email, password });
        setIsAuthenticated(true);
      }
    } catch (err) {
      setAuthError(err.response?.data?.detail || "Authentication failed.");
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentPage("dashboard");
    setEditingSchedule(null);
  };

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="w-full max-w-md bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <span
                className="material-symbols-outlined text-primary text-5xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                account_balance
              </span>
              <h1 className="text-2xl font-bold text-on-surface">
                Welcome to ApexBank
              </h1>
              <p className="text-on-surface-variant text-sm">
                {isRegister
                  ? "Create your retail banking account"
                  : "Sign in to manage your recurring payments"}
              </p>
            </div>

            {authError && (
              <div
                className="p-4 bg-error/10 text-error text-xs rounded-xl border border-error/20"
                role="alert"
              >
                {authError}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-xs font-bold text-outline uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full p-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="w-full p-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-outline uppercase mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 bg-surface border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-all text-sm"
              >
                {isRegister ? "Register" : "Sign In"}
              </button>
            </form>

            <div className="text-center text-xs text-on-surface-variant space-y-2">
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setAuthError("");
                }}
                className="text-primary font-bold hover:underline"
              >
                {isRegister
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Register"}
              </button>
              {!isRegister && (
                <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/50 mt-4">
                  <p className="font-bold text-on-surface mb-1">
                    Test Credentials:
                  </p>
                  <p>
                    Email:{" "}
                    <code className="font-mono bg-white px-1 rounded">
                      test@example.com
                    </code>
                  </p>
                  <p>
                    Password:{" "}
                    <code className="font-mono bg-white px-1 rounded">
                      testpassword
                    </code>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-on-surface font-sans overflow-x-hidden">
        {/* Sidebar Section */}
        <aside className="fixed left-0 top-0 h-full w-[280px] bg-[#0F172A] border-r border-outline-variant flex flex-col py-6 z-50">
          <div className="px-8 mb-10 flex items-center gap-3">
            <span
              className="material-symbols-outlined text-primary text-headline-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              account_balance
            </span>
            <span className="text-headline-lg font-headline-lg font-bold text-primary">
              ApexBank
            </span>
          </div>
          <nav className="flex-1 space-y-1">
            <a
              className="flex items-center gap-3 px-6 py-3 text-[#94A3B8] hover:bg-white/5 hover:text-white transition-colors font-label-md"
              href="#"
            >
              <span className="material-symbols-outlined">dashboard</span>
              Dashboard
            </a>
            <a
              className="flex items-center gap-3 px-6 py-3 text-[#94A3B8] hover:bg-white/5 hover:text-white transition-colors font-label-md"
              href="#"
            >
              <span className="material-symbols-outlined">
                account_balance_wallet
              </span>
              Accounts
            </a>
            <a
              className="flex items-center gap-3 px-6 py-3 border-l-4 border-primary bg-primary/10 text-on-primary-fixed font-label-md"
              href="#"
            >
              <span className="material-symbols-outlined">event_repeat</span>
              Recurring Payments
            </a>
          </nav>
          <div className="mt-auto px-6 space-y-4">
            <div className="pt-6 border-t border-white/10 flex items-center gap-3 px-2">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                AM
              </div>
              <div className="flex flex-col">
                <span className="text-white font-label-md font-bold">
                  Alex Mercer
                </span>
                <span className="text-[#94A3B8] text-[10px] uppercase tracking-widest font-semibold">
                  Premium Member
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Top Header Navigation */}
        <header className="fixed top-0 right-0 w-[calc(100%-280px)] h-16 bg-surface border-b border-outline-variant flex justify-between items-center px-8 z-40">
          <div className="relative w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-body-md"
              placeholder="Search payments, accounts..."
              type="text"
            />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="ml-[280px] pt-24 pb-12 px-8 min-h-screen">
          {currentPage === "dashboard" ? (
            <DashboardPage
              onCreateNew={() => {
                setEditingSchedule(null);
                setCurrentPage("configure");
              }}
              onEdit={(schedule) => {
                setEditingSchedule(schedule);
                setCurrentPage("configure");
              }}
              onLogout={handleLogout}
            />
          ) : (
            <ConfigurePaymentPage
              initialSchedule={editingSchedule}
              onSave={() => {
                setCurrentPage("dashboard");
                setEditingSchedule(null);
              }}
              onCancel={() => {
                setCurrentPage("dashboard");
                setEditingSchedule(null);
              }}
            />
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
