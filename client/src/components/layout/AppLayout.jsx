import React from "react";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";

export default function AppLayout({
  children,
  onNewTaskClick,
  searchQuery,
  onSearchChange,
}) {
  return (
    <div className="min-h-screen bg-background text-on-background font-body-md">
      <Sidebar onNewTaskClick={onNewTaskClick} />
      <Header searchQuery={searchQuery} onSearchChange={onSearchChange} />
      <div className="md:ml-[280px] md:pt-[64px] min-h-screen">{children}</div>
    </div>
  );
}
