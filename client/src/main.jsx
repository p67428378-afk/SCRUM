import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import ResidentPickupsPage from "./pages/ResidentPickupsPage";
import BinTelemetryPage from "./pages/BinTelemetryPage";
import DriverTasksPage from "./pages/DriverTasksPage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import "./index.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-lg mx-auto mt-12 bg-white rounded-lg border border-red-200 shadow-md">
          <h2 className="text-lg font-bold text-red-700 mb-2">
            Something went wrong
          </h2>
          <p className="text-xs text-slate-600 mb-4">
            {this.state.error?.message ||
              "An unexpected rendering error occurred."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white font-medium text-xs rounded hover:bg-red-700"
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<ResidentPickupsPage />} />
              <Route path="/pickups" element={<ResidentPickupsPage />} />
              <Route path="/bins" element={<BinTelemetryPage />} />
              <Route path="/driver/tasks" element={<DriverTasksPage />} />
              <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
              <Route path="*" element={<Navigate to="/pickups" replace />} />
            </Routes>
          </main>
          <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
            EcoClean Municipal Garbage Management System &copy; 2026. All rights
            reserved.
          </footer>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
