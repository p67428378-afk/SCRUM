import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CatalogPage from "./pages/CatalogPage";
import TitleDetailPage from "./pages/TitleDetailPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/titles/:id" element={<TitleDetailPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/titles/new" element={<AdminDashboardPage />} />
        <Route path="*" element={<CatalogPage />} />
      </Routes>
    </Router>
  );
}
