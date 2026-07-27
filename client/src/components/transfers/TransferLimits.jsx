import React from "react";
import { ShieldCheck, Info } from "lucide-react";

export default function TransferLimits() {
  return (
    <div className="glass-card rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-border pb-4">
        <div className="w-10 h-10 rounded-full bg-brand-indigo/10 flex items-center justify-center text-brand-indigo">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-on-surface">
            Security & Limits
          </h3>
          <p className="text-xs text-on-surface-variant">
            FFIEC & PCI DSS Compliant Transfers
          </p>
        </div>
      </div>

      <div className="space-y-4 text-sm">
        <div className="flex justify-between items-center py-2 border-b border-slate-border/50">
          <span className="text-on-surface-variant">Daily Transfer Limit</span>
          <span className="font-bold text-on-surface">$10,000.00</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-slate-border/50">
          <span className="text-on-surface-variant">
            Monthly Transfer Limit
          </span>
          <span className="font-bold text-on-surface">$50,000.00</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-slate-border/50">
          <span className="text-on-surface-variant">
            Minimum Transfer Amount
          </span>
          <span className="font-bold text-on-surface">$1.00</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-on-surface-variant">Processing Time</span>
          <span className="font-bold text-emerald">Near Real-Time</span>
        </div>
      </div>

      <div className="p-4 bg-brand-indigo/5 border border-brand-indigo/20 rounded-lg flex gap-3 text-xs text-on-surface-variant">
        <Info className="text-brand-indigo shrink-0" size={16} />
        <p>
          All transfers are subject to review and verification. For security
          purposes, transfers exceeding $5,000.00 may require additional
          verification steps.
        </p>
      </div>
    </div>
  );
}
