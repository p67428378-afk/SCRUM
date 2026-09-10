import React from "react";
import { Wallet, ShieldAlert, User } from "lucide-react";

const BalanceCard = ({
  senderId = "usr_12345",
  balance = 24850.0,
  fraudThreshold = 10000.0,
}) => {
  return (
    <div className="bg-[#0f1b3d] border border-slate-700/60 rounded-xl p-6 shadow-xl mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-700/40">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
              Available Balance
            </span>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              $
              {typeof balance === "number"
                ? balance.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : balance}
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-slate-900/60 px-4 py-2.5 rounded-lg border border-slate-800">
          <User className="w-4 h-4 text-sky-400" />
          <div>
            <span className="text-xs text-slate-400 block">
              Sender Account ID
            </span>
            <span className="text-sm font-semibold text-sky-300 font-mono">
              {senderId}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center space-x-2 text-amber-400/90">
          <ShieldAlert className="w-4 h-4" />
          <span>
            Max Transfer Limit:{" "}
            <strong className="text-amber-300">
              ${fraudThreshold.toLocaleString("en-US")}
            </strong>{" "}
            per transaction (Fraud Rule)
          </span>
        </div>
        <div className="bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded border border-slate-700 font-mono">
          Test account: <span className="text-emerald-400">{senderId}</span>{" "}
          (Default)
        </div>
      </div>
    </div>
  );
};

export default BalanceCard;
