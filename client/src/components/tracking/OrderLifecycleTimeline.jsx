import React from "react";
import {
  CheckCircle2,
  Clock,
  PackageCheck,
  ChefHat,
  Bike,
  Home,
} from "lucide-react";

const LIFECYCLE_STEPS = [
  {
    key: "Placed",
    label: "Order Placed",
    icon: PackageCheck,
    desc: "Received by Bandra Hotel",
  },
  {
    key: "Confirmed",
    label: "Order Confirmed",
    icon: CheckCircle2,
    desc: "Kitchen acknowledged order",
  },
  {
    key: "Preparing",
    label: "Preparing Food",
    icon: ChefHat,
    desc: "Chef is cooking your order",
  },
  {
    key: "Out for Delivery",
    label: "Out for Delivery",
    icon: Bike,
    desc: "Valet on the way to you",
  },
  {
    key: "Delivered",
    label: "Delivered",
    icon: Home,
    desc: "Enjoy your Bandra Hotel meal!",
  },
];

export default function OrderLifecycleTimeline({
  currentStatus = "Placed",
  updatedAt,
}) {
  // Map backend status strings if needed
  const normalizeStatus = (status) => {
    if (!status) return 0;
    const s = status.toLowerCase();
    if (s.includes("placed")) return 0;
    if (s.includes("confirm")) return 1;
    if (s.includes("prep") || s.includes("kitchen") || s.includes("in prep"))
      return 2;
    if (s.includes("out") || s.includes("dispatch") || s.includes("ready"))
      return 3;
    if (s.includes("deliver")) return 4;
    return 0;
  };

  const activeIndex = normalizeStatus(currentStatus);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Order Fulfillment Status
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time status updates from Bandra Hotel Kitchen
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-xl border border-amber-200 font-semibold text-xs">
          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          <span>EST. Delivery: 30–45 Mins</span>
        </div>
      </div>

      {/* Stepper Timeline */}
      <div className="relative">
        <div className="space-y-6">
          {LIFECYCLE_STEPS.map((step, idx) => {
            const isCompleted = idx < activeIndex;
            const isCurrent = idx === activeIndex;
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="flex items-start gap-4 relative">
                {/* Connecting Line */}
                {idx < LIFECYCLE_STEPS.length - 1 && (
                  <div
                    className={`absolute left-5 top-10 -bottom-6 w-0.5 -ml-px transition-colors duration-300 ${
                      idx < activeIndex ? "bg-amber-500" : "bg-gray-200"
                    }`}
                  />
                )}

                {/* Icon Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-all duration-300 ${
                    isCompleted
                      ? "bg-amber-600 text-white shadow-md"
                      : isCurrent
                        ? "bg-amber-500 text-white ring-4 ring-amber-100 shadow-md scale-110"
                        : "bg-gray-100 text-gray-400 border border-gray-200"
                  }`}
                >
                  <StepIcon className="w-5 h-5" />
                </div>

                {/* Info */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`text-sm font-bold ${isCurrent ? "text-amber-900" : isCompleted ? "text-gray-900" : "text-gray-400"}`}
                    >
                      {step.label}
                    </h4>
                    {isCurrent && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        In Progress
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
