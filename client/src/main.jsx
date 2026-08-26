import React from "react";
import ReactDOM from "react-dom/client";
import PropTypes from "prop-types";
import App from "./App.jsx";
import "./index.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error ? error.message : "Unknown error",
    };
  }

  componentDidCatch(_error, _errorInfo) {
    // Handled by ErrorBoundary state
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#F7FAFC] p-6 text-center">
          <div className="max-w-md rounded-xl bg-white p-8 shadow-lg border border-red-100">
            <h2 className="text-xl font-bold text-[#DB2626] mb-3">
              Something went wrong
            </h2>
            <p className="text-sm text-[#707A8C] mb-4">
              An unexpected error occurred while rendering the application.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#2663EB] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
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

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
