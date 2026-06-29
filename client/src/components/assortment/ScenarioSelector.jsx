import React from "react";
import PropTypes from "prop-types";

export default function ScenarioSelector({
  selectedScenario,
  onScenarioChange,
}) {
  const scenarios = [
    {
      id: "conservative",
      name: "Conservative",
      risk: "Low Risk",
      riskClass: "text-on-surface-variant",
      sales: "+$2.1K/mo",
      pb: "29.1%",
    },
    {
      id: "balanced",
      name: "Balanced",
      risk: "Recommended",
      riskClass: "text-primary-fixed-dim/80 mr-4",
      sales: "+$5.4K/mo",
      pb: "30.2%",
    },
    {
      id: "aggressive",
      name: "Aggressive",
      risk: "High Risk",
      riskClass: "text-error",
      sales: "+$8.9K/mo",
      pb: "32.5%",
    },
  ];

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-xl shadow-sm p-md flex flex-col gap-sm">
      <h2 className="font-headline-md text-on-surface mb-2 flex items-center justify-between font-semibold text-lg">
        Scenario Selection
        <span
          className="material-symbols-outlined text-outline-variant text-[20px] cursor-help"
          title="Select a scenario to update the view"
        >
          info
        </span>
      </h2>

      <div className="flex flex-col gap-sm">
        {scenarios.map((sc) => {
          const isSelected = selectedScenario.toLowerCase() === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => onScenarioChange(sc.id)}
              className={`border rounded-lg p-sm cursor-pointer transition-all relative flex flex-col gap-1 overflow-hidden ${
                isSelected
                  ? "border-primary-fixed-dim bg-primary-container/5 shadow-[0_0_0_1px_rgba(249,189,34,1)]"
                  : "border-outline-variant hover:bg-surface-container"
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[24px] border-l-[24px] border-t-primary-fixed-dim border-l-transparent">
                  <span className="material-symbols-outlined absolute -top-[22px] -left-[14px] text-background text-[14px] font-bold">
                    check
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span
                  className={`font-label-md ${isSelected ? "text-primary-fixed-dim font-bold" : "text-on-surface"}`}
                >
                  {sc.name}
                </span>
                <span className={`font-body-sm ${sc.riskClass}`}>
                  {sc.risk}
                </span>
              </div>
              <div className="flex justify-between items-end mt-1">
                <div className="flex flex-col">
                  <span
                    className={`font-data-mono text-sm ${isSelected ? "text-primary-fixed" : "text-on-surface"}`}
                  >
                    {sc.sales}
                  </span>
                  <span className="font-body-sm text-on-surface-variant text-[11px]">
                    Proj. Sales
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span
                    className={`font-data-mono text-sm ${isSelected ? "text-primary-fixed" : "text-on-surface"}`}
                  >
                    {sc.pb}
                  </span>
                  <span className="font-body-sm text-on-surface-variant text-[11px]">
                    PB% Target
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

ScenarioSelector.propTypes = {
  selectedScenario: PropTypes.string.isRequired,
  onScenarioChange: PropTypes.func.isRequired,
};
