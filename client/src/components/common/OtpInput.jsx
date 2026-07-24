import React, { useRef, useEffect } from "react";

export const OtpInput = ({ value, onChange, length = 6, disabled = false }) => {
  const inputsRef = useRef([]);

  useEffect(() => {
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(Number(val))) return;

    const newValue = value.split("");
    newValue[index] = val.substring(val.length - 1);
    const updatedValue = newValue.join("");
    onChange(updatedValue);

    // Move focus to next input if value is entered
    if (val && index < length - 1 && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0 && inputsRef.current[index - 1]) {
        inputsRef.current[index - 1].focus();
        const newValue = value.split("");
        newValue[index - 1] = "";
        onChange(newValue.join(""));
      } else {
        const newValue = value.split("");
        newValue[index] = "";
        onChange(newValue.join(""));
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim().slice(0, length);
    if (isNaN(Number(pastedData))) return;

    onChange(pastedData);
    const focusIndex = Math.min(pastedData.length, length - 1);
    if (inputsRef.current[focusIndex]) {
      inputsRef.current[focusIndex].focus();
    }
  };

  return (
    <div className="flex justify-between gap-2" onPaste={handlePaste}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={value[index] || ""}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          ref={(el) => (inputsRef.current[index] = el)}
          disabled={disabled}
          className="w-12 h-12 text-center text-xl font-bold bg-slate-900 border border-slate-700 rounded-lg text-on-surface focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors shadow-inner disabled:opacity-50"
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
