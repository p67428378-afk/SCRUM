import React from "react";
import { Package, AlertTriangle, Clock, DollarSign } from "lucide-react";

export const MetricCards = ({ metrics = {} }) => {
  const {
    total_products = 0,
    low_stock_count = 0,
    near_expiry_count = 0,
    total_value = 0,
  } = metrics;

  const formattedValue = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(total_value || 0);

  const cards = [
    {
      title: "Total Products",
      value: total_products,
      subtext: "Active inventory items",
      icon: Package,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-100",
    },
    {
      title: "Low Stock Alerts",
      value: low_stock_count,
      subtext: "Items below 50 units",
      icon: AlertTriangle,
      bgColor: low_stock_count > 0 ? "bg-amber-50" : "bg-slate-50",
      textColor: low_stock_count > 0 ? "text-amber-600" : "text-slate-600",
      borderColor:
        low_stock_count > 0 ? "border-amber-200" : "border-slate-200",
    },
    {
      title: "Near Expiry Batches",
      value: near_expiry_count,
      subtext: "Expiring within 30 days",
      icon: Clock,
      bgColor: near_expiry_count > 0 ? "bg-rose-50" : "bg-slate-50",
      textColor: near_expiry_count > 0 ? "text-rose-600" : "text-slate-600",
      borderColor:
        near_expiry_count > 0 ? "border-rose-200" : "border-slate-200",
    },
    {
      title: "Total Inventory Value",
      value: formattedValue,
      subtext: "Estimated total stock value",
      icon: DollarSign,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      borderColor: "border-emerald-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`bg-white p-5 rounded-2xl border ${card.borderColor} shadow-sm hover:shadow-md transition flex items-start justify-between`}
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                {card.title}
              </p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {card.value}
              </h3>
              <p className="text-xs text-slate-500 mt-1">{card.subtext}</p>
            </div>
            <div className={`p-3 rounded-xl ${card.bgColor} ${card.textColor}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricCards;
