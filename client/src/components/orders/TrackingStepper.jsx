import React from "react";
import { CheckCircle2, Clock, Truck, PackageCheck, Home } from "lucide-react";

export default function TrackingStepper({ currentStatus = "Pending" }) {
  const steps = [
    { key: "Pending", label: "Order Placed", icon: Clock },
    { key: "Processing", label: "Processing", icon: CheckCircle2 },
    { key: "Shipped", label: "Shipped", icon: Truck },
    { key: "In Transit", label: "In Transit", icon: PackageCheck },
    { key: "Delivered", label: "Delivered", icon: Home },
  ];

  const getStepStatus = (stepKey, index) => {
    const statusMap = {
      Pending: 0,
      Processing: 1,
      Shipped: 2,
      "In Transit": 3,
      Delivered: 4,
    };
    const currentIndex = statusMap[currentStatus] ?? 0;

    if (index < currentIndex) return "completed";
    if (index === currentIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="bg-white border border-[#e3e8f0] p-6 rounded-xl space-y-4">
      <h4 className="font-bold text-[#171c29] text-base mb-4">
        Shipment Progress:{" "}
        <span className="text-[#2663eb]">{currentStatus}</span>
      </h4>

      <div className="flex items-center justify-between relative">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#e3e8f0] -translate-y-1/2 z-0" />

        {steps.map((step, idx) => {
          const state = getStepStatus(step.key, idx);
          const Icon = step.icon;

          let circleStyle =
            "bg-[#f7fafc] border-2 border-[#e3e8f0] text-[#707a8c]";
          let labelStyle = "text-[#707a8c] font-normal";

          if (state === "completed") {
            circleStyle = "bg-[#2663eb] text-white border-2 border-[#2663eb]";
            labelStyle = "text-[#2663eb] font-semibold";
          } else if (state === "current") {
            circleStyle =
              "bg-white text-[#2663eb] border-2 border-[#2663eb] ring-4 ring-[#2663eb]/20";
            labelStyle = "text-[#171c29] font-bold";
          }

          return (
            <div
              key={step.key}
              className="flex flex-col items-center relative z-10"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${circleStyle}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-xs mt-2 text-center max-w-[5rem] ${labelStyle}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
