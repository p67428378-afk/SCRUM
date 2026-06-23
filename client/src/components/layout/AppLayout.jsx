import React from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout({ children, student, onLogout }) {
  return (
    <div className="min-h-screen bg-surface text-on-surface font-body-md antialiased">
      <Sidebar student={student} onLogout={onLogout} />
      <Header student={student} />
      <main className="ml-[260px] pt-[64px] min-h-screen p-container_gap">
        <div className="max-w-[1400px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
