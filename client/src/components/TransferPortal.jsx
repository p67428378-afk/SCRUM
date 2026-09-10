import React, { useState, useEffect } from "react";
import AccountSummaryCard from "./AccountSummaryCard.jsx";
import TransferForm from "./TransferForm.jsx";
import StatusAlertBanner from "./StatusAlertBanner.jsx";
import TransferReceiptModal from "./TransferReceiptModal.jsx";
import TransferLedgerTable from "./TransferLedgerTable.jsx";
import { getAccounts, createTransfer, getTransfers } from "../services/api.js";

export default function TransferPortal() {
  const defaultAccount = {
    id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    user_name: "Primary Checking Account",
    balance: 15420.5,
  };

  const [accounts, setAccounts] = useState([defaultAccount]);
  const [activeAccount, setActiveAccount] = useState(defaultAccount);
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completedTransfer, setCompletedTransfer] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const accData = await getAccounts();
      if (Array.isArray(accData) && accData.length > 0) {
        setAccounts(accData);
        // keep current active account if it exists in list, otherwise select first
        const found = accData.find((a) => a.id === activeAccount.id);
        if (found) {
          setActiveAccount(found);
        } else {
          setActiveAccount(accData[0]);
        }
      }
    } catch (err) {
      console.warn(
        "API unavailable or empty accounts, using default seed account:",
        err.message,
      );
    }

    try {
      const transferData = await getTransfers();
      if (Array.isArray(transferData)) {
        setTransfers(transferData);
      }
    } catch (err) {
      console.warn("API unavailable or empty transfers:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTransferSubmit = async ({ sender_id, receiver_id, amount }) => {
    setError(null);
    setLoading(true);
    try {
      const result = await createTransfer({ sender_id, receiver_id, amount });
      // Real 2xx success: display receipt modal & refresh ledger/balance
      setCompletedTransfer(result);
      if (result.amount) {
        // deduct balance locally for immediate feedback if server balance update isn't fetched
        setActiveAccount((prev) => ({
          ...prev,
          balance: Math.max(0, prev.balance - result.amount),
        }));
      }
      loadData();
    } catch (err) {
      // Set error message for StatusAlertBanner
      const errorMsg = err.message || "Transfer request failed";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p2p-transfer-portal bg-slate-900 text-white min-h-screen p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-emerald-400 tracking-tight flex items-center gap-2">
            ApexBank P2P Transfer Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time peer-to-peer transfers with synchronous fraud & balance
            checks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>{" "}
            Encrypted 256-bit
          </span>
        </div>
      </header>

      {error && (
        <StatusAlertBanner error={error} onClose={() => setError(null)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TransferForm
            senderId={activeAccount.id}
            onSubmit={handleTransferSubmit}
            loading={loading}
          />
        </div>

        <div>
          <AccountSummaryCard
            account={activeAccount}
            accounts={accounts}
            onSelectAccount={(acc) => setActiveAccount(acc)}
          />
        </div>
      </div>

      <div className="pt-4">
        <TransferLedgerTable
          transfers={transfers}
          loading={loading}
          onRefresh={loadData}
          onViewReceipt={(item) => setCompletedTransfer(item)}
        />
      </div>

      {completedTransfer && (
        <TransferReceiptModal
          transfer={completedTransfer}
          onClose={() => setCompletedTransfer(null)}
        />
      )}
    </div>
  );
}
