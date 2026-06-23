import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardStats, getAuditLogs, getInventory } from "../services/api";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, logsData, inventoryData] = await Promise.all([
          getDashboardStats(),
          getAuditLogs(),
          getInventory({ limit: 100 }),
        ]);

        setStats(statsData);
        setLogs(logsData.logs || []);

        // Filter for low stock or out of stock items
        const alertItems = (inventoryData.items || []).filter(
          (item) =>
            item.status === "low_stock" || item.status === "out_of_stock",
        );
        setAlerts(alertItems);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
        setError(
          "Failed to load dashboard data. Please make sure the backend is running.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin mr-2">
          sync
        </span>
        Loading dashboard data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-container/20 border border-error/20 rounded-xl p-6 text-error">
        <h3 className="font-headline-sm text-headline-sm mb-2">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  // Calculate max value for chart scaling
  const maxCategoryValue =
    stats?.category_distribution?.reduce(
      (max, item) => Math.max(max, item.value),
      1,
    ) || 1;

  return (
    <div className="space-y-gutter">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-1">
            Inventory Dashboard
          </h2>
          <p className="text-on-surface-variant font-body-md">
            Overview of current stock, valuation, and recent activity.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/inventory")}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-high transition-colors font-label-md text-label-md"
          >
            <span className="material-symbols-outlined text-sm">
              inventory_2
            </span>
            View Inventory
          </button>
          <button
            onClick={() => navigate("/inventory/new")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity font-label-md text-label-md shadow-[0_0_15px_rgba(192,193,255,0.2)]"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Item
          </button>
        </div>
      </div>

      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {/* Total Items */}
        <div className="bg-surface border border-outline-variant rounded-xl p-6 relative overflow-hidden group hover:border-outline transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Total Items
            </div>
            <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">
                inventory_2
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <div className="font-headline-lg text-headline-lg text-on-surface">
              {stats?.total_items?.toLocaleString() || 0}
            </div>
          </div>
        </div>

        {/* Total Value */}
        <div className="bg-surface border border-outline-variant rounded-xl p-6 relative overflow-hidden group hover:border-outline transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
              Total Value
            </div>
            <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-sm">
                payments
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <div className="font-headline-lg text-headline-lg text-on-surface">
              $
              {stats?.total_value?.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }) || "0.00"}
            </div>
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-surface border border-tertiary-container/30 rounded-xl p-6 relative overflow-hidden group hover:border-tertiary-container/60 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-tertiary-container/5 to-transparent pointer-events-none"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="font-label-md text-label-md text-tertiary uppercase tracking-wider">
              Low Stock Items
            </div>
            <div className="w-8 h-8 rounded-full bg-tertiary-container/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-tertiary text-sm">
                warning
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-3 relative z-10">
            <div className="font-headline-lg text-headline-lg text-tertiary">
              {stats?.low_stock_count || 0}
            </div>
          </div>
        </div>

        {/* Out of Stock */}
        <div className="bg-surface border border-error-container/50 rounded-xl p-6 relative overflow-hidden group hover:border-error-container transition-colors">
          <div className="absolute inset-0 bg-gradient-to-br from-error-container/10 to-transparent pointer-events-none"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="font-label-md text-label-md text-error uppercase tracking-wider">
              Out of Stock
            </div>
            <div className="w-8 h-8 rounded-full bg-error-container/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-error text-sm">
                error
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-3 relative z-10">
            <div className="font-headline-lg text-headline-lg text-error">
              {stats?.out_of_stock_count || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Charts & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Chart Area (8 cols) */}
        <div className="lg:col-span-8 bg-surface border border-outline-variant rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Inventory Value by Category
            </h3>
          </div>

          {/* Simplified CSS Bar Chart Representation */}
          <div className="flex-1 flex items-end gap-6 pt-4 h-64 relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-on-surface-variant font-label-sm text-label-sm pr-4 border-r border-outline-variant w-16 pb-8">
              <span>
                $
                {maxCategoryValue.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </span>
              <span>
                $
                {(maxCategoryValue * 0.75).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </span>
              <span>
                $
                {(maxCategoryValue * 0.5).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </span>
              <span>
                $
                {(maxCategoryValue * 0.25).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </span>
              <span>$0</span>
            </div>
            <div className="ml-20 w-full h-full flex items-end justify-around pb-8 relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
                <div className="w-full border-t border-outline-variant/30 h-0"></div>
                <div className="w-full border-t border-outline-variant/30 h-0"></div>
                <div className="w-full border-t border-outline-variant/30 h-0"></div>
                <div className="w-full border-t border-outline-variant/30 h-0"></div>
                <div className="w-full border-t border-outline-variant border-dashed h-0"></div>
              </div>
              {/* Bars */}
              {stats?.category_distribution?.map((item) => {
                const heightPercent = Math.max(
                  5,
                  (item.value / maxCategoryValue) * 100,
                );
                return (
                  <div
                    key={item.category}
                    className="w-16 flex flex-col items-center gap-2 group relative z-10"
                  >
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-primary rounded-t-sm transition-all duration-300 group-hover:bg-primary-fixed group-hover:shadow-[0_0_15px_rgba(192,193,255,0.3)]"
                    ></div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant absolute -bottom-6 whitespace-nowrap">
                      {item.category}
                    </span>
                    <div className="absolute -top-8 bg-inverse-surface text-inverse-on-surface font-label-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ${item.value.toLocaleString()} ({item.count})
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Alerts Panel (4 cols) */}
        <div className="lg:col-span-4 bg-surface border border-outline-variant rounded-xl flex flex-col overflow-hidden">
          <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">
                notifications_active
              </span>
              Stock Alerts
            </h3>
            <span className="bg-surface-container-highest px-2 py-1 rounded text-label-sm font-label-sm text-on-surface-variant">
              {alerts.length} Actionable
            </span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/50 max-h-64">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant text-body-md">
                All items are well stocked!
              </div>
            ) : (
              alerts.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/inventory/edit/${item.id}`)}
                  className="p-4 hover:bg-surface-container-low transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">
                      {item.name}
                    </h4>
                    {item.status === "low_stock" ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-tertiary-container/20 text-tertiary border border-tertiary/20">
                        Low Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-error-container/20 text-error border border-error/20">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-body-md text-on-surface-variant">
                    <span>Category: {item.category}</span>
                    <div className="flex gap-3 text-sm">
                      <span>
                        Qty:{" "}
                        <strong
                          className={
                            item.status === "low_stock"
                              ? "text-tertiary"
                              : "text-error"
                          }
                        >
                          {item.stock_quantity}
                        </strong>
                      </span>
                      <span className="text-outline">
                        Min: {item.low_stock_threshold}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-3 border-t border-outline-variant bg-surface-container-lowest text-center">
            <button
              onClick={() => navigate("/inventory")}
              className="text-primary hover:text-primary-fixed font-label-md text-label-md transition-colors w-full py-1"
            >
              View All Inventory
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Audit Log Table */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
        <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">
            Recent Audit Log Activity
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-lowest border-b border-outline-variant">
                <th className="p-4 font-label-md text-label-md text-outline font-semibold uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="p-4 font-label-md text-label-md text-outline font-semibold uppercase tracking-wider">
                  User
                </th>
                <th className="p-4 font-label-md text-label-md text-outline font-semibold uppercase tracking-wider">
                  Action
                </th>
                <th className="p-4 font-label-md text-label-md text-outline font-semibold uppercase tracking-wider">
                  Item
                </th>
                <th className="p-4 font-label-md text-label-md text-outline font-semibold uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50 font-body-md text-on-surface-variant">
              {logs.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="p-8 text-center text-on-surface-variant"
                  >
                    No recent activity logged.
                  </td>
                </tr>
              ) : (
                logs.slice(0, 10).map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-surface-container-low transition-colors group"
                  >
                    <td className="p-4 whitespace-nowrap text-sm">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-primary-container/20 text-primary flex items-center justify-center text-[10px] font-bold">
                          {log.user_id?.substring(0, 2).toUpperCase() || "U"}
                        </div>
                        <span>{log.user_id}</span>
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs border ${
                          log.action === "CREATE"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : log.action === "DELETE"
                              ? "bg-error-container/10 text-error border-error/20"
                              : "bg-tertiary-container/10 text-tertiary border-tertiary/20"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-on-surface font-medium">
                      {log.product_name || "Unknown Item"}
                    </td>
                    <td className="p-4 text-sm">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
