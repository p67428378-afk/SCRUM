import React from "react";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-surface text-on-surface flex">
      <Sidebar />
      <div className="flex-1 flex flex-col pl-[280px]">
        <main className="flex-1 p-6 bg-surface-container-lowest min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
