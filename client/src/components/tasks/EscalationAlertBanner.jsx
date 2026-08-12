import React from "react";
import { AlertTriangle, Clock, ShieldCheck, ArrowRight } from "lucide-react";

export default function EscalationAlertBanner({
  isEscalated,
  elapsedSeconds,
  message,
}) {
  if (!isEscalated) return null;

  return (
    <div class="bg-amber-50 border-2 border-amber-400 rounded-xl p-5 shadow-sm space-y-3 animate-fade-in">
      <div class="flex items-start space-x-3">
        <div class="p-2 bg-amber-100 rounded-lg text-amber-700 mt-0.5">
          <AlertTriangle class="w-5 h-5 text-amber-600 animate-bounce" />
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-bold text-amber-900 flex items-center space-x-2">
              <span>⚠️ Escalation State Active</span>
              <span class="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-mono font-semibold">
                t = {elapsedSeconds}s &gt; 30s threshold
              </span>
            </h4>
          </div>
          <p class="text-xs text-amber-800 mt-1.5 leading-relaxed font-medium">
            {message ||
              "This operation is taking longer than usual due to processing load. You may safely stay on this page or navigate away — background processing will continue and your state will re-hydrate automatically."}
          </p>
        </div>
      </div>

      <div class="bg-white/80 p-3 rounded-lg border border-amber-200/80 text-xs text-amber-900 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <ShieldCheck class="w-4 h-4 text-emerald-600" />
          <span>
            Session persisted to{" "}
            <code class="bg-amber-100 px-1 rounded font-mono text-[11px]">
              sessionStorage
            </code>{" "}
            &amp; URL parameter
          </span>
        </div>
        <span class="text-[11px] font-semibold text-amber-700">
          Auto-Refetches on Refresh
        </span>
      </div>
    </div>
  );
}
