import React from "react";
import DriverManifestTable from "../components/driver/DriverManifestTable";

export default function DriverTasksPage() {
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-900 tracking-tight">
          Driver Route Manifest & Waste Logging
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          In-cab driver execution terminal for navigating collection routes,
          logging stop tonnage, and flagging skipped bins.
        </p>
      </div>

      <DriverManifestTable />
    </div>
  );
}
