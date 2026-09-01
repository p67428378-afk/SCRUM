import React from "react";
import { Users, Calendar, AlertTriangle, Clock } from "lucide-react";

export default function QuickStatsGrid({
  totalPatients = 0,
  allergyAlertCount = 0,
}) {
  const stats = [
    {
      id: 1,
      name: "Total Registered Patients",
      value: totalPatients || "248",
      change: "+12% this month",
      changeType: "increase",
      icon: Users,
      iconBg: "bg-blue-500/10 text-blue-600",
    },
    {
      id: 2,
      name: "Scheduled Appointments",
      value: "18 Today",
      change: "4 pending check-in",
      changeType: "neutral",
      icon: Calendar,
      iconBg: "bg-emerald-500/10 text-emerald-600",
    },
    {
      id: 3,
      name: "Severe Allergy Warnings",
      value: allergyAlertCount || "14 Alerts",
      change: "High Priority Flag",
      changeType: "alert",
      icon: AlertTriangle,
      iconBg: "bg-amber-500/10 text-amber-600",
    },
    {
      id: 4,
      name: "Recent Profile Updates",
      value: "24 Visits Logged",
      change: "Last updated 5m ago",
      changeType: "neutral",
      icon: Clock,
      iconBg: "bg-purple-500/10 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex items-start justify-between"
          >
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {stat.name}
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {stat.value}
              </h3>
              <p
                className={`text-xs mt-1 font-medium ${
                  stat.changeType === "increase"
                    ? "text-emerald-600"
                    : stat.changeType === "alert"
                      ? "text-amber-600"
                      : "text-slate-500"
                }`}
              >
                {stat.change}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${stat.iconBg}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
