import PropTypes from "prop-types";
import { Wallet, ArrowUpRight, ShieldCheck, RefreshCw } from "lucide-react";

export default function AccountBalanceCard({
  balance = 5000.0,
  accountNumber = "CHK-8492",
  currency = "USD",
  userName = "Alexander Wright",
  userHandle = "usr_alexander",
  onRefresh,
  isLoading = false,
}) {
  const formattedBalance = Number(balance).toLocaleString("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-700/50 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center space-x-2 text-slate-300 text-sm mb-1">
            <Wallet className="w-4 h-4 text-blue-400" />
            <span className="font-medium tracking-wide uppercase text-xs">
              Primary Checking &amp; P2P Settlement
            </span>
            <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full border border-blue-400/30">
              Active
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <h2
              className="text-3xl md:text-4xl font-extrabold tracking-tight text-white"
              data-testid="available-balance"
            >
              {formattedBalance}
            </h2>
            <span className="text-slate-400 text-sm font-semibold">
              {currency}
            </span>
          </div>
          <div className="flex items-center space-x-4 mt-2 text-xs text-slate-300">
            <span>
              Account:{" "}
              <span className="font-mono text-slate-100 font-semibold">
                {accountNumber}
              </span>
            </span>
            <span>&bull;</span>
            <span>
              Holder:{" "}
              <span className="text-slate-100 font-semibold">{userName}</span> (
              {userHandle})
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex flex-col items-end text-xs text-slate-300 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold mb-0.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Fraud Protection Active</span>
            </div>
            <span className="text-slate-400">P2P Limit: $10,000.00 / txn</span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh Balance"
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl border border-slate-700 transition duration-150 flex items-center justify-center disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

AccountBalanceCard.propTypes = {
  balance: PropTypes.number,
  accountNumber: PropTypes.string,
  currency: PropTypes.string,
  userName: PropTypes.string,
  userHandle: PropTypes.string,
  onRefresh: PropTypes.func,
  isLoading: PropTypes.bool,
};
