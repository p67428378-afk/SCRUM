import React from "react";
import Navbar from "./Navbar";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between font-sans">
      <div>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">{children}</main>
      </div>

      <footer className="bg-white border-t border-[#E3E8F0] py-6 px-4 md:px-8 text-center text-xs text-[#707A8C]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            © 2026 BharatGeo Portal — Official Interactive Regional Directory &
            Vector Map of India
          </p>
          <div className="flex items-center gap-4 text-[#475569]">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#2563EB]"
            >
              FastAPI REST Endpoints
            </a>
            <span>•</span>
            <span>28 States & 8 UTs</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
