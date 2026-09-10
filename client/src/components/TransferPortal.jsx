import { useState, useEffect, useCallback } from "react";
import { Shield, Building2, User, KeyRound, Info } from "lucide-react";
import AccountBalanceCard from "./AccountBalanceCard";
import TransferForm from "./TransferForm";
import TransactionHistoryTable from "./TransactionHistoryTable";
import TransferSuccessModal from "./TransferSuccessModal";
import TransferErrorBanner from "./TransferErrorBanner";
import { getBalance, getTransfers, createTransfer } from "../services/api";

const DEFAULT_USER = {
  id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  name: "Alexander Wright",
  handle: "usr_alexander",
  accountNumber: "CHK-8492",
  email: "test@example.com",
  balance: 5000.0,
};

export default function TransferPortal() {
  const [currentUser] = useState(DEFAULT_USER);
  const [balance, setBalance] = useState(DEFAULT_USER.balance);
  const [transfers, setTransfers] = useState([]);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isLoadingTransfers, setIsLoadingTransfers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success & Error States
  const [errorMessage, setErrorMessage] = useState(null);
  const [completedTransfer, setCompletedTransfer] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Fetch Balance from API
  const fetchBalance = useCallback(async () => {
    setIsLoadingBalance(true);
    try {
      const data = await getBalance(currentUser.handle);
      if (data && typeof data.available_balance === "number") {
        setBalance(data.available_balance);
      }
    } catch {
      // Fallback to local balance if server balance endpoint returns 404
    } finally {
      setIsLoadingBalance(false);
    }
  }, [currentUser.handle]);

  // Fetch Transfers History from API
  const fetchTransferHistory = useCallback(async () => {
    setIsLoadingTransfers(true);
    try {
      const data = await getTransfers({ limit: 20 });
      if (Array.isArray(data)) {
        setTransfers(data);
      }
    } catch {
      // Graceful error state for history
    } finally {
      setIsLoadingTransfers(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    fetchTransferHistory();
  }, [fetchBalance, fetchTransferHistory]);

  // Handle Transfer Submission
  const handleTransferSubmit = async (payload) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const created = await createTransfer({
        sender_id: payload.sender_id,
        receiver_id: payload.receiver_id,
        amount: Number(payload.amount),
      });

      // Successful 201 Response from backend
      setCompletedTransfer(created);
      setIsSuccessModalOpen(true);

      // Refresh balance and history
      await fetchBalance();
      await fetchTransferHistory();
    } catch (err) {
      // Backend error returned (e.g. 400 Bad Request with "Blocked: Fraud threshold exceeded" or "Insufficient funds")
      const detail =
        err.response?.data?.detail ||
        (Array.isArray(err.response?.data)
          ? err.response?.data[0]?.msg
          : err.message ||
            "Transfer failed. Please check your network and parameters.");

      // Format detail message if it is an array of errors from Pydantic
      const formattedDetail =
        typeof detail === "object" ? JSON.stringify(detail) : String(detail);

      setErrorMessage(formattedDetail);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsSuccessModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-navy-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight">
                SecureBank
              </span>
              <span className="hidden sm:inline-block ml-2 text-[11px] font-semibold text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded border border-blue-500/30">
                P2P Portal
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-xs text-slate-300 bg-navy-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span>{currentUser.name}</span>
              <span className="text-slate-500 font-mono">
                ({currentUser.accountNumber})
              </span>
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/40">
              <Shield className="w-3.5 h-3.5" />
              <span className="font-medium">Fraud Guard</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Test Credentials / Developer Context Banner */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3.5 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center space-x-2.5">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>
              <strong>Test account:</strong>{" "}
              <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-800 font-mono">
                test@example.com
              </code>{" "}
              /{" "}
              <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-800 font-mono">
                testpassword
              </code>
              &nbsp;&bull;&nbsp;
              <strong>Current User Handle:</strong>{" "}
              <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-800 font-mono">
                {currentUser.handle}
              </code>
            </span>
          </div>
          <span className="hidden sm:inline-block text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
            FastAPI + PostgreSQL
          </span>
        </div>

        {/* Balance Card Banner */}
        <AccountBalanceCard
          balance={balance}
          accountNumber={currentUser.accountNumber}
          currency="USD"
          userName={currentUser.name}
          userHandle={currentUser.handle}
          onRefresh={fetchBalance}
          isLoading={isLoadingBalance}
        />

        {/* Global Error Banner (Fraud / Insufficient Funds / Network) */}
        {errorMessage && (
          <TransferErrorBanner
            error={errorMessage}
            onDismiss={() => setErrorMessage(null)}
          />
        )}

        {/* 2-Column Split: Send Form (5 cols) & History Ledger (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <TransferForm
              senderId={currentUser.handle}
              senderBalance={balance}
              onSubmitTransfer={handleTransferSubmit}
              isLoading={isSubmitting}
            />
          </div>

          <div className="lg:col-span-7">
            <TransactionHistoryTable
              transfers={transfers}
              isLoading={isLoadingTransfers}
              onRefresh={fetchTransferHistory}
              currentUserId={currentUser.handle}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            &copy; {new Date().getFullYear()} SecureBank. Peer-to-Peer Transfer
            Module.
          </span>
          <span className="text-slate-400">
            Synchronous Fraud Engine: $10,000 Single Transaction Limit
          </span>
        </div>
      </footer>

      {/* Success Confirmation Modal */}
      <TransferSuccessModal
        transfer={completedTransfer}
        isOpen={isSuccessModalOpen}
        onClose={handleCloseModal}
        currentBalance={balance}
      />
    </div>
  );
}
