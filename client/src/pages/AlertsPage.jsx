import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
  Bell,
  Settings,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export const AlertsPage = () => {
  const [alerts, setAlerts] = useState([]);
  const [preferences, setPreferences] = useState({
    push_enabled: true,
    sms_enabled: true,
    email_enabled: true,
    low_balance_threshold: 100.0,
    large_transaction_threshold: 1000.0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchAlertsAndPreferences();
  }, []);

  const fetchAlertsAndPreferences = async () => {
    try {
      const [alertsRes, prefsRes] = await Promise.all([
        api.get("/api/v1/alerts"),
        api.get("/api/v1/alerts/preferences"),
      ]);
      setAlerts(alertsRes.data);
      setPreferences(prefsRes.data);
    } catch (err) {
      setError("Failed to load alerts or preferences");
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (field, value) => {
    setPreferences({
      ...preferences,
      [field]: value,
    });
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await api.post(
        "/api/v1/alerts/preferences",
        preferences,
      );
      setPreferences(response.data);
      setSuccess("Alert preferences updated successfully!");
    } catch (err) {
      setError("Failed to update alert preferences");
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-[1400px] mx-auto bg-slate-900 text-white min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-white">Alerts & Preferences</h1>
        <p className="text-slate-400">
          Configure real-time security, transaction, and balance alerts. Fraud
          and security alerts are always delivered.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-400 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Alert Preferences Form */}
        <div className="lg:col-span-5 bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg h-fit">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            Alert Settings
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <form onSubmit={handleSavePreferences} className="space-y-6">
              {/* Channels */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Delivery Channels
                </h3>

                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                  <div>
                    <span className="text-sm font-medium text-white block">
                      Email Notifications
                    </span>
                    <span className="text-xs text-slate-500">
                      Receive alerts via your registered email
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.email_enabled}
                    onChange={(e) =>
                      handlePreferenceChange("email_enabled", e.target.checked)
                    }
                    className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-700 rounded focus:ring-indigo-500 focus:ring-offset-slate-900"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                  <div>
                    <span className="text-sm font-medium text-white block">
                      SMS Notifications
                    </span>
                    <span className="text-xs text-slate-500">
                      Receive text alerts on your mobile phone
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.sms_enabled}
                    onChange={(e) =>
                      handlePreferenceChange("sms_enabled", e.target.checked)
                    }
                    className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-700 rounded focus:ring-indigo-500 focus:ring-offset-slate-900"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                  <div>
                    <span className="text-sm font-medium text-white block">
                      Push Notifications
                    </span>
                    <span className="text-xs text-slate-500">
                      Receive instant browser push alerts
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.push_enabled}
                    onChange={(e) =>
                      handlePreferenceChange("push_enabled", e.target.checked)
                    }
                    className="w-4 h-4 text-indigo-600 bg-slate-900 border-slate-700 rounded focus:ring-indigo-500 focus:ring-offset-slate-900"
                  />
                </div>
              </div>

              {/* Thresholds */}
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Alert Thresholds
                </h3>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Low Balance Threshold ($)
                  </label>
                  <input
                    type="number"
                    value={preferences.low_balance_threshold}
                    onChange={(e) =>
                      handlePreferenceChange(
                        "low_balance_threshold",
                        parseFloat(e.target.value),
                      )
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">
                    Large Transaction Threshold ($)
                  </label>
                  <input
                    type="number"
                    value={preferences.large_transaction_threshold}
                    onChange={(e) =>
                      handlePreferenceChange(
                        "large_transaction_threshold",
                        parseFloat(e.target.value),
                      )
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
              >
                Save Preferences
              </button>
            </form>
          )}
        </div>

        {/* Alert History */}
        <div className="lg:col-span-7 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-400" />
              Alert History
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-700">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : alerts.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No alerts in your history.
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-4 hover:bg-slate-700/10 transition-colors flex items-start gap-3"
                >
                  <div className="mt-1">
                    {alert.type === "large_transaction" ||
                    alert.type === "low_balance" ? (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-sm font-semibold text-white capitalize">
                        {alert.type.replace("_", " ")}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(alert.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {alert.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;
