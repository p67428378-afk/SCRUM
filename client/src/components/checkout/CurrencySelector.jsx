import React from "react";
import { DollarSign, Coins } from "lucide-react";

export default function CurrencySelector({
  selectedCurrency,
  onCurrencyChange,
}) {
  const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar", rate: 1.0 },
    { code: "EUR", symbol: "€", name: "Euro", rate: 0.92 },
    { code: "GBP", symbol: "£", name: "British Pound", rate: 0.79 },
    { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 155.0 },
  ];

  return (
    <div className="bg-[#1f1f2e] border border-[#2d2d42] rounded-2xl p-4 sm:p-5 shadow-lg">
      <div className="flex items-center space-x-2 mb-3">
        <Coins className="w-4 h-4 text-[#7a3bed]" />
        <span className="text-xs font-bold text-white uppercase tracking-wider">
          Select Checkout Currency
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {currencies.map((c) => {
          const isSelected = selectedCurrency === c.code;
          return (
            <button
              key={c.code}
              type="button"
              onClick={() => onCurrencyChange(c.code)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? "bg-[#7a3bed]/20 border-[#7a3bed] text-white shadow-md"
                  : "bg-[#12121c] border-[#2d2d42] text-[#9ea3b8] hover:text-white hover:border-[#3d3d56]"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-sm">
                  {c.symbol} {c.code}
                </span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-[#21c45c]"></span>
                )}
              </div>
              <span className="text-[10px] text-[#9ea3b8] block truncate">
                {c.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
