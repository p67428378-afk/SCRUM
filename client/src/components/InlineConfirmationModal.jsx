import React from "react";
import {
  CheckCircle2,
  X,
  FileCheck,
  Calendar,
  User,
  Store,
  Layers,
  ShieldCheck,
  ExternalLink,
  Copy,
} from "lucide-react";

export default function InlineConfirmationModal({
  auditData = null,
  onClose = () => {},
  onViewAuditTrail = () => {},
}) {
  if (!auditData) return null;

  const copyAuditId = () => {
    if (auditData.audit_id && typeof navigator !== "undefined") {
      navigator.clipboard?.writeText(auditData.audit_id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden transform transition-all">
        {/* Top DG Yellow Banner */}
        <div className="bg-gradient-to-r from-[#ECC000] to-[#F3D02E] px-6 py-4 flex items-center justify-between text-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-950 text-[#ECC000] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight leading-tight">
                Assortment Plan Submitted
              </h3>
              <p className="text-xs font-semibold text-slate-800">
                Audit Trail Recorded Successfully
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-black/10 hover:bg-black/20 text-slate-900 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <div className="text-center mb-6">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold block mb-1">
              Official Audit Reference ID
            </span>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-300 font-mono text-sm font-bold text-slate-900">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>{auditData.audit_id || "AUD-2026-9981"}</span>
              <button
                onClick={copyAuditId}
                className="text-slate-400 hover:text-slate-700 ml-1 p-0.5 rounded"
                title="Copy Audit ID"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Audit Metrics Summary Grid */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Store className="w-3.5 h-3.5 text-slate-400" /> Target Cluster:
              </span>
              <span className="font-semibold text-slate-900">
                {auditData.cluster_name || "Small Town Value Cluster"}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Layers className="w-3.5 h-3.5 text-slate-400" /> Approved
                Scenario:
              </span>
              <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                {auditData.scenario || "Balanced"}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />{" "}
                Guardrail Status:
              </span>
              <span className="font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {auditData.guardrail_status || "ALL_PASSED"}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                Total Modified SKUs:
              </span>
              <span className="font-bold text-slate-900">
                {auditData.total_modified_skus ?? 18} SKUs
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" /> Submitted By:
              </span>
              <span className="font-mono text-slate-700">
                {auditData.user_id || "user@dollargeneral.com"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Timestamp:
              </span>
              <span className="text-slate-700 font-mono text-[11px]">
                {auditData.timestamp
                  ? new Date(auditData.timestamp).toLocaleString()
                  : new Date().toLocaleString()}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-4 text-center">
            {auditData.message ||
              "Assortment optimization approved and staged for store-level planogram distribution."}
          </p>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={() => {
              onClose();
              onViewAuditTrail();
            }}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 transition-colors flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            <span>View Full Audit Log</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-sm"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
