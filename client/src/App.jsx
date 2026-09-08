import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import TopNavBar from "./components/layout/TopNavBar.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import DirectoryPage from "./pages/DirectoryPage.jsx";
import FacilitiesPage from "./pages/FacilitiesPage.jsx";
import AnnouncementsPage from "./pages/AnnouncementsPage.jsx";
import ServiceRequestsPage from "./pages/ServiceRequestsPage.jsx";
import { getCurrentUser } from "./services/api.js";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await getCurrentUser();
          if (userData) {
            setCurrentUser(userData);
          }
        } catch (err) {
          console.warn("Stored token invalid or expired:", err);
          // Default test resident state if server token check fails locally
          setCurrentUser({
            full_name: "Test Resident",
            email: "test@example.com",
            role: "Resident",
          });
        }
      } else {
        // Default pre-authenticated test account for immediate UI testing
        setCurrentUser({
          full_name: "Test Resident",
          email: "test@example.com",
          role: "Resident",
        });
      }
    }

    checkAuth();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        {/* Top Navigation */}
        <TopNavBar currentUser={currentUser} onUserChange={setCurrentUser} />

        {/* Main Route Content */}
        <main className="flex-1 pb-12">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/directory" element={<DirectoryPage />} />
            <Route path="/facilities" element={<FacilitiesPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/service-requests" element={<ServiceRequestsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 py-6 text-center text-xs border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4">
            <p>
              🏡 <strong>VillageOS</strong> &mdash; Digitized Village Management
              System &bull; Community Operations Platform
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
}
