import React from "react";

export default function SuccessBanner({ scenarioName, auditId, onReset }) {
  return (
    <div className="bg-[#1E293B] border border-primary rounded-xl p-6 shadow-[0_8px_30px_rgb(16,185,129,0.1)] flex flex-col items-center justify-center text-center min-h-[350px]">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4 border border-primary/20">
        <span className="material-symbols-outlined text-3xl">check_circle</span>
      </div>
      <h3 className="font-headline-sm text-headline-sm font-bold text-primary mb-2">
        Submission Successful
      </h3>
      <p className="font-body-md text-on-surface mb-4 max-w-md">
        Assortment scenario{" "}
        <strong className="text-primary">'{scenarioName}'</strong> submitted
        successfully.
      </p>
      <div className="bg-[#162033] border border-[#334155] rounded-lg p-3 w-full max-w-md mb-6 text-left">
        <div className="text-xs text-[#94A3B8] font-data-label uppercase mb-1">
          Audit Trail Reference
        </div>
        <div className="font-mono text-xs text-on-surface break-all select-all bg-[#0F172A] p-2 rounded border border-[#334155]/50">
          {auditId}
        </div>
      </div>
      <button
        onClick={onReset}
        className="text-primary hover:text-primary-fixed-dim font-bold text-sm flex items-center gap-1 transition-colors"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>{" "}
        Back to Scenarios
      </button>
    </div>
  );
}
