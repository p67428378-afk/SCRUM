import React, { useState, useRef } from "react";
import { ShieldCheck, ShieldAlert } from "lucide-react";

export const BotDefense = ({ onVerify }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isDragging, setIsVerifiedDragging] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const containerRef = useRef(null);

  const handleMouseDown = () => {
    if (isVerified) return;
    setIsVerifiedDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || isVerified) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width - 48; // subtract handle width
    let x = e.clientX - rect.left - 24; // center handle on cursor

    if (x < 0) x = 0;
    if (x > width) x = width;

    setSliderPosition(x);

    if (x >= width - 5) {
      setIsVerified(true);
      setIsVerifiedDragging(false);
      setSliderPosition(width);
      if (onVerify) onVerify(true);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (!isVerified) {
      setSliderPosition(0);
    }
  };

  // Touch support
  const handleTouchStart = () => {
    if (isVerified) return;
    setIsVerifiedDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || isVerified) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width - 48;
    const touch = e.touches[0];
    let x = touch.clientX - rect.left - 24;

    if (x < 0) x = 0;
    if (x > width) x = width;

    setSliderPosition(x);

    if (x >= width - 5) {
      setIsVerified(true);
      setIsVerifiedDragging(false);
      setSliderPosition(width);
      if (onVerify) onVerify(true);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (!isVerified) {
      setSliderPosition(0);
    }
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, isVerified]);

  return (
    <div
      ref={containerRef}
      className="bg-slate-900 border border-slate-700 rounded-lg p-2 flex items-center justify-between mt-2 relative overflow-hidden select-none h-14"
    >
      {isVerified ? (
        <div className="flex items-center gap-2 z-10 relative px-2 w-full justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <span className="font-semibold text-sm text-emerald-400">
              Device verified as secure
            </span>
          </div>
          <span className="text-xs text-slate-500">AES-256 Active</span>
        </div>
      ) : (
        <>
          <div
            className="absolute left-1 top-1 bottom-1 bg-indigo-500/20 rounded-md transition-all duration-150"
            style={{ width: `${sliderPosition + 40}px` }}
          />
          <div
            className="absolute left-1 top-1 bottom-1 w-10 bg-indigo-500 hover:bg-indigo-600 rounded-md flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md z-20 transition-all duration-75"
            style={{ transform: `translateX(${sliderPosition}px)` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <span className="material-symbols-outlined text-white text-lg">
              double_arrow
            </span>
          </div>
          <span className="w-full text-center font-medium text-sm text-slate-400 pointer-events-none z-10 pl-10">
            Slide to verify device
          </span>
        </>
      )}
    </div>
  );
};

export default BotDefense;
