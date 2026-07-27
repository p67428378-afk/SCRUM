import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
  Code,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Globe,
  Shield,
} from "lucide-react";

export const DeveloperSettingsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [url, setUrl] = useState("");
  const [eventType, setEventType] = useState("all");
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await api.get("/api/v1/webhooks");
      setSubscriptions(response.data);
    } catch (err) {
      setError("Failed to load webhook subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!url.trim()) {
      setError("Webhook URL is required");
      return;
    }

    try {
      const payload = {
        url: url.trim(),
        event_type: eventType,
        events: [eventType],
        secret: secret.trim() || null,
      };

      await api.post("/api/v1/webhooks", payload);
      setSuccess("Webhook subscription created successfully!");
      setUrl("");
      setSecret("");
      setEventType("all");
      fetchSubscriptions();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to create webhook subscription",
      );
    }
  };

  const handleUnsubscribe = async (id) => {
    setError("");
    setSuccess("");

    try {
      await api.delete(`/api/v1/webhooks/${id}`);
      setSuccess("Webhook subscription deleted successfully!");
      fetchSubscriptions();
    } catch (err) {
      setError("Failed to delete webhook subscription");
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-[1400px] mx-auto bg-slate-900 text-white min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-white">Developer Settings</h1>
        <p className="text-slate-400">
          Manage API integrations, webhook subscriptions, and developer
          credentials.
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
        {/* Create Webhook Subscription */}
        <div className="lg:col-span-5 bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg h-fit">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            Add Webhook Subscription
          </h2>

          <form onSubmit={handleSubscribe} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Payload URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-server.com/webhooks"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Event Type
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              >
                <option value="all">All Events</option>
                <option value="high_risk_transfer">High Risk Transfer</option>
                <option value="payee_added">Payee Added</option>
                <option value="contact_info_updated">
                  Contact Info Updated
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Secret (Optional)
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Signing secret for payload verification"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
            >
              Subscribe to Webhook
            </button>
          </form>
        </div>

        {/* Webhook Subscriptions List */}
        <div className="lg:col-span-7 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg flex flex-col min-h-[400px]">
          <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-400" />
              Active Webhooks
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-700">
            {loading ? (
              <div className="flex items-center justify-center h-full py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No active webhook subscriptions.
              </div>
            ) : (
              subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 hover:bg-slate-700/10 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white truncate">
                        {sub.url}
                      </span>
                      <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-medium">
                        {sub.event_type || "all"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">ID: {sub.id}</p>
                  </div>
                  <button
                    onClick={() => handleUnsubscribe(sub.id)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperSettingsPage;
