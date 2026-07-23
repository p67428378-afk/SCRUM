import React from "react";

export default function ScenarioSelector({
  scenarios,
  selectedScenario,
  onSelectScenario,
  loading,
  error,
}) {
  if (loading) {
    return (
      <div className="bg-surface-container-low border border-outline-variant rounded-xl p-5 flex flex-col gap-4 animate-pulse">
        <div className="h-6 bg-surface-container-highest rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface-container border border-outline-variant rounded-lg p-4 h-32"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-error-container/20 border border-error text-error p-4 rounded-xl text-center">
        Failed to load scenarios. Please try again later.
      </div>
    );
  }

  const defaultScenarios = [
    {
      name: "Conservative",
      projected_sales_lift: 0.012,
      private_brand_impact: 0.005,
      actions: Array(12).fill({}),
    },
    {
      name: "Balanced",
      projected_sales_lift: 0.038,
      private_brand_impact: 0.021,
      actions: Array(45).fill({}),
    },
    {
      name: "Aggressive",
      projected_sales_lift: 0.065,
      private_brand_impact: 0.048,
      actions: Array(118).fill({}),
    },
  ];

  const list = scenarios && scenarios.length > 0 ? scenarios : defaultScenarios;

  const getIcon = (name) => {
    switch (name?.toLowerCase()) {
      case "conservative":
        return "shield";
      case "balanced":
        return "balance";
      case "aggressive":
        return "rocket_launch";
      default:
        return "layers";
    }
  };

  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-xl p-5 flex flex-col gap-4">
      <h3 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant pb-2">
        Select Assortment Scenario
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {list.map((scenario) => {
          const isSelected = selectedScenario?.name === scenario.name;
          return (
            <div
              key={scenario.name}
              onClick={() => onSelectScenario(scenario)}
              className={`cursor-pointer rounded-lg p-4 flex flex-col gap-3 transition-all ${
                isSelected
                  ? "bg-primary-container/10 border-2 border-primary relative shadow-[0_0_15px_rgba(192,193,255,0.15)] scale-[1.02]"
                  : "bg-surface-container border border-outline-variant hover:border-primary/50"
              }`}
            >
              {isSelected && (
                <div className="absolute -top-3 -right-3 bg-primary text-on-primary rounded-full p-1 shadow-lg">
                  <span className="material-symbols-outlined text-[16px] font-bold">
                    check
                  </span>
                </div>
              )}
              <div className="flex justify-between items-start">
                <h4
                  className={`font-label-md text-label-md font-bold ${isSelected ? "text-primary" : "text-on-surface"}`}
                >
                  {scenario.name} {scenario.name === "Balanced" && "Strategy"}
                </h4>
                <span
                  className={`material-symbols-outlined ${isSelected ? "text-primary" : "text-on-surface-variant"}`}
                >
                  {getIcon(scenario.name)}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between font-data-mono text-sm">
                  <span className="text-on-surface-variant">Sales Lift:</span>
                  <span
                    className={
                      isSelected
                        ? "text-emerald-400 font-bold"
                        : "text-on-surface"
                    }
                  >
                    +{(scenario.projected_sales_lift * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between font-data-mono text-sm">
                  <span className="text-on-surface-variant">PB Impact:</span>
                  <span
                    className={
                      isSelected
                        ? "text-emerald-400 font-bold"
                        : "text-on-surface"
                    }
                  >
                    +{(scenario.private_brand_impact * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between font-data-mono text-sm">
                  <span className="text-on-surface-variant">Actions:</span>
                  <span
                    className={
                      isSelected
                        ? "text-on-surface font-bold"
                        : "text-on-surface"
                    }
                  >
                    {scenario.actions?.length || 0} SKUs
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
