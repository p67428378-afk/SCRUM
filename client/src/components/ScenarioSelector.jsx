import React from "react";
import { Shield, Scale, Zap, CheckCircle2, AlertTriangle } from "lucide-react";

export default function ScenarioSelector({
  selectedScenario,
  onSelectScenario,
}) {
  const scenarios = [
    {
      name: "Conservative",
      icon: Shield,
      color: "border-blue-500 bg-blue-50/30",
      iconColor: "text-blue-600 bg-blue-50",
      description:
        "Focuses on low-risk, high-margin private brand items. Minimizes shelf space changes.",
      salesLift: "+1.5%",
      privateBrand: "29.2%",
      guardrails: "All Passed",
      guardrailsValid: true,
    },
    {
      name: "Balanced",
      icon: Scale,
      color: "border-dg-yellow bg-yellow-50/20",
      iconColor: "text-yellow-600 bg-yellow-50",
      description:
        "Optimizes sales lift while maintaining private brand targets and shelf capacity.",
      salesLift: "+3.2%",
      privateBrand: "28.1%",
      guardrails: "All Passed",
      guardrailsValid: true,
    },
    {
      name: "Aggressive",
      icon: Zap,
      color: "border-purple-500 bg-purple-50/30",
      iconColor: "text-purple-600 bg-purple-50",
      description:
        "Maximizes sales lift by introducing high-volume national brands. Pushes private brand limits.",
      salesLift: "+5.8%",
      privateBrand: "24.8%",
      guardrails: "PB % Warning",
      guardrailsValid: false,
    },
  ];

  return (
    <div className="mb-8">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          Select Assortment Strategy
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Choose a scenario to project its impact on sales lift, private brand
          share, and shelf capacity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {scenarios.map((scenario) => {
          const Icon = scenario.icon;
          const isSelected = selectedScenario === scenario.name;

          return (
            <button
              key={scenario.name}
              onClick={() => onSelectScenario(scenario.name)}
              className={`text-left p-6 rounded-xl border-2 transition-all duration-200 flex flex-col justify-between h-full ${
                isSelected
                  ? `${scenario.color} border-opacity-100 shadow-md ring-2 ring-offset-2 ring-dg-yellow`
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-base font-bold text-gray-900">
                    {scenario.name} Strategy
                  </span>
                  <div className={`p-2 rounded-lg ${scenario.iconColor}`}>
                    <Icon size={18} />
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-500 leading-relaxed mb-5">
                  {scenario.description}
                </p>
              </div>

              {/* Metrics */}
              <div className="border-t border-gray-100 pt-4 w-full space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-medium">
                    Projected Sales Lift
                  </span>
                  <span className="font-bold text-green-600">
                    {scenario.salesLift}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500 font-medium">
                    Private Brand %
                  </span>
                  <span className="font-bold text-gray-900">
                    {scenario.privateBrand}
                  </span>
                </div>
                <div className="flex justify-between text-xs items-center">
                  <span className="text-gray-500 font-medium">Guardrails</span>
                  <span
                    className={`inline-flex items-center gap-1 font-bold ${scenario.guardrailsValid ? "text-green-600" : "text-amber-600"}`}
                  >
                    {scenario.guardrailsValid ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <AlertTriangle size={12} />
                    )}
                    <span>{scenario.guardrails}</span>
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
