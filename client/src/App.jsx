import React, { useState } from "react";
import AppLayout from "./components/layout/AppLayout.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <AppLayout
      onNewTaskClick={() => setIsModalOpen(true)}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <DashboardPage
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </AppLayout>
  );
}
