import React from "react";

export default function SplitBreakdownChart({ splits, accounts, amount }) {
  const getAccountName = (accountId) => {
    const acc = accounts.find((a) => a.id === accountId);
    return acc
      ? `${acc.account_provider} (...${acc.account_number_last4})`
      : "Unknown Account";
  };

  const totalAmount = Number(amount) || 0;

  return (
    <div className="w-full space-y-4" data-testid="split-breakdown-chart">
      <h4 className="text-xs font-bold text-outline uppercase tracking-wider text-center">
        Split Breakdown
      </h4>

      {splits.length === 0 ? (
        <div className="text-center text-xs text-on-surface-variant py-4">
          No splits configured yet.
        </div>
      ) : (
        <div className="space-y-3">
          {splits.map((split, idx) => {
            const val = Number(split.split_value) || 0;
            let percentage = 0;
            let displayVal = "";

            if (split.split_type === "PERCENTAGE") {
              percentage = val;
              displayVal = `${val}%`;
            } else {
              percentage = totalAmount > 0 ? (val / totalAmount) * 100 : 0;
              displayVal = `$${val.toFixed(2)}`;
            }

            // Cap percentage at 100 for visual safety
            const visualPercentage = Math.min(Math.max(percentage, 0), 100);

            const colors = [
              "bg-primary",
              "bg-secondary",
              "bg-tertiary-container",
              "bg-surface-tint",
            ];
            const colorClass = colors[idx % colors.length];

            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-on-surface">
                  <span className="truncate max-w-[180px]">
                    {getAccountName(split.funding_account_id)}
                  </span>
                  <span>{displayVal}</span>
                </div>
                <div className="h-3 w-full bg-surface-container rounded-full overflow-hidden border border-outline-variant/10">
                  <div
                    className={`h-full ${colorClass} transition-all duration-300`}
                    style={{ width: `${visualPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
