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
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#121414] text-white flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-bold text-[#f87171] mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-[#bfc7d1] mb-4">
            An unexpected error occurred while rendering the application.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#1a98ff] text-white rounded font-medium hover:bg-[#a1c9ff] hover:text-[#121414] transition"
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
