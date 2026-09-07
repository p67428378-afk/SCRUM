import React, { useState, useEffect } from "react";
import { Bell, Shield, AlertTriangle, RefreshCw } from "lucide-react";
import AlertConfigTable from "../components/alerts/AlertConfigTable";
import NotificationLogTable from "../components/alerts/NotificationLogTable";
import {
  getAlertConfigs,
  getAlertNotifications,
  getLocations,
} from "../services/api";

export default function AlertsPage() {
  const [configs, setConfigs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cfgs, notifs, locs] = await Promise.all([
        getAlertConfigs(),
        getAlertNotifications(),
        getLocations(),
      ]);
      setConfigs(cfgs || []);
      setNotifications(notifs || []);
      setLocations(locs || []);
    } catch (err) {
      console.error("Failed to fetch alert data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Weather Alert System & Threshold Config
          </h1>
          <p className="text-xs text-[#BBC9CF] font-mono mt-1">
            Automated threshold evaluation, email dispatch alerts, and 1-minute
            event throttling control
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-[#171F33] px-3 py-1.5 rounded-lg border border-[#3C494E] text-xs font-mono">
            <Shield className="w-4 h-4 text-[#10B981]" />
            <span className="text-[#BBC9CF]">
              Throttling Protection:{" "}
              <strong className="text-[#10B981]">MAX 1 MSG / MIN</strong>
            </span>
          </div>
          <button
            onClick={fetchData}
            className="p-2 bg-[#171F33] text-[#BBC9CF] hover:text-white border border-[#3C494E] rounded-lg transition"
            title="Refresh Alert Logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Threshold Rules Table */}
      <AlertConfigTable
        alertConfigs={configs}
        locations={locations}
        onConfigCreated={fetchData}
      />

      {/* Notification Logs Table */}
      <NotificationLogTable notifications={notifications} />
    </div>
  );
}
