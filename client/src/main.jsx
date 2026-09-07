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
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0B1326] text-[#DAE2FD] p-8 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            Something went wrong.
          </h1>
          <p className="text-[#BBC9CF] mb-4">{this.state.error?.toString()}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#00D1FF] text-black rounded hover:bg-[#4CDEFF] transition font-medium"
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
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
