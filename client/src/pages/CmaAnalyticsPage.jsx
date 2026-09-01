import React from "react";
import Navbar from "../components/Navbar";
import CmaAnalyticsDashboard from "../components/CmaAnalyticsDashboard";

export default function CmaAnalyticsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1 w-full">
        <CmaAnalyticsDashboard city="Austin" zipCode="78701" />
      </main>
    </div>
  );
}
