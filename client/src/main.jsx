import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
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
    console.error("Uncaught render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0E17] text-[#F9FAFB] flex flex-col items-center justify-center p-6 text-center">
          <h2 className="font-serif text-3xl font-bold text-[#F59E0B] mb-4">
            Something went wrong
          </h2>
          <p className="text-[#9CA3AF] max-w-md mb-6">
            {" "}
            An unexpected error occurred while rendering this page. Please try
            refreshing.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#F59E0B] text-[#0A0E17] px-6 py-2 rounded-md font-semibold hover:bg-[#D97706] transition-colors"
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
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
