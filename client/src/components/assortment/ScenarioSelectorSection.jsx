import React from "react";
import PropTypes from "prop-types";

export default function ScenarioSelectorSection({
  selectedScenario,
  onSelectScenario,
}) {
  const scenarios = [
    {
      id: "conservative",
      name: "Conservative",
      salesImpact: "+1.2%",
      pbImpact: "+0.5%",
    },
    {
      id: "balanced",
      name: "Balanced",
      salesImpact: "+3.5%",
      pbImpact: "+2.1%",
    },
    {
      id: "aggressive",
      name: "Aggressive",
      salesImpact: "+5.8%",
      pbImpact: "+4.0%",
    },
  ];

  return (
    <div className="bg-surface-container-lowest border border-surface-variant rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.04)] p-5 flex flex-col gap-4">
      <h3 className="text-headline-md font-headline-md text-on-surface flex items-center gap-2">
        <span className="material-symbols-outlined text-primary-container">
          tune
        </span>
        Scenario Selector
      </h3>
      <div className="flex flex-col gap-3">
        {scenarios.map((scenario) => {
          const isActive = selectedScenario?.toLowerCase() === scenario.id;
          return (
            <div
              key={scenario.id}
              onClick={() => onSelectScenario(scenario.id)}
              className={`rounded-lg p-3 cursor-pointer transition-all flex items-start gap-3 relative overflow-hidden ${
                isActive
                  ? "border-2 border-primary-container bg-primary-container/5 shadow-sm"
                  : "border border-surface-variant hover:bg-surface-bright"
              }`}
            >
              {isActive ? (
                <div className="w-5 h-5 rounded-full border-2 border-primary-container bg-primary-container text-on-primary-container mt-0.5 flex-shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px] font-bold">
                    check
                  </span>
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-surface-variant mt-0.5 flex-shrink-0"></div>
              )}
              <div className="flex-1 relative z-10 min-w-0">
                <h4 className="font-semibold text-body-md text-on-surface">
                  {scenario.name}
                </h4>
                <div
                  className={`flex justify-between text-body-sm mt-1 gap-2 flex-wrap ${
                    isActive
                      ? "text-on-surface-variant font-medium"
                      : "text-secondary"
                  }`}
                >
                  <span>Proj Sales: {scenario.salesImpact}</span>
                  <span>PB Impact: {scenario.pbImpact}</span>
                </div>
              </div>
              {isActive && (
                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-primary-container/20 rounded-full blur-xl z-0"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

ScenarioSelectorSection.propTypes = {
  selectedScenario: PropTypes.string.isRequired,
  onSelectScenario: PropTypes.func.isRequired,
};
