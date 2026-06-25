import React from "react";
import TopNavBar from "./components/layout/TopNavBar";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background font-body-md antialiased pt-16">
      <TopNavBar />
      <DashboardPage />
    </div>
  );
}
