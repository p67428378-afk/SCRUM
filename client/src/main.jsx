import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
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
    console.error("Unhandled React Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center text-red-400 bg-slate-800 rounded-lg m-4 border border-red-500/30">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-slate-300 text-sm mb-4">
            {this.state.error?.message ||
              "An unexpected application error occurred."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-500 transition-colors"
          >
            Reload Page
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
        <AppLayout />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
