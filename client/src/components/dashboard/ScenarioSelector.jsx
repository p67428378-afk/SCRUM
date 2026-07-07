import React from "react";
import { CheckCircle } from "lucide-react";

export default function ScenarioSelector({
  selectedScenario,
  onSelectScenario,
}) {
  const scenarios = [
    {
      name: "Conservative",
      sales: "+1.2% Sales",
      pb: "22.0% PB",
    },
    {
      name: "Balanced",
      sales: "+4.8% Sales",
      pb: "25.2% PB",
    },
    {
      name: "Aggressive",
      sales: "+8.5% Sales",
      pb: "30.1% PB",
    },
  ];

  return (
    <div className="bg-surface-container rounded-lg border border-surface-bright p-md">
      <h3 className="font-headline-md text-headline-md text-on-surface text-base mb-sm">
        Scenario Modeler
      </h3>
      <div className="flex flex-col gap-sm">
        {scenarios.map((sc) => {
          const isActive = selectedScenario === sc.name;
          return (
            <div
              key={sc.name}
              onClick={() => onSelectScenario(sc.name)}
              className={`p-sm rounded cursor-pointer transition-all ${
                isActive
                  ? "border-2 border-primary bg-primary/5 relative overflow-hidden group"
                  : "border border-surface-bright bg-surface-container-low hover:border-surface-bright/80"
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              )}
              <div className="flex justify-between items-center mb-1 relative z-10">
                <span
                  className={`font-body-md ${isActive ? "font-bold text-primary" : "font-semibold text-on-surface"}`}
                >
                  {sc.name}
                </span>
                {isActive && (
                  <CheckCircle className="w-[18px] h-[18px] text-primary" />
                )}
              </div>
              <div
                className={`flex gap-md font-data-mono text-xs relative z-10 ${isActive ? "text-on-surface" : "text-on-surface-variant"}`}
              >
                <span className={isActive ? "text-emerald-400" : ""}>
                  {sc.sales}
                </span>
                <span className={isActive ? "text-primary" : ""}>{sc.pb}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
