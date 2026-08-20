import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar.jsx";
import ContinentsDashboardPage from "./pages/ContinentsDashboardPage.jsx";
import CountryExplorerPage from "./pages/CountryExplorerPage.jsx";
import CountryDetailPage from "./pages/CountryDetailPage.jsx";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#f7fafc] text-[#171c29] flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<ContinentsDashboardPage />} />
            <Route path="/countries" element={<CountryExplorerPage />} />
            <Route path="/countries/:id" element={<CountryDetailPage />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-[#e3e8f0] py-6 text-center text-xs text-[#707a8c]">
          <p>© {new Date().getFullYear()} GeoPortfolio. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}
