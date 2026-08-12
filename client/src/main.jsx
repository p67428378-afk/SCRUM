import React, { Component } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import Navbar from "./components/layout/Navbar";
import TaskDashboardPage from "./pages/TaskDashboardPage";
import LiveTaskMonitorPage from "./pages/LiveTaskMonitorPage";
import TaskHistoryPage from "./pages/TaskHistoryPage";
import { useTaskTracker } from "./hooks/useTaskTracker";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught React error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            fontFamily: "sans-serif",
          }}
        >
          <h2 style={{ color: "#db2626" }}>Something went wrong.</h2>
          <p style={{ fontSize: "0.875rem", color: "#4b5563" }}>
            {this.state.error?.toString() ||
              "Check developer console for details."}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              background: "#2663eb",
              color: "#fff",
              border: "none",
              borderRadius: "0.375rem",
              cursor: "pointer",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const taskTracker = useTaskTracker();

  return (
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <Navbar
        wsConnected={taskTracker.wsConnected}
        connectionMode={taskTracker.connectionMode}
        user={{ email: "test@example.com" }}
      />
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/tasks" replace />} />
          <Route
            path="/tasks"
            element={<TaskDashboardPage taskTracker={taskTracker} />}
          />
          <Route
            path="/tasks/monitor"
            element={<LiveTaskMonitorPage taskTracker={taskTracker} />}
          />
          <Route path="/tasks/history" element={<TaskHistoryPage />} />
          <Route path="*" element={<Navigate to="/tasks" replace />} />
        </Routes>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
