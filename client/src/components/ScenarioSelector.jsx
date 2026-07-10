import React from "react";

export default function ScenarioSelector({
  selectedScenario,
  onSelectScenario,
  scenariosData,
}) {
  const options = [
    {
      id: "Conservative",
      name: "Conservative",
      risk: "Low Execution Risk",
    },
    {
      id: "Balanced",
      name: "Balanced",
      risk: "Moderate Risk",
    },
    {
      id: "Aggressive",
      name: "Aggressive",
      risk: "High Risk",
    },
  ];

  return (
    <div className="bg-surface-container-lowest border border-surface-container-highest rounded p-md">
      <h3 className="font-title-lg text-title-lg text-on-surface mb-md">
        Scenario Selection
      </h3>
      <div className="flex flex-col gap-sm">
        {options.map((opt) => {
          const isSelected = selectedScenario === opt.id;
          const data = scenariosData[opt.id] || {};
          const salesChange =
            data.projected_sales_change_pct !== undefined
              ? `${data.projected_sales_change_pct >= 0 ? "+" : ""}${data.projected_sales_change_pct.toFixed(1)}% Sales`
              : "Loading...";
          const adds = data.actions_summary?.adds ?? 0;
          const swaps = data.actions_summary?.swaps ?? 0;

          return (
            <div
              key={opt.id}
              onClick={() => onSelectScenario(opt.id)}
              className={`rounded p-sm cursor-pointer transition-all duration-200 relative ${
                isSelected
                  ? "border-2 border-primary-container bg-surface-container-lowest shadow-sm"
                  : "border border-surface-container-highest hover:bg-surface-container-low/50"
              }`}
            >
              {isSelected && (
                <span
                  className="material-symbols-outlined absolute top-sm right-sm text-primary-container"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              )}
              <div className="flex justify-between items-center mb-xs pr-xl">
                <span
                  className={`font-title-md text-title-md text-on-surface ${isSelected ? "font-bold" : ""}`}
                >
                  {opt.name}
                </span>
                <span
                  className={`font-body-md text-body-md ${isSelected ? "text-[#16a34a] font-medium" : "text-surface-variant"}`}
                >
                  {salesChange}
                </span>
              </div>
              <div className="text-on-surface-variant font-body-md text-body-md flex justify-between">
                <span>
                  {adds} Adds | {swaps} Swaps
                </span>
                <span
                  className={opt.risk.includes("High") ? "text-[#ea580c]" : ""}
                >
                  {opt.risk}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
