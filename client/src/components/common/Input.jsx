import React from "react";

export default function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder = "",
  required = false,
  error = "",
  className = "",
  ...props
}) {
  return (
    <div className={`flex flex-col gap-xs w-full ${className}`}>
      {label && (
        <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      {type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full px-4 py-2 bg-surface-container-low border ${
            error
              ? "border-error focus:ring-error"
              : "border-outline-variant focus:ring-primary"
          } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent font-body-md text-body-md text-on-surface placeholder:text-outline transition-all`}
          rows="3"
          {...props}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full px-4 py-2 bg-surface-container-low border ${
            error
              ? "border-error focus:ring-error"
              : "border-outline-variant focus:ring-primary"
          } rounded-lg focus:outline-none focus:ring-2 focus:border-transparent font-body-md text-body-md text-on-surface placeholder:text-outline transition-all`}
          {...props}
        />
      )}
      {error && <span className="text-error text-xs mt-xs">{error}</span>}
    </div>
  );
}
