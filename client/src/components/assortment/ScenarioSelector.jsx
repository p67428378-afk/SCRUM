import React from "react";

export default function ScenarioSelector({
  scenarios,
  selectedScenario,
  onSelectScenario,
  loading,
}) {
  if (loading || !scenarios) {
    return (
      <div className="bg-white rounded-DEFAULT border border-surface-variant shadow-ambient p-lg flex flex-col gap-md animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded w-full"></div>
        ))}
      </div>
    );
  }

  const scenarioKeys = ["conservative", "balanced", "aggressive"];

  const getRiskBadge = (key) => {
    switch (key) {
      case "conservative":
        return (
          <span className="font-label-md text-on-surface-variant px-2 py-0.5 bg-surface-container rounded-DEFAULT">
            Risk: Low
          </span>
        );
      case "balanced":
        return (
          <span className="font-label-md text-dg-blue px-2 py-0.5 bg-dg-blue/10 rounded-DEFAULT">
            Risk: Moderate
          </span>
        );
      case "aggressive":
        return (
          <span className="font-label-md text-[#D93025] px-2 py-0.5 bg-[#FCE8E6] rounded-DEFAULT">
            Risk: High
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-DEFAULT border border-surface-variant shadow-ambient p-lg flex flex-col gap-md">
      <h3 className="font-headline-sm text-on-surface mb-2">
        Scenario Selector
      </h3>

      {scenarioKeys.map((key) => {
        const scenario = scenarios[key];
        if (!scenario) return null;

        const isSelected = selectedScenario === key;
        const salesImpactPct = (
          (scenario.projected_sales_impact - 1) *
          100
        ).toFixed(1);
        const salesImpactText =
          salesImpactPct >= 0 ? `+${salesImpactPct}%` : `${salesImpactPct}%`;

        if (isSelected) {
          return (
            <button
              key={key}
              onClick={() => onSelectScenario(key)}
              className="w-full text-left border-2 border-dg-yellow bg-[#FFD200]/5 rounded-DEFAULT p-md relative overflow-hidden flex flex-col gap-2 shadow-sm focus:outline-none"
            >
              <div className="absolute top-0 right-0 w-8 h-8 bg-dg-yellow flex items-center justify-center rounded-bl-xl">
                <span className="material-symbols-outlined text-dg-blue text-sm font-bold">
                  check
                </span>
              </div>
              <div className="flex justify-between items-center w-full pr-6">
                <span className="font-label-lg text-on-surface font-bold">
                  {scenario.name}
                </span>
                {getRiskBadge(key)}
              </div>
              <div className="flex gap-4 w-full">
                <span className="font-body-sm text-on-surface-variant">
                  Proj. Sales:{" "}
                  <strong className="text-dg-blue font-bold">
                    {salesImpactText}
                  </strong>
                </span>
                <span className="font-body-sm text-on-surface-variant">
                  PB:{" "}
                  <strong className="text-on-surface font-semibold">
                    {scenario.projected_private_brand_pct}%
                  </strong>
                </span>
              </div>
            </button>
          );
        }

        return (
          <button
            key={key}
            onClick={() => onSelectScenario(key)}
            className="w-full text-left border border-surface-variant rounded-DEFAULT p-md hover:border-dg-blue/50 transition-colors flex flex-col gap-2 focus:outline-none"
          >
            <div className="flex justify-between items-center w-full">
              <span className="font-label-lg text-on-surface">
                {scenario.name}
              </span>
              {getRiskBadge(key)}
            </div>
            <div className="flex gap-4 w-full">
              <span className="font-body-sm text-on-surface-variant">
                Proj. Sales:{" "}
                <strong className="text-on-surface font-semibold">
                  {salesImpactText}
                </strong>
              </span>
              <span className="font-body-sm text-on-surface-variant">
                PB:{" "}
                <strong className="text-on-surface font-semibold">
                  {scenario.projected_private_brand_pct}%
                </strong>
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
