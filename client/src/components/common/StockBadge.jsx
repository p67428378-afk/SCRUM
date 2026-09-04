import React from "react";

export default function StockBadge({ stockQuantity }) {
  const qty = parseInt(stockQuantity, 10) || 0;

  if (qty === 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
        Out of stock
      </span>
    );
  }

  if (qty <= 5) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
        Low stock: {qty}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
      {qty} in stock
    </span>
  );
}
