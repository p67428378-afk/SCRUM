import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import AnalyticsPage from "./pages/AnalyticsPage";
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
    console.error("Unhandled Application Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-lg mx-auto my-12 bg-white border border-[#DC2626]/20 rounded-2xl shadow-lg text-center space-y-4">
          <div className="text-3xl">⚠️</div>
          <h2 className="text-xl font-bold text-[#0F172A]">
            Something went wrong
          </h2>
          <p className="text-xs text-[#707A8C]">
            {this.state.error?.message ||
              "An unexpected rendering error occurred."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#2563EB] text-white text-xs font-semibold rounded-xl"
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
        <AppLayout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
