import React from "react";
import { Plus, Minus, Check, Users } from "lucide-react";
import Badge from "../common/Badge";

export default function TierSelectionCard({
  tier,
  quantity,
  onQuantityChange,
  selected,
}) {
  const {
    id,
    tier_name,
    price_local,
    currency_code,
    available_seats,
    total_capacity,
  } = tier;

  const isSoldOut = available_seats <= 0;

  const handleIncrement = () => {
    if (quantity < Math.min(8, available_seats)) {
      onQuantityChange(id, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      onQuantityChange(id, quantity - 1);
    }
  };

  return (
    <div
      className={`bg-[#1f1f2e] border rounded-2xl p-6 transition-all duration-200 relative overflow-hidden ${
        selected
          ? "border-[#7a3bed] bg-[#7a3bed]/10 shadow-2xl shadow-[#7a3bed]/20 ring-2 ring-[#7a3bed]/50"
          : "border-[#2d2d42] hover:border-[#3d3d56]"
      }`}
    >
      {selected && (
        <div className="absolute top-0 right-0 bg-[#7a3bed] text-white px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase flex items-center space-x-1">
          <Check className="w-3 h-3" />
          <span>Selected</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-bold text-white">{tier_name}</h3>
            {isSoldOut ? (
              <Badge variant="error">Sold Out</Badge>
            ) : available_seats < 20 ? (
              <Badge variant="warning">Few Left ({available_seats})</Badge>
            ) : (
              <Badge variant="success">Available</Badge>
            )}
          </div>

          <div className="flex items-center space-x-2 text-xs text-[#9ea3b8]">
            <Users className="w-3.5 h-3.5 text-[#7a3bed]" />
            <span>
              {available_seats} of {total_capacity} seats available
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-[#2d2d42]">
          <div className="text-left sm:text-right">
            <span className="text-[10px] font-semibold text-[#9ea3b8] uppercase block">
              Price / Ticket
            </span>
            <span className="text-2xl font-black text-white">
              {currency_code === "EUR"
                ? "€"
                : currency_code === "GBP"
                  ? "£"
                  : "$"}
              {price_local?.toFixed(2)}
              <span className="text-xs text-[#9ea3b8] font-normal ml-1">
                {currency_code}
              </span>
            </span>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-3 bg-[#12121c] border border-[#2d2d42] rounded-xl p-1.5">
            <button
              onClick={handleDecrement}
              disabled={quantity <= 0 || isSoldOut}
              className="w-8 h-8 rounded-lg bg-[#1f1f2e] text-white hover:bg-[#2d2d42] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>

            <span className="w-6 text-center font-bold text-white text-base">
              {quantity}
            </span>

            <button
              onClick={handleIncrement}
              disabled={quantity >= Math.min(8, available_seats) || isSoldOut}
              className="w-8 h-8 rounded-lg bg-[#7a3bed] text-white hover:bg-[#682bd6] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-md shadow-[#7a3bed]/30"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
