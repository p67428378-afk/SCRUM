import React from "react";
import Navbar from "./Navbar.jsx";

export const AppLayout = ({ children, alertCount = 0 }) => {
  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col font-sans">
      <Navbar alertCount={alertCount} />
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            &copy; {new Date().getFullYear()} PharmaCare Drugs Management
            System. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
              System Online
            </span>
            <span>Compliance Mode: Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
