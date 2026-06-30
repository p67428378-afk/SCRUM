import React from "react";

export default function ScenarioSelector({
  selectedScenario,
  onSelectScenario,
}) {
  const scenarios = [
    {
      id: "Conservative",
      name: "Conservative",
      impact: "+3% Sales, +1% PB%",
    },
    {
      id: "Balanced",
      name: "Balanced",
      impact: "+7% Sales, +3% PB%",
    },
    {
      id: "Aggressive",
      name: "Aggressive",
      impact: "+12% Sales, +5% PB%",
    },
  ];

  return (
    <div className="bg-[#1E293B] border border-[#475569] rounded-xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-4">
        Scenario Selector
      </h3>
      <div className="flex flex-col gap-3">
        {scenarios.map((sc) => {
          const isSelected =
            selectedScenario &&
            selectedScenario.toLowerCase() === sc.id.toLowerCase();
          return (
            <div
              key={sc.id}
              onClick={() => onSelectScenario(sc.id)}
              className={`p-3 rounded-lg cursor-pointer transition-colors relative overflow-hidden ${
                isSelected
                  ? "border-2 border-primary bg-primary/5"
                  : "border border-[#334155] hover:bg-surface-container-high"
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 text-primary">
                  <span className="material-symbols-outlined text-[18px]">
                    check_circle
                  </span>
                </div>
              )}
              <div
                className={`font-body-md font-bold ${isSelected ? "text-primary" : "text-on-surface"}`}
              >
                {sc.name}
              </div>
              <div className="font-body-sm text-[#94A3B8]">{sc.impact}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
