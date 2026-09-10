import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import TopNavbar from "./components/layout/TopNavbar";
import DashboardPage from "./pages/DashboardPage";
import FieldsPage from "./pages/FieldsPage";
import LivestockPage from "./pages/LivestockPage";
import EquipmentPage from "./pages/EquipmentPage";
import InventoryPage from "./pages/InventoryPage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <TopNavbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/fields" element={<FieldsPage />} />
            <Route path="/livestock" element={<LivestockPage />} />
            <Route path="/equipment" element={<EquipmentPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 font-medium">
            AgriCore Farm Operations Management & System Tracking &copy;{" "}
            {new Date().getFullYear()}
          </div>
        </footer>
      </div>
    </Router>
  );
}
