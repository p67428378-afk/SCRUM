import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { CatalogSearch } from "./components/CatalogSearch";
import { PatronDashboard } from "./components/PatronDashboard";
import { StaffCirculation } from "./components/StaffCirculation";
import { BookManagement } from "./components/BookManagement";

export const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<CatalogSearch />} />
              <Route path="/catalog" element={<CatalogSearch />} />
              <Route path="/my-loans" element={<PatronDashboard />} />
              <Route path="/circulation" element={<StaffCirculation />} />
              <Route
                path="/staff/checkout-return"
                element={<StaffCirculation />}
              />
              <Route path="/management" element={<BookManagement />} />
              <Route path="/admin" element={<BookManagement />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>BiblioCentral Centralized Library Management System</span>
              <span className="font-mono text-slate-400">
                React 18 • Vite • Tailwind CSS • RESTful API
              </span>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
