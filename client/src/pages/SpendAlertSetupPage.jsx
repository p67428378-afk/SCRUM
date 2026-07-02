import React from "react";
import RegisterAlertForm from "../components/alerts/RegisterAlertForm";
import ActiveAlertsList from "../components/alerts/ActiveAlertsList";

export default function SpendAlertSetupPage({
  onSubmit,
  loading,
  alerts,
  alertsLoading,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg min-h-0 overflow-y-auto">
      {/* Left Col (7/12): Register Form */}
      <div className="lg:col-span-7 flex flex-col min-h-0">
        <RegisterAlertForm onSubmit={onSubmit} loading={loading} />
      </div>

      {/* Right Col (5/12): Active Alerts */}
      <div className="lg:col-span-5 flex flex-col min-h-0">
        <ActiveAlertsList alerts={alerts} loading={alertsLoading} />
      </div>
    </div>
  );
}
