import React from "react";

export default function ScenarioSelector({
  selectedScenario,
  onSelectScenario,
}) {
  const scenarios = [
    {
      id: "conservative",
      name: "Conservative",
      metrics: 'Sales: +2% | PVT: +1% | Space: 0"',
    },
    {
      id: "balanced",
      name: "Balanced",
      metrics: 'Sales: +5% | PVT: +3% | Space: +4"',
    },
    {
      id: "aggressive",
      name: "Aggressive",
      metrics: 'Sales: +9% | PVT: +7% | Space: +12"',
    },
  ];

  return (
    <div className="card-surface rounded-xl p-md flex flex-col">
      <h2 className="font-headline-sm text-headline-sm text-white mb-1">
        Scenario Selector
      </h2>
      <p className="font-body-sm text-sm text-slate-400 mb-4">
        Model assortment changes and project impact
      </p>
      <div className="space-y-3">
        {scenarios.map((sc) => {
          const isActive = selectedScenario === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => onSelectScenario(sc.id)}
              className={`p-4 rounded-lg border transition-colors cursor-pointer flex justify-between items-center relative ${
                isActive
                  ? "border-2 border-amber-500 bg-slate-800/60 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                  : "border-slate-700 bg-slate-800/30 hover:bg-slate-800"
              }`}
            >
              {isActive && (
                <span className="text-amber-500 absolute top-3 right-3 text-lg font-bold">
                  ✓
                </span>
              )}
              <div>
                <div className="font-semibold text-white">{sc.name}</div>
                <div
                  className={`font-mono-label text-xs mt-1 ${isActive ? "text-amber-400/80" : "text-slate-400"}`}
                >
                  {sc.metrics}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
