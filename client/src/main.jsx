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
    console.error("Uncaught error in frontend:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "2rem",
            color: "#ffb4ab",
            backgroundColor: "#101415",
            minHeight: "100vh",
          }}
        >
          <h2 style={{ fontSize: "24px", marginBottom: "1rem" }}>
            Something went wrong.
          </h2>
          <p style={{ color: "#e0e3e5" }}>
            Check the console for details or try reloading the page.
          </p>
          <pre
            style={{
              marginTop: "1rem",
              padding: "1rem",
              backgroundColor: "#1d2022",
              borderRadius: "4px",
              overflowX: "auto",
            }}
          >
            {this.state.error?.toString()}
          </pre>
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
