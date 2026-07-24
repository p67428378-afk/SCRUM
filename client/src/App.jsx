import React, { useState, useEffect, useRef } from "react";
import LoginPage from "./pages/LoginPage";
import MFAVerificationPage from "./pages/MFAVerificationPage";
import RegistrationPage from "./pages/RegistrationPage";
import PasswordRecoveryPage from "./pages/PasswordRecoveryPage";
import { authService } from "./services/api";

const App = () => {
  const [page, setPage] = useState("login"); // 'login', 'mfa', 'register', 'recover', 'dashboard'
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds warning

  const activityTimeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // 15 minutes inactivity limit (14 minutes active + 1 minute warning)
  const INACTIVITY_LIMIT = 14 * 60 * 1000;
  const WARNING_LIMIT = 1 * 60 * 1000;

  const resetInactivityTimer = () => {
    if (page !== "dashboard") return;

    // Clear existing timeouts
    if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current);

    setShowTimeoutWarning(false);
    setTimeLeft(60);

    // Set timeout for warning (14 minutes)
    activityTimeoutRef.current = setTimeout(() => {
      setShowTimeoutWarning(true);
      startCountdown();
    }, INACTIVITY_LIMIT);

    // Set timeout for auto-logout (15 minutes total)
    warningTimeoutRef.current = setTimeout(() => {
      handleLogout();
    }, INACTIVITY_LIMIT + WARNING_LIMIT);
  };

  const startCountdown = () => {
    countdownIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleKeepSessionAlive = async () => {
    try {
      // Call getSession to refresh activity on backend
      const data = await authService.getSession();
      setSessionInfo(data);
      resetInactivityTimer();
    } catch (err) {
      handleLogout();
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setUser(null);
      setSessionInfo(null);
      setPage("login");
      setShowTimeoutWarning(false);
      if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    }
  };

  // Listen for user activity to reset timer
  useEffect(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    const handleActivity = () => resetInactivityTimer();

    if (page === "dashboard") {
      events.forEach((event) => window.addEventListener(event, handleActivity));
      resetInactivityTimer();
    }

    return () => {
      events.forEach((event) =>
        window.removeEventListener(event, handleActivity),
      );
      if (activityTimeoutRef.current) clearTimeout(activityTimeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, [page]);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("access_token");
      if (storedUser && token) {
        try {
          setUser(JSON.parse(storedUser));
          const data = await authService.getSession();
          setSessionInfo(data);
          setPage("dashboard");
        } catch (err) {
          handleLogout();
        }
      }
    };
    checkAuth();

    const handleAuthChange = () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setUser(null);
        setSessionInfo(null);
        setPage("login");
      }
    };
    window.addEventListener("auth-change", handleAuthChange);
    return () => window.removeEventListener("auth-change", handleAuthChange);
  }, []);

  const handleLoginSuccess = (id, userNm) => {
    setUserId(id);
    setUsername(userNm);
    setPage("mfa");
  };

  const handleMFAVerificationSuccess = async (data) => {
    setUser(data.user);
    try {
      const sessionData = await authService.getSession();
      setSessionInfo(sessionData);
    } catch (err) {
      console.error("Failed to fetch session info", err);
    }
    setPage("dashboard");
  };

  return (
    <div className="min-h-screen bg-surface-bright text-on-surface flex flex-col w-full">
      {page === "login" && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={() => setPage("register")}
          onNavigateToRecover={() => setPage("recover")}
        />
      )}

      {page === "mfa" && (
        <MFAVerificationPage
          userId={userId}
          username={username}
          onVerificationSuccess={handleMFAVerificationSuccess}
          onCancel={() => setPage("login")}
        />
      )}

      {page === "register" && (
        <RegistrationPage
          onRegistrationSuccess={() => setPage("login")}
          onNavigateToLogin={() => setPage("login")}
        />
      )}

      {page === "recover" && (
        <PasswordRecoveryPage
          onRecoverySuccess={() => setPage("login")}
          onNavigateToLogin={() => setPage("login")}
        />
      )}

      {page === "dashboard" && user && (
        <div className="flex flex-col min-h-screen w-full">
          {/* Header */}
          <header className="bg-inverse-surface text-inverse-on-surface py-md px-lg flex justify-between items-center shadow-md">
            <div className="flex items-center space-x-md">
              <img
                alt="Apex Bank Logo"
                className="h-10 w-12"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNyoDF3Ka6AHpc-Hw0J-VfanH3duZEPpVn3OICoi_tA0M_QnnA48IUCZDp5WEAGErtTV0OgJpixR_Q683hIjct0_6co-u7H-UdNWQSxIdqvgCYYzKBQJPm9SL4AvohB5SIl9fwI2wwW4O32xQxwtdbI7G8yiTTKVYiVmLVKMp_xtaWHZg8E24LzxZ7GzHJGRYUneGCGQhUKS-sdVYs5kvF9LBLCnaWnXmk6LtQDNAKUyaiFWY5ViFYDPEL8lVz1-aj7LX3_Rul5HG-"
              />
              <span className="font-headline-sm text-headline-sm font-bold">
                Apex Retail Bank
              </span>
            </div>
            <div className="flex items-center space-x-lg">
              <div className="text-right hidden md:block">
                <p className="font-label-md text-label-md">
                  Welcome, {user.username}
                </p>
                <p className="text-xs text-primary-fixed-dim">
                  Last Login:{" "}
                  {sessionInfo?.last_login_at
                    ? new Date(sessionInfo.last_login_at).toLocaleString()
                    : "Just now"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-xs bg-secondary text-on-secondary px-md py-sm rounded hover:bg-on-secondary-container transition-colors font-label-sm text-label-sm"
              >
                <span className="material-symbols-outlined text-sm">
                  logout
                </span>
                <span>Sign Out</span>
              </button>
            </div>
          </header>

          {/* Main Dashboard Content */}
          <main className="flex-1 p-lg max-w-container-max mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-lg">
            {/* Left Column: Account Summary */}
            <div className="lg:col-span-2 space-y-lg">
              <div className="bg-surface-container-lowest p-xl rounded-lg border border-outline-variant shadow-sm">
                <h3 className="font-headline-sm text-headline-sm text-primary mb-md flex items-center">
                  <span className="material-symbols-outlined mr-sm text-secondary">
                    account_balance_wallet
                  </span>
                  Account Summary
                </h3>
                <div className="space-y-md">
                  <div className="p-md bg-surface-container rounded border border-outline-variant flex justify-between items-center">
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">
                        Apex Checking Account
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        Account Number: *******89
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-headline-sm text-headline-sm text-secondary">
                        $12,450.82
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        Available Balance
                      </p>
                    </div>
                  </div>
                  <div className="p-md bg-surface-container rounded border border-outline-variant flex justify-between items-center">
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">
                        Apex High-Yield Savings
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        Account Number: *******42
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-headline-sm text-headline-sm text-secondary">
                        $84,120.15
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        Available Balance
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div className="bg-surface-container-lowest p-xl rounded-lg border border-outline-variant shadow-sm">
                <h3 className="font-headline-sm text-headline-sm text-primary mb-md flex items-center">
                  <span className="material-symbols-outlined mr-sm text-secondary">
                    history
                  </span>
                  Recent Transactions
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant text-label-sm text-on-surface-variant">
                        <th className="py-sm">Date</th>
                        <th className="py-sm">Description</th>
                        <th className="py-sm">Category</th>
                        <th className="py-sm text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="font-body-sm text-body-sm divide-y divide-outline-variant">
                      <tr>
                        <td className="py-md">May 24, 2026</td>
                        <td className="py-md font-medium">
                          Payroll Direct Deposit
                        </td>
                        <td className="py-md text-on-surface-variant">
                          Income
                        </td>
                        <td className="py-md text-right text-secondary font-semibold">
                          +$4,250.00
                        </td>
                      </tr>
                      <tr>
                        <td className="py-md">May 23, 2026</td>
                        <td className="py-md font-medium">
                          Whole Foods Market
                        </td>
                        <td className="py-md text-on-surface-variant">
                          Groceries
                        </td>
                        <td className="py-md text-right text-error font-semibold">
                          -$142.18
                        </td>
                      </tr>
                      <tr>
                        <td className="py-md">May 22, 2026</td>
                        <td className="py-md font-medium">Starbucks Coffee</td>
                        <td className="py-md text-on-surface-variant">
                          Dining
                        </td>
                        <td className="py-md text-right text-error font-semibold">
                          -$12.45
                        </td>
                      </tr>
                      <tr>
                        <td className="py-md">May 20, 2026</td>
                        <td className="py-md font-medium">
                          Online Transfer to Savings
                        </td>
                        <td className="py-md text-on-surface-variant">
                          Transfer
                        </td>
                        <td className="py-md text-right text-error font-semibold">
                          -$500.00
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column: Security & Alerts */}
            <div className="space-y-lg">
              <div className="bg-surface-container-lowest p-xl rounded-lg border border-outline-variant shadow-sm">
                <h3 className="font-headline-sm text-headline-sm text-primary mb-md flex items-center">
                  <span className="material-symbols-outlined mr-sm text-secondary">
                    security
                  </span>
                  Security &amp; Compliance
                </h3>
                <div className="space-y-md font-body-sm text-body-sm text-on-surface-variant">
                  <div className="flex items-start space-x-sm">
                    <span className="material-symbols-outlined text-secondary flex-shrink-0">
                      verified_user
                    </span>
                    <div>
                      <p className="font-semibold text-on-surface">
                        FFIEC &amp; GLBA Compliant
                      </p>
                      <p>
                        Your session is fully encrypted and monitored for
                        suspicious activity.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-sm">
                    <span className="material-symbols-outlined text-secondary flex-shrink-0">
                      lock
                    </span>
                    <div>
                      <p className="font-semibold text-on-surface">
                        AES-256 Encryption
                      </p>
                      <p>
                        All data at rest and in transit is protected using
                        industry-standard cryptography.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-xl rounded-lg border border-outline-variant shadow-sm">
                <h3 className="font-headline-sm text-headline-sm text-primary mb-md flex items-center">
                  <span className="material-symbols-outlined mr-sm text-secondary">
                    notifications
                  </span>
                  Configurable Alerts
                </h3>
                <div className="space-y-md font-body-sm text-body-sm">
                  <div className="flex items-center justify-between">
                    <span>Large Transaction Alerts (&gt; $500)</span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="text-secondary focus:ring-secondary rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Low Balance Alert (&lt; $100)</span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="text-secondary focus:ring-secondary rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Weekly Account Summary</span>
                    <input
                      type="checkbox"
                      className="text-secondary focus:ring-secondary rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="bg-surface-container py-md text-center text-xs text-on-surface-variant border-t border-outline-variant mt-auto">
            <p>
              © 2026 Apex Retail Bank. All rights reserved. Member FDIC. Equal
              Housing Lender.
            </p>
          </footer>
        </div>
      )}

      {/* Inactivity Timeout Warning Modal */}
      {showTimeoutWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-md">
          <div className="bg-surface-container-lowest p-xl rounded-lg border border-outline-variant max-w-md w-full shadow-2xl text-center">
            <span className="material-symbols-outlined text-error text-3xl mb-sm">
              warning
            </span>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-xs">
              Session Expiring
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg">
              Your session will expire in{" "}
              <span className="font-bold text-error">{timeLeft}</span> seconds
              due to inactivity. Would you like to stay signed in?
            </p>
            <div className="flex space-x-md">
              <button
                onClick={handleLogout}
                className="w-1/2 py-md px-md border border-outline-variant rounded bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-surface-container transition-colors focus:outline-none"
              >
                Sign Out
              </button>
              <button
                onClick={handleKeepSessionAlive}
                className="w-1/2 py-md px-md border border-transparent rounded bg-secondary text-on-secondary font-label-md text-label-md hover:bg-on-secondary-container focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition-colors"
              >
                Stay Signed In
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
