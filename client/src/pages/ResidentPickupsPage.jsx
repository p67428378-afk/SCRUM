import React, { useState } from "react";
import PickupSchedulingForm from "../components/pickups/PickupSchedulingForm";
import PickupTrackerTable from "../components/pickups/PickupTrackerTable";

export default function ResidentPickupsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePickupCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-900 tracking-tight">
          Resident Pickup Scheduling & Tracking
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Submit bulk waste requests and track municipal sanitation collection
          status in real-time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6">
          <PickupSchedulingForm onPickupCreated={handlePickupCreated} />
        </div>
        <div className="lg:col-span-6">
          <PickupTrackerTable refreshTrigger={refreshKey} />
        </div>
      </div>
    </div>
  );
}
