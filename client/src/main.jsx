import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
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
    console.error("Uncaught React Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#12121c] text-[#f5f5fa] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-[#1f1f2e] border border-[#db2626] rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-[#db2626] mb-4">
              Something went wrong
            </h2>
            <p className="text-[#9ea3b8] text-sm mb-6">
              An unexpected error occurred while rendering this page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#7a3bed] hover:bg-[#682bd6] text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
            >
              Reload Page
            </button>
          </div>
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
