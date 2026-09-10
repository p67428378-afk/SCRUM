import React, { useState, useEffect } from "react";
import {
  Building2,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowLeftRight,
  Lock,
  ExternalLink,
  Users,
} from "lucide-react";
import TransferPortal from "../components/transfers/TransferPortal";
import TransferHistoryTable from "../components/transfers/TransferHistoryTable";
import TransferReceiptModal from "../components/transfers/TransferReceiptModal";
import { listTransfers } from "../services/api";

export default function TransfersPage() {
  const [transfers, setTransfers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReceiptTransfer, setSelectedReceiptTransfer] = useState(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const fetchTransfers = async () => {
    setIsLoading(true);
    try {
      const data = await listTransfers({ limit: 50 });
      if (Array.isArray(data)) {
        setTransfers(data);
      }
    } catch (err) {
      // Keep UI active even if offline
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleTransferSuccess = (newTransfer) => {
    setSelectedReceiptTransfer(newTransfer);
    setIsReceiptOpen(true);
    fetchTransfers();
  };

  const handleViewReceipt = (transfer) => {
    setSelectedReceiptTransfer(transfer);
    setIsReceiptOpen(true);
  };

  // Calculate metrics
  const totalCompleted = transfers.filter(
    (t) => t.status === "COMPLETED",
  ).length;
  const totalVolume = transfers
    .filter((t) => t.status === "COMPLETED")
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-lg leading-tight tracking-tight">
                  Apex Commercial Bank
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  Secure P2P
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Enterprise Peer-to-Peer Transfer Portal
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>256-bit TLS • Fraud Protected</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-mono font-medium">FastAPI v1.0.0</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* KPI Metrics Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Settled Volume
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                $
                {totalVolume.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Live settlement active
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Transfers
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {totalCompleted}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Real-time transactions
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Fraud Ceiling
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                $10,000.00
              </h3>
              <p className="text-[11px] text-rose-600 font-medium mt-0.5">
                Threshold synchronous block
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Test Account
              </p>
              <h3 className="text-base font-bold text-slate-900 mt-1 font-mono">
                test@example.com
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Pass: <span className="font-mono">testpassword</span>
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Transfer Portal Section */}
        <section aria-label="Transfer Portal">
          <TransferPortal onTransferSuccess={handleTransferSuccess} />
        </section>

        {/* Audit Log & Ledger Section */}
        <section aria-label="Transfer Ledger">
          <TransferHistoryTable
            transfers={transfers}
            isLoading={isLoading}
            onRefresh={fetchTransfers}
            onViewReceipt={handleViewReceipt}
          />
        </section>
      </main>

      {/* Confirmation & Receipt Modal */}
      <TransferReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        transfer={selectedReceiptTransfer}
      />
    </div>
  );
}
