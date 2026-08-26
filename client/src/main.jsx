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
    // Log or capture error if needed
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5] p-6">
          <div className="bg-white border border-[#E0E3DE] rounded-2xl p-8 max-w-md text-center shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-[#1F2624]">
              Something went wrong
            </h2>
            <p className="text-xs text-[#737A75]">
              An unexpected interface error occurred.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = "/";
              }}
              className="px-4 py-2 bg-[#2E4F3D] text-white text-xs font-semibold rounded-lg hover:bg-[#243E30] transition-colors"
            >
              Return to Catalog
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
