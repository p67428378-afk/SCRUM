import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";
import Dashboard from "./components/Dashboard";
import ZoneMetrics from "./components/ZoneMetrics";
import ServiceRequests from "./components/ServiceRequests";
import CitizenPortal from "./components/CitizenPortal";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 font-sans">
        {/* Unified Navbar */}
        <header className="bg-slate-900 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow">
                CMP
              </div>
              <h1 className="text-xl font-bold tracking-tight">
                City Management Portal
              </h1>
            </div>

            <nav className="flex items-center gap-6 text-sm font-medium">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  isActive
                    ? "text-indigo-400 font-bold border-b-2 border-indigo-400 pb-1"
                    : "text-slate-300 hover:text-white transition"
                }
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/zones"
                className={({ isActive }) =>
                  isActive
                    ? "text-indigo-400 font-bold border-b-2 border-indigo-400 pb-1"
                    : "text-slate-300 hover:text-white transition"
                }
              >
                Zones & Utilities
              </NavLink>

              <NavLink
                to="/service-requests"
                className={({ isActive }) =>
                  isActive
                    ? "text-indigo-400 font-bold border-b-2 border-indigo-400 pb-1"
                    : "text-slate-300 hover:text-white transition"
                }
              >
                Service Requests
              </NavLink>

              <NavLink
                to="/citizens"
                className={({ isActive }) =>
                  isActive
                    ? "text-indigo-400 font-bold border-b-2 border-indigo-400 pb-1"
                    : "text-slate-300 hover:text-white transition"
                }
              >
                Citizen Portal
              </NavLink>
            </nav>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/zones" element={<ZoneMetrics />} />
            <Route path="/service-requests" element={<ServiceRequests />} />
            <Route path="/citizens" element={<CitizenPortal />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
