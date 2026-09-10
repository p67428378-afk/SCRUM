import React, { useState, useEffect } from "react";
import AccountSummaryCard from "./AccountSummaryCard";
import TransferForm from "./TransferForm";
import SuccessReceipt from "./SuccessReceipt";
import ErrorBanner from "./ErrorBanner";
import {
  initiateTransfer,
  fetchTransfers,
  fetchAccounts,
} from "../../services/api";
import { ShieldCheck, History, ArrowUpRight, Lock } from "lucide-react";

export default function TransferPortal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successTransfer, setSuccessTransfer] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [recentTransfers, setRecentTransfers] = useState([]);

  useEffect(() => {
    loadAccounts();
    loadTransfers();
  }, []);

  const loadAccounts = async () => {
    const res = await fetchAccounts();
    if (res.success && Array.isArray(res.data)) {
      setAccounts(res.data);
    }
  };

  const loadTransfers = async () => {
    const res = await fetchTransfers();
    if (res.success && Array.isArray(res.data)) {
      setRecentTransfers(res.data);
    }
  };

  const handleTransferSubmit = async (transferData) => {
    setLoading(true);
    setError(null);
    setSuccessTransfer(null);

    const result = await initiateTransfer(transferData);
    setLoading(false);

    if (result.success) {
      setSuccessTransfer(result.data);
      loadTransfers();
      loadAccounts();
    } else {
      setError(result.error);
    }
  };

  const handleResetForm = () => {
    setSuccessTransfer(null);
    setError(null);
  };

  const handleAdjustAmount = () => {
    setError(null);
  };

  return (
    <div className="p2p-transfer-portal bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Top Navigation */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-2xs gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 text-white font-black text-xl rounded-lg flex items-center justify-center">
            A
          </div>
          <span className="font-bold text-xl text-blue-600 tracking-tight">
            Apex PayVault
          </span>
          <nav className="flex gap-4 ml-6">
            <a
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
              href="#dashboard"
            >
              Dashboard
            </a>
            <a
              className="text-sm font-semibold text-blue-600 border-b-2 border-blue-600 pb-1"
              href="#transfers"
            >
              Transfers
            </a>
            <a
              className="text-sm font-medium text-slate-500 hover:text-slate-900"
              href="#accounts"
            >
              Accounts
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit SSL Encrypted Rail</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Primary Column */}
        <div className="lg:col-span-8 space-y-6">
          <ErrorBanner
            error={error}
            onDismiss={() => setError(null)}
            onAdjustAmount={handleAdjustAmount}
          />

          {successTransfer ? (
            <SuccessReceipt
              transfer={successTransfer}
              onReset={handleResetForm}
            />
          ) : (
            <TransferForm
              onSubmit={handleTransferSubmit}
              loading={loading}
              accounts={accounts}
            />
          )}

          {/* Recent P2P Activity List */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                Recent P2P Transfer History
              </h3>
              <button
                type="button"
                onClick={loadTransfers}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Refresh Log
              </button>
            </div>

            {recentTransfers.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                No recent transfers found. Your transactions will appear here
                instantly.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentTransfers.slice(0, 5).map((t) => (
                  <div
                    key={t.id}
                    className="py-3 flex justify-between items-center text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
                        <span>
                          To:{" "}
                          {t.receiver_id
                            ? `${t.receiver_id.slice(0, 8)}...`
                            : "Recipient"}
                        </span>
                      </div>
                      <span className="text-slate-400 text-[10px]">
                        {t.created_at
                          ? new Date(t.created_at).toLocaleString()
                          : "Just now"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block text-sm">
                        -${parseFloat(t.amount || 0).toFixed(2)} USD
                      </span>
                      <span className="inline-block text-[10px] font-semibold text-emerald-600 uppercase">
                        {t.status || "COMPLETED"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right / Secondary Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <AccountSummaryCard account={accounts[0]} />

          {/* Security & Limits Card */}
          <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-6 rounded-xl shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-blue-300">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <h4 className="font-bold text-sm">Fraud Risk & Limits</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Transfers are subject to automated real-time fraud monitoring.
              Single transfers exceeding $10,000.00 USD are synchronously
              blocked.
            </p>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
              <span>Fraud Threshold:</span>
              <span className="font-bold text-amber-400">$10,000.00 USD</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
