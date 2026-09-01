import React, { useState, useEffect } from "react";
import {
  Calculator,
  DollarSign,
  Percent,
  Calendar,
  ShieldCheck,
  Home,
} from "lucide-react";

export default function MortgageCalculator({ listingPrice = 450000 }) {
  const [price, setListingPrice] = useState(listingPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTermYears, setLoanTermYears] = useState(30);
  const [hoaFeesMonthly, setHoaFeesMonthly] = useState(300);
  const [propertyTaxRate, setPropertyTaxRate] = useState(1.2);
  const [insuranceMonthly, setInsuranceMonthly] = useState(100);

  useEffect(() => {
    if (listingPrice && listingPrice > 0) {
      setListingPrice(listingPrice);
    }
  }, [listingPrice]);

  // Derived Calculations
  const downPaymentAmount = Math.round((price * downPaymentPercent) / 100);
  const loanAmount = Math.max(0, price - downPaymentAmount);

  const monthlyInterestRate = interestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;

  let monthlyPrincipalAndInterest = 0;
  if (loanAmount > 0) {
    if (monthlyInterestRate > 0) {
      monthlyPrincipalAndInterest =
        (loanAmount *
          (monthlyInterestRate *
            Math.pow(1 + monthlyInterestRate, numberOfPayments))) /
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    } else {
      monthlyPrincipalAndInterest = loanAmount / numberOfPayments;
    }
  }

  const monthlyPropertyTax = Math.round((price * (propertyTaxRate / 100)) / 12);
  const totalMonthlyPayment = Math.round(
    monthlyPrincipalAndInterest +
      monthlyPropertyTax +
      Number(hoaFeesMonthly) +
      Number(insuranceMonthly),
  );

  const piPercent = Math.round(
    (monthlyPrincipalAndInterest / (totalMonthlyPayment || 1)) * 100,
  );
  const taxPercent = Math.round(
    (monthlyPropertyTax / (totalMonthlyPayment || 1)) * 100,
  );
  const hoaPercent = Math.round(
    (hoaFeesMonthly / (totalMonthlyPayment || 1)) * 100,
  );
  const insPercent = Math.max(0, 100 - piPercent - taxPercent - hoaPercent);

  const formatCurrency = (val) => `$${Math.round(val || 0).toLocaleString()}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
        <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Mortgage & Affordability Calculator
          </h3>
          <p className="text-xs text-slate-500">
            Estimate your monthly payment scenario
          </p>
        </div>
      </div>

      {/* Monthly Payment Summary Header */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">
          Estimated Total Monthly Payment
        </span>
        <div className="text-3xl sm:text-4xl font-extrabold text-blue-400">
          {formatCurrency(totalMonthlyPayment)}
          <span className="text-sm font-normal text-slate-300 ml-1">/mo</span>
        </div>

        {/* Visual Component Percentage Bar */}
        <div className="space-y-1 pt-2">
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${piPercent}%` }}
              className="bg-blue-500 h-full"
              title={`P&I: ${piPercent}%`}
            />
            <div
              style={{ width: `${taxPercent}%` }}
              className="bg-emerald-500 h-full"
              title={`Taxes: ${taxPercent}%`}
            />
            <div
              style={{ width: `${hoaPercent}%` }}
              className="bg-purple-500 h-full"
              title={`HOA: ${hoaPercent}%`}
            />
            <div
              style={{ width: `${insPercent}%` }}
              className="bg-amber-500 h-full"
              title={`Insurance: ${insPercent}%`}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <span>P&I: {formatCurrency(monthlyPrincipalAndInterest)}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Taxes: {formatCurrency(monthlyPropertyTax)}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
              <span>HOA: {formatCurrency(hoaFeesMonthly)}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
              <span>Insurance: {formatCurrency(insuranceMonthly)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Form Controls & Sliders */}
      <div className="space-y-5 text-sm">
        {/* Listing Price */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase">
              Home Price
            </label>
            <span className="font-bold text-slate-900">
              {formatCurrency(price)}
            </span>
          </div>
          <input
            type="number"
            min="10000"
            step="5000"
            value={price}
            onChange={(e) =>
              setListingPrice(Math.max(0, Number(e.target.value)))
            }
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Down Payment */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase">
              Down Payment ({downPaymentPercent}%)
            </label>
            <span className="font-bold text-slate-900">
              {formatCurrency(downPaymentAmount)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>

        {/* Interest Rate & Loan Term Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              Interest Rate (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="20"
                value={interestRate}
                onChange={(e) =>
                  setInterestRate(Math.max(0, Number(e.target.value)))
                }
                className="w-full pl-3 pr-8 py-2 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <Percent className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
              Loan Term
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              {[15, 20, 30].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setLoanTermYears(term)}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition ${
                    loanTermYears === term
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {term} yrs
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Expenses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              HOA Fees (/mo)
            </label>
            <input
              type="number"
              min="0"
              value={hoaFeesMonthly}
              onChange={(e) =>
                setHoaFeesMonthly(Math.max(0, Number(e.target.value)))
              }
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Property Tax (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={propertyTaxRate}
              onChange={(e) =>
                setPropertyTaxRate(Math.max(0, Number(e.target.value)))
              }
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Home Insurance (/mo)
            </label>
            <input
              type="number"
              min="0"
              value={insuranceMonthly}
              onChange={(e) =>
                setInsuranceMonthly(Math.max(0, Number(e.target.value)))
              }
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-500 flex items-center space-x-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          Pre-populated with property price. Customize values above to fit your
          scenario.
        </span>
      </div>
    </div>
  );
}
