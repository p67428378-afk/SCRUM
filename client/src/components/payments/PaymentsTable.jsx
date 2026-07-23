import React from "react";

export default function PaymentsTable({
  schedules,
  onEdit,
  onDelete,
  onExecute,
  accounts,
}) {
  const getAccountName = (accountId) => {
    const acc = accounts.find((a) => a.id === accountId);
    return acc
      ? `${acc.account_provider} (...${acc.account_number_last4})`
      : "Unknown Account";
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden flex flex-col">
      <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-bright">
        <h2 className="font-headline-md text-headline-md text-on-surface">
          Active Recurring Payments
        </h2>
      </div>
      <div className="divide-y divide-outline-variant">
        {schedules.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 block text-outline">
              event_busy
            </span>
            No active recurring payments found. Create one to get started!
          </div>
        ) : (
          schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="p-6 hover:bg-surface-container-low transition-all"
              data-testid="payment-item"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">
                      {schedule.payee?.name?.toLowerCase().includes("water")
                        ? "water_drop"
                        : schedule.payee?.name
                              ?.toLowerCase()
                              .includes("energy") ||
                            schedule.payee?.name
                              ?.toLowerCase()
                              .includes("power")
                          ? "bolt"
                          : "receipt"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-[18px] text-on-surface">
                      {schedule.payee?.name || "Unknown Payee"}
                    </h3>
                    <p className="text-on-surface-variant text-body-md">
                      {schedule.frequency} • Next: {schedule.next_payment_date}
                    </p>
                    {schedule.description && (
                      <p className="text-on-surface-variant text-sm italic">
                        {schedule.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 self-end md:self-auto">
                  <div className="text-right">
                    <div className="font-headline-md text-on-surface">
                      ${Number(schedule.amount).toFixed(2)} {schedule.currency}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${schedule.is_active ? "bg-secondary/10 text-secondary" : "bg-error/10 text-error"}`}
                    >
                      {schedule.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onExecute(schedule.id)}
                      className="p-2 text-outline hover:text-secondary hover:bg-secondary/5 rounded transition-all"
                      title="Execute Payment Now"
                    >
                      <span className="material-symbols-outlined">
                        play_arrow
                      </span>
                    </button>
                    <button
                      onClick={() => onEdit(schedule)}
                      className="p-2 text-outline hover:text-primary hover:bg-primary/5 rounded transition-all"
                      title="Edit Schedule"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button
                      onClick={() => onDelete(schedule.id)}
                      className="p-2 text-outline hover:text-error hover:bg-error/5 rounded transition-all"
                      title="Cancel Schedule"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Splits visualization */}
              <div className="space-y-2">
                <div className="flex flex-wrap justify-between text-label-md text-on-surface-variant gap-2">
                  {schedule.splits?.map((split, idx) => (
                    <span key={split.id || idx}>
                      {getAccountName(split.funding_account_id)}:{" "}
                      {split.split_type === "PERCENTAGE"
                        ? `${split.split_value}%`
                        : `$${Number(split.split_value).toFixed(2)}`}
                    </span>
                  ))}
                </div>
                <div className="h-2 w-full bg-surface-container flex rounded-full overflow-hidden">
                  {schedule.splits?.map((split, idx) => {
                    const percentage =
                      split.split_type === "PERCENTAGE"
                        ? split.split_value
                        : (split.split_value / schedule.amount) * 100;
                    const colors = [
                      "bg-primary",
                      "bg-secondary",
                      "bg-tertiary-container",
                      "bg-surface-tint",
                    ];
                    const colorClass = colors[idx % colors.length];
                    return (
                      <React.Fragment key={split.id || idx}>
                        {idx > 0 && <div className="w-[2px] bg-white h-full" />}
                        <div
                          className={`h-full ${colorClass}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
