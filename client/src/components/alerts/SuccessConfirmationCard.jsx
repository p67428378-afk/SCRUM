import React from "react";

export default function SuccessConfirmationCard({ alertDetails, onReset }) {
  return (
    <div className="bg-surface-container rounded-xl border border-outline-variant p-lg shadow-sm glow-hover transition-all duration-300 flex flex-col space-y-lg">
      <div className="flex items-center gap-md border-b border-outline-variant pb-md">
        <div className="w-12 h-12 rounded-full bg-secondary-container/20 flex items-center justify-center border border-secondary shrink-0">
          <span
            className="material-symbols-outlined text-secondary text-2xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>
        <div>
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Spend Alert Activated!
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Your real-time transaction monitoring is now live.
          </p>
        </div>
      </div>

      <div className="bg-surface-container-high rounded-lg p-md border border-outline-variant space-y-md">
        <div className="grid grid-cols-2 gap-md font-body-sm text-body-sm">
          <div>
            <span className="text-on-surface-variant block">
              Card Identifier
            </span>
            <span className="text-on-surface font-bold font-code-md">
              Card ending in {alertDetails.cardIdentifier}
            </span>
          </div>
          <div>
            <span className="text-on-surface-variant block">
              Daily Threshold
            </span>
            <span className="text-on-surface font-bold font-code-md">
              {alertDetails.dailySpendThreshold.toLocaleString()} INR
            </span>
          </div>
          <div>
            <span className="text-on-surface-variant block">
              Delivery Channel
            </span>
            <span className="text-on-surface font-bold">
              {alertDetails.alertDeliveryChannel}
            </span>
          </div>
          <div>
            <span className="text-on-surface-variant block">Status</span>
            <span className="bg-secondary-container/20 text-secondary-fixed text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider inline-block">
              {alertDetails.status}
            </span>
          </div>
        </div>
      </div>

      {/* Visual SMS Preview Mockup */}
      <div className="space-y-sm">
        <label className="font-label-md text-label-md text-on-surface-variant block">
          SMS Notification Preview
        </label>
        <div className="bg-surface-container-lowest rounded-lg p-md border border-outline-variant relative overflow-hidden">
          <div className="flex items-center gap-sm mb-sm border-b border-outline-variant/30 pb-xs">
            <span className="material-symbols-outlined text-primary text-sm">
              sms
            </span>
            <span className="font-label-md text-xs text-on-surface-variant">
              VERTEX-BANK
            </span>
          </div>
          <p className="font-code-md text-xs text-on-surface">
            "Debit card spend alert activated for card ending{" "}
            {alertDetails.cardIdentifier}. Daily threshold:{" "}
            {alertDetails.dailySpendThreshold.toLocaleString()} INR. Alerts via
            SMS."
          </p>
        </div>
      </div>

      <div className="pt-md">
        <button
          onClick={onReset}
          className="w-full bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary font-label-md text-label-md py-3 px-6 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">
            add_alert
          </span>
          Configure Another Alert
        </button>
      </div>
    </div>
  );
}
