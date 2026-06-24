import React from "react";

export default function ScenarioSelector({
  scenarios = [],
  selectedScenario,
  onScenarioSelect,
}) {
  return (
    <div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-4">
      <h3 class="font-title-sm text-title-sm text-on-surface mb-3">
        Assortment Strategy
      </h3>
      <div class="flex flex-col gap-2">
        {scenarios.map((scenario) => {
          const isSelected = selectedScenario?.name === scenario.name;
          return (
            <button
              key={scenario.name}
              onClick={() => onScenarioSelect(scenario)}
              class={`flex flex-col items-start p-3 border rounded transition-colors text-left w-full ${
                isSelected
                  ? "border-2 border-primary-container bg-surface-container-highest"
                  : "border-outline-variant bg-surface hover:bg-surface-container-high"
              }`}
            >
              <div class="flex items-center justify-between w-full">
                <span
                  class={`font-title-sm text-title-sm ${isSelected ? "text-on-background font-bold" : "text-on-surface"}`}
                >
                  {scenario.name}
                </span>
                {isSelected && (
                  <span class="material-symbols-outlined text-primary-container fill">
                    check_circle
                  </span>
                )}
              </div>
              <p class="text-[11px] text-secondary mt-1 leading-tight">
                {scenario.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
