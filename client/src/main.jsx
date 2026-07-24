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
    console.error("Uncaught error in React tree:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-on-surface p-6">
          <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl p-8 text-center space-y-4 shadow-2xl">
            <span className="material-symbols-outlined text-red-400 text-5xl">
              error
            </span>
            <h2 className="text-xl font-bold text-on-surface">
              Something went wrong
            </h2>
            <p className="text-sm text-on-surface-variant">
              An unexpected error occurred. Please try refreshing the page or
              contact support if the issue persists.
            </p>
            {this.state.error && (
              <pre className="text-xs text-red-400 bg-slate-950 p-4 rounded-lg overflow-x-auto text-left font-mono">
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2.5 rounded-lg transition-colors"
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

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );
}
