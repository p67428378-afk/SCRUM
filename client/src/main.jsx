import React from "react";
import ReactDOM from "react-dom/client";
import DashboardPage from "./pages/DashboardPage.jsx";
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
    // Log error if needed
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-xl mx-auto mt-12 bg-red-50 border border-red-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-red-800 mb-2">
            Something went wrong.
          </h2>
          <p className="text-red-600 mb-4">
            The application encountered an unexpected error.
          </p>
          <pre className="bg-red-100 p-4 rounded text-xs text-red-900 overflow-auto max-h-60">
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
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
      <DashboardPage />
    </ErrorBoundary>
  </React.StrictMode>,
);
