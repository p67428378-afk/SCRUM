import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SearchDashboardPage from "./pages/SearchDashboardPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import FavoritesPage from "./pages/FavoritesPage";
import ListingManagementPage from "./pages/ListingManagementPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/search" replace />} />
      <Route path="/search" element={<SearchDashboardPage />} />
      <Route path="/properties/:id" element={<PropertyDetailPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/manage-listings" element={<ListingManagementPage />} />
      <Route path="*" element={<Navigate to="/search" replace />} />
    </Routes>
  );
}
