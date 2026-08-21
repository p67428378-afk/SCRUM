import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RecipeCatalog from "./pages/RecipeCatalog";
import RecipeDetail from "./pages/RecipeDetail";
import AddRecipeForm from "./pages/AddRecipeForm";
import Navbar from "./components/Navbar";
import "./index.css";

// Simple About Page
function AboutPage() {
  return (
    <div className="bg-[#f7fafc] min-h-screen flex flex-col gap-[24px] items-start p-[32px] relative w-full">
      <Navbar />
      <div className="bg-white border border-[#e3e8f0] border-solid content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[24px] relative rounded-[14px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] shrink-0 w-full">
        <h2 className="[word-break:break-word] font-bold leading-[normal] not-italic relative shrink-0 text-[#171c29] text-[24px]">
          About CulinaryShare
        </h2>
        <p className="[word-break:break-word] font-normal leading-relaxed text-[#171c29] text-[14px]">
          CulinaryShare is a centralized platform designed for food enthusiasts
          and home cooks to view, add, and remove food recipes. Easily discover
          new dishes, share your own culinary creations, and manage your
          personal recipe collection.
        </p>
      </div>
    </div>
  );
}

// Mandatory Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error in React tree:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
          <h2 style={{ color: "#db2626" }}>Something went wrong.</h2>
          <p>Please refresh the page or check the console for details.</p>
          <a href="/" style={{ color: "#2663eb", textDecoration: "underline" }}>
            Go back to home
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RecipeCatalog />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/add-recipe" element={<AddRecipeForm />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </BrowserRouter>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  );
}
