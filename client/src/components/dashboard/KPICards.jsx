import React from "react";
import {
  DollarSign,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
} from "lucide-react";

export default function KPICards({
  summary,
  onNewOrderClick,
  onReserveTableClick,
}) {
  const rawSales = summary?.today_revenue ?? summary?.daily_sales ?? 0;
  const dailySalesVal = `$${Number(rawSales).toFixed(2)}`;

  const completedOrders =
    summary?.completed_orders ?? summary?.completed_orders_count ?? 0;
  const activeOrders =
    summary?.active_orders ?? summary?.active_orders_count ?? 0;
  const occupancyRate = summary?.occupancy_rate ?? 0;
  const occupiedTables = summary?.occupied_tables ?? 0;
  const totalTables = summary?.total_tables ?? 0;

  const cards = [
    {
      title: "Daily Sales",
      value: dailySalesVal,
      subtext: "+14.2% from yesterday",
      trend: true,
      icon: DollarSign,
      color: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    },
    {
      title: "Completed Orders",
      value: `${completedOrders} Orders`,
      subtext: "Today's total fulfilled",
      icon: CheckCircle2,
      color: "bg-blue-500/10 text-blue-600 border-blue-200",
    },
    {
      title: "Active Order Queue",
      value: `${activeOrders} Orders`,
      subtext: "Pending & Preparing",
      icon: Clock,
      color: "bg-amber-500/10 text-amber-600 border-amber-200",
    },
    {
      title: "Table Occupancy",
      value: `${occupancyRate}% (${occupiedTables}/${totalTables})`,
      subtext: "Tables currently in use",
      icon: Users,
      color: "bg-purple-500/10 text-purple-600 border-purple-200",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Action Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Cafe Overview & KPI Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time operations metrics, active queues, and daily sales
            summary.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {onNewOrderClick && (
            <button
              onClick={onNewOrderClick}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
            >
              <span>+ Create Order</span>
            </button>
          )}
          {onReserveTableClick && (
            <button
              onClick={onReserveTableClick}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
            >
              Reserve Table
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-5 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-xl border ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4">
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {card.value}
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-slate-500 font-medium">
                  {card.trend && (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>{card.subtext}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
