import React from "react";
import AuditLogTable from "../components/compliance/AuditLogTable";
import RiskSignalsFeed from "../components/compliance/RiskSignalsFeed";

export const CompliancePage = () => {
  return (
    <div className="space-y-8 p-6 max-w-[1400px] mx-auto bg-slate-900 text-white min-h-screen">
      <div className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-bold text-white">
          Compliance & Risk Dashboard
        </h1>
        <p className="text-slate-400">
          Monitor immutable audit logs, velocity anomalies, and geolocation risk
          signals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Audit Logs */}
        <div className="lg:col-span-8">
          <AuditLogTable />
        </div>

        {/* Right Column: Risk Signals */}
        <div className="lg:col-span-4">
          <RiskSignalsFeed />
        </div>
      </div>
    </div>
  );
};

export default CompliancePage;
