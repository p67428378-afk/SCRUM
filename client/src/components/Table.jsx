import React from "react";

export default function Table({ headers, rows }) {
  return (
    <div className="bg-white border border-[#e3e8f0] border-solid content-stretch flex flex-col items-start overflow-clip relative rounded-[10px] shrink-0 text-[13px] w-full">
      {/* Header */}
      <div className="bg-[#f7fafc] content-stretch flex font-medium gap-[12px] items-start overflow-clip p-[12px] relative shrink-0 text-[#707a8c] w-full border-b border-[#e3e8f0]">
        {headers.map((header, index) => (
          <p key={index} className="flex-[1_0_0] min-w-px relative capitalize">
            {header}
          </p>
        ))}
      </div>
      {/* Rows */}
      {rows.length === 0 ? (
        <div className="p-[12px] text-center text-[#707a8c] w-full">
          No ingredients listed.
        </div>
      ) : (
        rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="bg-white content-stretch flex font-normal gap-[12px] items-start overflow-clip p-[12px] relative shrink-0 text-[#171c29] w-full border-b border-[#e3e8f0] last:border-b-0"
          >
            {row.map((cell, cellIndex) => (
              <p key={cellIndex} className="flex-[1_0_0] min-w-px relative">
                {cell || "—"}
              </p>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
