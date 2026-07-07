import React from "react";
import { Check } from "lucide-react";

export default function ApprovalReviewPanel({ scenarioData, onSubmit }) {
  if (!scenarioData) return null;

  const {
    scenario,
    projected_sales,
    projected_private_brand_pct,
    actions,
    guardrails,
  } = scenarioData;

  return (
    <div className="bg-surface-container rounded-lg border border-surface-bright p-md flex-1 flex flex-col">
      <h3 className="font-headline-md text-headline-md text-on-surface text-base mb-sm border-b border-surface-bright pb-xs">
        Approval Review
      </h3>
      <div className="flex-1 flex flex-col gap-sm mt-xs">
        <div>
          <span className="font-label-caps text-label-caps text-on-surface-variant">
            SELECTED SCENARIO
          </span>
          <p className="font-body-md text-on-surface font-semibold">
            {scenario} Assortment
          </p>
        </div>
        <div className="grid grid-cols-2 gap-sm">
          <div className="bg-surface-container-low p-2 rounded border border-surface-bright">
            <span className="font-label-caps text-[10px] text-on-surface-variant block mb-1">
              PROJ. SALES
            </span>
            <span className="font-data-mono text-emerald-400 text-sm">
              +{projected_sales}%
            </span>
          </div>
          <div className="bg-surface-container-low p-2 rounded border border-surface-bright">
            <span className="font-label-caps text-[10px] text-on-surface-variant block mb-1">
              PROJ. PB MIX
            </span>
            <span className="font-data-mono text-primary text-sm">
              {projected_private_brand_pct}%
            </span>
          </div>
        </div>
        <div className="mt-xs">
          <span className="font-label-caps text-label-caps text-on-surface-variant">
            SKU ACTION SUMMARY
          </span>
          <div className="flex gap-2 mt-1">
            <div
              className="flex-1 h-2 bg-emerald-500 rounded-l"
              style={{ width: `${actions?.grow || 0}%` }}
            ></div>
            <div
              className="flex-1 h-2 bg-blue-500"
              style={{ width: `${actions?.maintain || 0}%` }}
            ></div>
            <div
              className="flex-1 h-2 bg-primary"
              style={{ width: `${actions?.swap || 0}%` }}
            ></div>
            <div
              className="flex-1 h-2 bg-red-500 rounded-r"
              style={{ width: `${actions?.reduce || 0}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-on-surface-variant mt-1 font-data-mono">
            <span>{actions?.grow}% Grow</span>
            <span>{actions?.reduce}% Red.</span>
          </div>
        </div>
        <div className="mt-xs border-t border-surface-bright pt-sm">
          <span className="font-label-caps text-label-caps text-on-surface-variant mb-1 block">
            GUARDRAIL CHECKS
          </span>
          <div className="flex items-center justify-between text-sm font-data-mono mb-1">
            <span className="text-on-surface">Shelf Capacity</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> {guardrails?.shelf_capacity}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm font-data-mono">
            <span className="text-on-surface">PB Penetration</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> {guardrails?.pb_penetration}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={onSubmit}
        className="w-full mt-md bg-primary hover:bg-primary/90 text-on-primary-container font-body-md font-bold py-3 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all active:scale-[0.98]"
      >
        Submit Scenario
      </button>
    </div>
  );
}
