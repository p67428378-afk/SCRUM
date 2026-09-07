import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import DashboardPage from "./pages/DashboardPage";
import LocationsPage from "./pages/LocationsPage";
import ForecastsPage from "./pages/ForecastsPage";
import AlertsPage from "./pages/AlertsPage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0B1326] text-[#DAE2FD] flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/forecasts" element={<ForecastsPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
        <footer className="bg-[#171F33] border-t border-[#3C494E] py-4 text-center text-xs font-mono text-[#BBC9CF]">
          WeatherPulse Management System &copy; {new Date().getFullYear()} —
          Operational Telemetry Network
        </footer>
      </div>
    </Router>
  );
}
