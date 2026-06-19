import React from "react";

export default function LoadingBox({ message = "Loading weather data..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-surface-container-high rounded-lg border border-outline-variant/50 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
      <p className="text-on-surface-variant font-body-sm">{message}</p>
    </div>
  );
}
