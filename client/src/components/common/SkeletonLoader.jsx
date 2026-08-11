import React from "react";

export const SkeletonLoader = ({ count = 3 }) => {
  return (
    <div
      className="flex flex-col gap-3 p-2 animate-pulse"
      data-testid="skeleton-loader"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-2 rounded-md bg-[#f2f5fa]"
        >
          <div className="w-10 h-10 bg-[#e3e8f0] rounded-md shrink-0"></div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="h-4 bg-[#e3e8f0] rounded w-3/4"></div>
            <div className="h-3 bg-[#e3e8f0] rounded w-1/2"></div>
          </div>
          <div className="h-4 bg-[#e3e8f0] rounded w-12"></div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
