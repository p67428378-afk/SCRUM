import React from "react";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";

export default function AppLayout({
  children,
  activeTab,
  setActiveTab,
  residentName,
}) {
  return (
    <div className="flex min-h-screen bg-[#0F172A] text-[#e4e1ed]">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        residentName={residentName}
      />
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
        <Header activeTab={activeTab} />
        <main className="flex-1 p-6 lg:p-8 max-w-[1440px] mx-auto w-full flex flex-col gap-6">
          {children}
        </main>
      </div>
    </div>
  );
}
