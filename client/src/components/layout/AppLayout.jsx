import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { authService } from "../../services/api";

export const AppLayout = ({ children }) => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }

    const handleAuthExpired = () => {
      navigate("/login");
    };

    window.addEventListener("auth-expired", handleAuthExpired);
    return () => {
      window.removeEventListener("auth-expired", handleAuthExpired);
    };
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="flex h-screen bg-slate-900 text-on-surface overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
