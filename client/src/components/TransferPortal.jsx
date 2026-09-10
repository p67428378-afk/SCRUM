import { useState, useEffect, useCallback } from "react";
import { Landmark, ShieldCheck, Wallet } from "lucide-react";
import TransferForm from "./TransferForm";
import RecentTransfersTable from "./RecentTransfersTable";
import TransferReceiptModal from "./TransferReceiptModal";
import { createTransfer, getTransfers, getAllAccounts } from "../services/api";

const DEFAULT_SENDER_ID = "123e4567-e89b-12d3-a456-426614174000";

export default function TransferPortal() {
  const [accounts, setAccounts] = useState([
    {
      id: DEFAULT_SENDER_ID,
      account_number: "ACC-1001",
      balance: 50000.0,
      owner_name: "Apex Test Sender",
      email: "test@example.com",
    },
    {
      id: "987f6543-e89b-12d3-a456-426614174000",
      account_number: "ACC-2002",
      balance: 1000.0,
      owner_name: "Apex Test Receiver",
      email: "receiver@example.com",
    },
    {
      id: "222e4567-e89b-12d3-a456-426614174000",
      account_number: "ACC-3003",
      balance: 100.0,
      owner_name: "Low Balance Account",
      email: "lowbalance@example.com",
    },
  ]);
  const [selectedSenderId, setSelectedSenderId] = useState(DEFAULT_SENDER_ID);
  const [transfers, setTransfers] = useState([]);
  const [isLoadingTransfers, setIsLoadingTransfers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [receiptTransfer, setReceiptTransfer] = useState(null);

  const fetchAccountsData = useCallback(async () => {
    try {
      const data = await getAllAccounts();
      if (Array.isArray(data) && data.length > 0) {
        setAccounts(data);
      }
    } catch {
      // Backend not yet reachable or empty; retain initial seed values
    }
  }, []);

  const fetchTransfersData = useCallback(async () => {
    setIsLoadingTransfers(true);
    try {
      const data = await getTransfers({ skip: 0, limit: 50 });
      if (Array.isArray(data)) {
        setTransfers(data);
      }
    } catch {
      // Retain existing transfers list
    } finally {
      setIsLoadingTransfers(false);
    }
  }, []);

  useEffect(() => {
    fetchAccountsData();
    fetchTransfersData();
  }, [fetchAccountsData, fetchTransfersData]);

  const handleTransferSubmit = async (payload) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await createTransfer(payload);
      setReceiptTransfer(result);
      // Refresh accounts and transaction history
      fetchAccountsData();
      fetchTransfersData();
    } catch (err) {
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSender =
    accounts.find((acc) => acc.id === selectedSenderId) || accounts[0];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                Apex<span className="text-indigo-400">Bank</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-semibold tracking-wider text-slate-400 ml-2 bg-slate-800 px-2 py-0.5 rounded">
                Secure P2P Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            <div className="bg-slate-800/90 border border-slate-700/80 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Wallet className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="text-slate-400 block text-[10px]">
                  Available Balance
                </span>
                <span className="font-bold text-slate-100 font-mono text-xs">
                  $
                  {currentSender
                    ? currentSender.balance.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })
                    : "0.00"}
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/80">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <span className="text-slate-400 block text-[10px]">
                  Active Account
                </span>
                <span
                  className="font-mono text-slate-300 text-[11px] truncate max-w-[130px] block"
                  title={selectedSenderId}
                >
                  {currentSender ? currentSender.owner_name : selectedSenderId}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex-1 w-full">
        {/* Banner with test credentials & info */}
        <div className="mb-6 bg-indigo-50/70 border border-indigo-100 rounded-xl p-3.5 sm:p-4 text-xs text-indigo-950 flex flex-wrap items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">
              SYSTEM READY
            </span>
            <span>
              Real-time synchronous fraud detection rules active: transfers
              exceeding <strong>$10,000.00</strong> or insufficient balances are
              blocked.
            </span>
          </div>
          <div className="text-[11px] text-indigo-700 font-mono">
            Sender:{" "}
            <span className="bg-white/80 px-1.5 py-0.5 rounded border border-indigo-200">
              {selectedSenderId.slice(0, 8)}...
            </span>
          </div>
        </div>

        {/* 2-Column Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 xl:col-span-5">
            <TransferForm
              senderId={selectedSenderId}
              senderAccount={currentSender}
              accounts={accounts}
              onSenderChange={setSelectedSenderId}
              onSubmit={handleTransferSubmit}
              isSubmitting={isSubmitting}
              error={error}
              onErrorDismiss={() => setError(null)}
            />
          </div>

          <div className="lg:col-span-6 xl:col-span-7">
            <RecentTransfersTable
              transfers={transfers}
              isLoading={isLoadingTransfers}
              onRefresh={fetchTransfersData}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4 text-center text-xs text-slate-500">
        <p>
          © 2026 Apex Bank NA. Enterprise P2P Transfer Platform • Fedwire / ACH
          Gateway
        </p>
      </footer>

      {/* Receipt Modal */}
      {receiptTransfer && (
        <TransferReceiptModal
          transfer={receiptTransfer}
          onClose={() => setReceiptTransfer(null)}
        />
      )}
    </div>
  );
}
