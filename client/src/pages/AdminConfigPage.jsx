import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
  Settings,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Edit2,
  Shield,
} from "lucide-react";

export const AdminConfigPage = () => {
  const [configItems, setConfigItems] = useState([]);
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchConfigItems();
  }, []);

  const fetchConfigItems = async () => {
    try {
      const response = await api.get("/api/v1/admin/config");
      setConfigItems(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to load configuration items. Admin access required.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!key.trim() || !value.trim()) {
      setError("Key and value are required");
      return;
    }

    try {
      const payload = {
        key: key.trim(),
        value: value.trim(),
        description: description.trim() || null,
      };

      await api.post("/api/v1/admin/config", payload);
      setSuccess("Configuration item saved successfully!");
      setKey("");
      setValue("");
      setDescription("");
      setEditingItem(null);
      fetchConfigItems();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to save configuration item",
      );
    }
  };

  const handleDeleteConfig = async (itemKey) => {
    setError("");
    setSuccess("");

    try {
      await api.delete(`/api/v1/admin/config/${itemKey}`);
      setSuccess("Configuration item deleted successfully!");
      fetchConfigItems();
    } catch (err) {
      setError("Failed to delete configuration item");
    }
  };

  const handleEditConfig = (item) => {
    setEditingItem(item);
    setKey(item.key);
    setValue(item.value);
    setDescription(item.description || "");
  };

  return (
    <div className="space-y-8 p-6 max-w-[1400px] mx-auto bg-slate-900 text-white min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            System Configuration
          </h1>
          <p className="text-slate-400">
            Manage system-wide business rules, account types, and security
            thresholds.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg text-red-400 text-xs font-semibold">
          <Shield className="w-4 h-4" />
          Admin Console
        </div>
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
        {/* Create/Edit Config Item */}
        <div className="lg:col-span-5 bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg h-fit">
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            {editingItem ? "Edit Config Item" : "Add Config Item"}
          </h2>

          <form onSubmit={handleSaveConfig} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Config Key
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="e.g. STEP_UP_THRESHOLD_AMOUNT"
                required
                disabled={!!editingItem}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Config Value
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. 5000.00"
                required
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose of this business rule..."
                rows="3"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
              />
            </div>

            <div className="flex gap-4">
              {editingItem && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setKey("");
                    setValue("");
                    setDescription("");
                  }}
                  className="w-1/2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className={`font-semibold py-2.5 px-4 rounded-lg transition-colors ${editingItem ? "w-1/2 bg-indigo-600 hover:bg-indigo-500" : "w-full bg-indigo-600 hover:bg-indigo-500"} text-white`}
              >
                {editingItem ? "Update Config" : "Save Config"}
              </button>
            </div>
          </form>
        </div>

        {/* Config Items List */}
        <div className="lg:col-span-7 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg flex flex-col min-h-[400px]">
          <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              Active Business Rules
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-700">
            {loading ? (
              <div className="flex items-center justify-center h-full py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : configItems.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                No configuration items found.
              </div>
            ) : (
              configItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-slate-700/10 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white truncate">
                        {item.key}
                      </span>
                      <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-medium">
                        {item.value}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-500 mt-1">
                      Last Updated: {new Date(item.updated_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditConfig(item)}
                      className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteConfig(item.key)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

export default AdminConfigPage;
