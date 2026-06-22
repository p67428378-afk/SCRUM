import React from "react";

export default function Badge({ status }) {
  const getStyles = () => {
    switch (status?.toLowerCase()) {
      case "pending":
      case "expected":
        return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
      case "resolved":
      case "paid":
      case "arrived":
      case "confirmed":
        return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
      case "unpaid":
      case "expired":
      case "cancelled":
      case "warning":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-slate-500/20 text-slate-400 border border-slate-500/30";
    }
  };

  return <span className={`status-badge ${getStyles()}`}>{status}</span>;
}
