import React from "react";
import { Package, Layers, AlertTriangle, DollarSign } from "lucide-react";

const StatCardGrid = ({ stats = {} }) => {
  const {
    totalItemsOnHand = 0,
    activeSKUs = 0,
    lowStockAlerts = 0,
    totalValuation = 0,
  } = stats;

  const cards = [
    {
      title: "Total Items On Hand",
      value: totalItemsOnHand.toLocaleString(),
      icon: Package,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
      subtitle: "Across active warehouses",
    },
    {
      title: "Active SKUs",
      value: activeSKUs.toLocaleString(),
      icon: Layers,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      subtitle: "In product catalog",
    },
    {
      title: "Low Stock Alerts",
      value: lowStockAlerts.toLocaleString(),
      icon: AlertTriangle,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      subtitle: "Below reorder threshold",
    },
    {
      title: "Total Stock Valuation",
      value: `$${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20",
      subtitle: "Estimated asset value",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`p-5 rounded-xl bg-slate-800 border ${card.bg} transition-all hover:scale-[1.01]`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-400">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-lg ${card.bg}`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-white tracking-tight mb-1">
              {card.value}
            </div>
            <p className="text-xs text-slate-400">{card.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
};

export default StatCardGrid;
