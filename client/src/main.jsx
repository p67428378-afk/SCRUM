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
    console.error("Uncaught React Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "2rem",
            color: "#ffb4ab",
            backgroundColor: "#0b0e13",
            minHeight: "100vh",
            fontFamily: "sans-serif",
          }}
        >
          <h2>Something went wrong rendering the Actor Portfolio.</h2>
          <p style={{ color: "#d0c5af", fontSize: "0.9rem" }}>
            Please check browser console logs or return to the main dashboard.
          </p>
          <button
            onClick={() => (window.location.href = "/dashboard")}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#f2ca50",
              color: "#0b0e13",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Go to Dashboard
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
