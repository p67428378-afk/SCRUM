import React from "react";
import { Check, Sparkles, TrendingUp, ShieldAlert, Zap } from "lucide-react";

const SCENARIOS = [
  {
    id: "Conservative",
    title: "Conservative Optimization",
    tag: "Low Disruption",
    tagColor: "bg-slate-100 text-slate-700",
    description: "Prioritizes low risk and minimal shelf rearrangement",
    salesLift: "+1.8%",
    salesLiftDetail: "",
    pbShare: "26.5%",
    capacity: "81.0%",
    icon: ShieldAlert,
  },
  {
    id: "Balanced",
    title: "Balanced Growth & Margin",
    tag: "Recommended Advisor Choice",
    tagColor: "bg-[#FFC20E] text-[#1E2229]",
    description:
      "Optimal balance of Private Brand expansion, margin lift, and shelf throughput",
    salesLift: "+4.6%",
    salesLiftDetail: "($57.5K/store)",
    pbShare: "28.0%",
    capacity: "85.0%",
    icon: TrendingUp,
    badgeText: "PRE-SELECTED",
  },
  {
    id: "Aggressive",
    title: "Aggressive Private Brand",
    tag: "High Margin",
    tagColor: "bg-amber-100 text-amber-800",
    description:
      "Maximizes Clover Valley shelf space and gross margin contribution",
    salesLift: "+7.2%",
    salesLiftDetail: "",
    pbShare: "32.5%",
    capacity: "92.0%",
    icon: Zap,
  },
];

const ScenarioSelector = ({
  selectedScenario = "Balanced",
  onSelectScenario,
  scenarioEvaluations = {},
  loading = false,
}) => {
  return (
    <section className="space-y-3" data-testid="scenario-selector-section">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Select Optimization Scenario
          </h2>
          <p className="text-xs text-slate-500">
            Choose an assortment strategy to project sales lift, private brand
            share, and shelf capacity
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
          Active: <strong className="text-slate-900">{selectedScenario}</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SCENARIOS.map((scenario) => {
          const isSelected = selectedScenario === scenario.id;
          const evalData = scenarioEvaluations[scenario.id];

          const salesLift =
            evalData?.projected_sales_lift_pct !== undefined
              ? `+${evalData.projected_sales_lift_pct}%`
              : scenario.salesLift;

          const pbShare =
            evalData?.projected_pb_share_pct !== undefined
              ? `${evalData.projected_pb_share_pct}%`
              : scenario.pbShare;

          const capacity =
            evalData?.projected_capacity_pct !== undefined
              ? `${evalData.projected_capacity_pct}%`
              : scenario.capacity;

          return (
            <div
              key={scenario.id}
              onClick={() => onSelectScenario(scenario.id)}
              data-testid={`scenario-card-${scenario.id.toLowerCase()}`}
              className={`p-5 rounded-lg border transition cursor-pointer shadow-sm relative flex flex-col justify-between ${
                isSelected
                  ? "bg-white border-2 border-[#FFC20E] ring-2 ring-[#FFC20E]/20 shadow-md"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Highlight Ribbon for Recommended Choice */}
              {scenario.id === "Balanced" && (
                <div className="absolute -top-3 right-4 bg-[#FFC20E] text-[#1E2229] font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Recommended Advisor Choice
                </div>
              )}

              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                    {scenario.title}
                  </h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      isSelected
                        ? "bg-[#FFC20E]/30 text-slate-900"
                        : scenario.tagColor
                    }`}
                  >
                    {isSelected ? "SELECTED" : scenario.tag}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-4">
                  {scenario.description}
                </p>
              </div>

              {/* Metrics Grid */}
              <div>
                <div className="space-y-2 text-xs border-t border-slate-100 pt-3 font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-sans">
                      Sales Lift:
                    </span>
                    <span
                      className={`font-bold ${isSelected ? "text-emerald-600" : "text-slate-900"}`}
                    >
                      {salesLift}{" "}
                      {scenario.salesLiftDetail && (
                        <span className="text-[11px] font-normal text-slate-500 font-sans">
                          {scenario.salesLiftDetail}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-sans">
                      Private Brand Share:
                    </span>
                    <span className="font-bold text-slate-900">{pbShare}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-sans">Capacity:</span>
                    <span className="font-bold text-slate-900">{capacity}</span>
                  </div>
                </div>

                {/* Selection Action CTA */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectScenario(scenario.id);
                  }}
                  className={`mt-4 w-full text-xs font-bold py-2 rounded transition flex items-center justify-center space-x-1 ${
                    isSelected
                      ? "bg-[#1E2229] text-white shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                  data-testid={`select-button-${scenario.id.toLowerCase()}`}
                >
                  {isSelected ? (
                    <>
                      <span>Active Scenario Selected</span>
                      <Check className="w-3.5 h-3.5 text-[#FFC20E] ml-1" />
                    </>
                  ) : (
                    <span>Select {scenario.id}</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ScenarioSelector;
