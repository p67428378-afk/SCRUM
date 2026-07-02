import React from "react";
import ProgressBar from "../common/ProgressBar";

export default function ActiveAlertsList({ alerts = [], loading = false }) {
  return (
    <div className="bg-surface-container rounded-xl border border-outline-variant p-lg shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-lg border-b border-outline-variant pb-md">
        <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">
            notifications_active
          </span>
          Active Trackers
        </h2>
      </div>
      <div className="space-y-md flex-1 overflow-y-auto max-h-[400px] pr-1">
        {loading ? (
          <div className="text-center py-8 text-on-surface-variant">
            Loading active alerts...
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8 text-on-surface-variant italic">
            No active spend alerts found.
          </div>
        ) : (
          alerts.map((alert, index) => {
            const isBreached =
              alert.current_daily_spend >= alert.daily_spend_threshold;
            return (
              <div
                key={index}
                className={`bg-surface-container-high rounded-lg p-md border transition-colors cursor-pointer group relative overflow-hidden ${
                  isBreached
                    ? "border-error-container hover:border-error"
                    : "border-outline-variant hover:border-primary"
                }`}
              >
                {isBreached && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-error-container/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                )}
                <div className="flex justify-between items-start mb-md relative z-10">
                  <div>
                    <div className="font-label-md text-label-md text-on-surface flex items-center gap-2">
                      Card ending in {alert.card_identifier}
                      {isBreached ? (
                        <span className="bg-error-container text-error text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider animate-pulse">
                          BREACHED
                        </span>
                      ) : (
                        <span className="bg-secondary-container/20 text-secondary-fixed text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      {alert.alert_delivery_channel} Alert •{" "}
                      {alert.daily_spend_threshold.toLocaleString()} INR Limit
                    </div>
                  </div>
                  <span
                    className={`material-symbols-outlined opacity-0 group-hover:opacity-100 transition-opacity ${isBreached ? "text-error" : "text-primary"}`}
                  >
                    chevron_right
                  </span>
                </div>
                <div className="relative z-10">
                  {isBreached ? (
                    <div>
                      <div className="flex justify-between font-code-md text-code-md text-error mb-2">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">
                            warning
                          </span>{" "}
                          Threshold Exceeded
                        </span>
                        <span>
                          {alert.current_daily_spend.toLocaleString()} /{" "}
                          {alert.daily_spend_threshold.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-surface-dim rounded-full h-1.5 overflow-hidden border border-outline-variant/50">
                        <div
                          className="bg-error h-1.5 rounded-full transition-all duration-1000"
                          style={{ width: "100%" }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <ProgressBar
                      value={alert.current_daily_spend}
                      max={alert.daily_spend_threshold}
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
