import React from "react";
import {
  Shield,
  Sparkles,
  Zap,
  Check,
  TrendingUp,
  Tag,
  Layers,
} from "lucide-react";

export default function ScenarioSelector({
  scenarios = [],
  selectedScenario = "Balanced",
  onSelectScenario = () => {},
  loading = false,
}) {
  // Default scenario configurations if backend list is loading or empty
  const defaultScenarioList = [
    {
      scenario_key: "Conservative",
      display_name: "Conservative Scenario",
      description:
        "Preserve national brand equity with low disruption and steady turnover.",
      projected_sales_lift_pct: 2.5,
      projected_private_brand_pct: 25.0,
      projected_shelf_capacity_pct: 88.0,
      risk_level: "Low",
      grow_count: 6,
      maintain_count: 24,
      swap_count: 2,
      reduce_count: 1,
    },
    {
      scenario_key: "Balanced",
      display_name: "Balanced Scenario (Recommended)",
      description:
        "Optimal mix balancing high-velocity private brands with top national staples.",
      projected_sales_lift_pct: 5.2,
      projected_private_brand_pct: 28.0,
      projected_shelf_capacity_pct: 92.0,
      risk_level: "Low",
      grow_count: 12,
      maintain_count: 18,
      swap_count: 4,
      reduce_count: 2,
    },
    {
      scenario_key: "Aggressive",
      display_name: "Aggressive Growth",
      description:
        "Maximizes high-margin private brand shelf allocation and aggressive space rationalization.",
      projected_sales_lift_pct: 8.5,
      projected_private_brand_pct: 32.0,
      projected_shelf_capacity_pct: 94.5,
      risk_level: "Moderate",
      grow_count: 18,
      maintain_count: 10,
      swap_count: 8,
      reduce_count: 5,
    },
  ];

  const scenarioItems = scenarios.length > 0 ? scenarios : defaultScenarioList;

  const getScenarioIcon = (key) => {
    switch (key?.toLowerCase()) {
      case "conservative":
        return <Shield className="w-5 h-5 text-blue-600" />;
      case "balanced":
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case "aggressive":
        return <Zap className="w-5 h-5 text-red-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-slate-500" />;
    }
  };

  const getRiskBadge = (risk) => {
    const r = (risk || "Low").toLowerCase();
    if (r.includes("low")) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          Low Risk
        </span>
      );
    }
    if (r.includes("mod")) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          Moderate Risk
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-800 border border-red-200">
        High Risk
      </span>
    );
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Cluster Assortment Scenarios</span>
            <span className="text-xs font-normal text-slate-500">
              (Select an option to evaluate projected impact)
            </span>
          </h2>
        </div>
      </div>

      {/* 3 Side-by-side Selectable Option Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarioItems.map((sc) => {
          const key = sc.scenario_key || sc.scenario || "Balanced";
          const isSelected =
            selectedScenario.toLowerCase() === key.toLowerCase();

          return (
            <div
              key={key}
              onClick={() => onSelectScenario(key)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelectScenario(key);
                }
              }}
              className={`relative rounded-xl p-5 cursor-pointer transition-all border-2 text-left bg-white ${
                isSelected
                  ? "border-[#ECC000] shadow-lg ring-2 ring-[#ECC000]/30 bg-amber-50/20"
                  : "border-slate-200 hover:border-slate-300 hover:shadow-md"
              }`}
            >
              {/* Top Banner / Selection Badge */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? "bg-amber-100 border border-amber-300"
                        : "bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {getScenarioIcon(key)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      {sc.display_name || key}
                    </h3>
                    <div className="mt-0.5">{getRiskBadge(sc.risk_level)}</div>
                  </div>
                </div>

                {/* Radio Circle Check */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                    isSelected
                      ? "bg-[#ECC000] border-[#ECC000] text-black shadow-sm"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 mb-4 min-h-[32px] line-clamp-2">
                {sc.description ||
                  `Optimizes Snacks assortment for ${key.toLowerCase()} growth objectives.`}
              </p>

              {/* Impact Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 py-3 px-2 bg-slate-50 rounded-lg border border-slate-100 mb-3 text-center">
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase block">
                    Sales Lift
                  </span>
                  <span className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />+
                    {sc.projected_sales_lift_pct?.toFixed(1) ?? "0.0"}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase block">
                    PB Share
                  </span>
                  <span className="text-sm font-bold text-amber-700">
                    {sc.projected_private_brand_pct?.toFixed(1) ?? "0.0"}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase block">
                    Shelf Cap
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {sc.projected_shelf_capacity_pct?.toFixed(1) ?? "0.0"}%
                  </span>
                </div>
              </div>

              {/* Action breakdown pills */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                <span className="font-medium text-slate-700">
                  Proposed Actions:
                </span>
                <div className="flex items-center gap-1.5 font-semibold">
                  <span className="text-emerald-700">
                    {sc.grow_count ?? 12} Grow
                  </span>
                  <span>•</span>
                  <span className="text-blue-700">
                    {sc.maintain_count ?? 18} Keep
                  </span>
                  <span>•</span>
                  <span className="text-amber-700">
                    {sc.swap_count ?? 4} Swap
                  </span>
                  <span>•</span>
                  <span className="text-red-700">
                    {sc.reduce_count ?? 2} Cut
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
