import React from "react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
  TrendingUp,
} from "lucide-react";

export default function StatsOverview({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 animate-pulse h-28"
          ></div>
        ))}
      </div>
    );
  }

  const {
    total = 0,
    completed = 0,
    in_progress = 0,
    overdue = 0,
    completion_rate = 0,
  } = stats || {};

  const cards = [
    {
      title: "Total Tasks",
      value: total,
      icon: ListTodo,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
    {
      title: "Completed",
      value: `${completed} (${Math.round(completion_rate)}%)`,
      icon: CheckCircle2,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      title: "In Progress",
      value: in_progress,
      icon: Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      title: "Overdue",
      value: overdue,
      icon: AlertTriangle,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`bg-slate-800 border ${card.border} rounded-xl p-5 shadow-sm transition-all hover:border-slate-600`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-400">
                  {card.title}
                </span>
                <div className={`p-2 rounded-lg ${card.bg} ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Rate Banner */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-white">
              Completion Productivity
            </h3>
            <p className="text-xs text-slate-400">
              {total === 0
                ? "Create your first task to get started!"
                : `${completed} of ${total} total tasks marked completed`}
            </p>
          </div>
        </div>

        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-300">
            <span>Progress</span>
            <span>{Math.round(completion_rate)}%</span>
          </div>
          <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, completion_rate))}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
