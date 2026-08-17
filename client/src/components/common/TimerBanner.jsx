import React, { useState, useEffect } from "react";
import { Timer, AlertTriangle } from "lucide-react";

export default function TimerBanner({ expiresAt, onExpire }) {
  const [secondsLeft, setSecondsLeft] = useState(600);

  useEffect(() => {
    if (!expiresAt) {
      setSecondsLeft(600);
      return;
    }

    const calculateRemaining = () => {
      const targetTime = new Date(expiresAt).getTime();
      const currentTime = new Date().getTime();
      const diff = Math.max(0, Math.floor((targetTime - currentTime) / 1000));
      return diff;
    };

    setSecondsLeft(calculateRemaining());

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isWarning = secondsLeft < 180; // less than 3 minutes

  return (
    <div
      className={`w-full py-3 px-4 rounded-xl border flex items-center justify-between transition-colors shadow-lg ${
        isWarning
          ? "bg-[#db2626]/10 border-[#db2626]/40 text-[#f5f5fa]"
          : "bg-[#f5a826]/10 border-[#f5a826]/40 text-[#f5f5fa]"
      }`}
    >
      <div className="flex items-center space-x-3">
        {isWarning ? (
          <AlertTriangle className="w-5 h-5 text-[#db2626] animate-pulse" />
        ) : (
          <Timer className="w-5 h-5 text-[#f5a826]" />
        )}
        <div>
          <span className="font-semibold text-sm block sm:inline">
            ⏱️ 10-Minute Hold Lock Active
          </span>
          <span className="text-xs text-[#9ea3b8] sm:ml-2">
            Your seats are temporarily reserved. Complete checkout before timer
            expires.
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 bg-[#12121c] px-3 py-1.5 rounded-lg border border-[#2d2d42]">
        <span className="text-xs text-[#9ea3b8] uppercase font-bold tracking-wider hidden sm:inline">
          Time Remaining:
        </span>
        <span
          className={`font-mono font-bold text-lg ${
            isWarning ? "text-[#db2626]" : "text-[#f5a826]"
          }`}
        >
          {formattedTime}
        </span>
      </div>
    </div>
  );
}
