import React, { useState, useEffect } from "react";
import BalanceCard from "./BalanceCard.jsx";
import TransferForm from "./TransferForm.jsx";
import FraudAlertBanner from "./FraudAlertBanner.jsx";
import TransferReceiptModal from "./TransferReceiptModal.jsx";
import TransactionHistoryTable from "./TransactionHistoryTable.jsx";
import { createTransfer, getBalance, getTransfers } from "../services/api.js";

const TransferPortal = () => {
  const [senderId] = useState("usr_12345");
  const [balance, setBalance] = useState(24850.0);
  const [transfers, setTransfers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentReceipt, setCurrentReceipt] = useState(null);

  // Initial data loading
  useEffect(() => {
    fetchInitialData();
  }, [senderId]);

  const fetchInitialData = async () => {
    setIsHistoryLoading(true);
    try {
      // Attempt to load balance from API
      const balanceData = await getBalance(senderId);
      if (balanceData && typeof balanceData.balance === "number") {
        setBalance(balanceData.balance);
      }
    } catch (e) {
      console.warn("Using default balance state:", e.message);
    }

    try {
      // Attempt to load transfer history from API
      const historyData = await getTransfers({ user_id: senderId });
      if (Array.isArray(historyData)) {
        setTransfers(historyData);
      }
    } catch (e) {
      console.warn("Using empty transfer history state:", e.message);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleTransferSubmit = async (transferData) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Execute backend API call
      const result = await createTransfer(transferData);

      // On 201 Success
      setCurrentReceipt(result);
      setSuccessMessage(
        `Successfully sent $${result.amount} to ${result.receiver_id}`,
      );

      // Update local state
      setBalance((prev) => Math.max(0, prev - result.amount));
      setTransfers((prev) => [result, ...prev]);
    } catch (err) {
      // On failure (Fraud threshold exceeded, Insufficient funds, etc.)
      setError(err.message || "Transfer failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-5 gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest block mb-1">
            SecureBank Platform
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Peer-to-Peer (P2P) Money Transfer
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time instant money transfers with automated fraud detection and
            balance validation.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse" />
            Fraud Detection Active
          </span>
        </div>
      </div>

      {/* Balance Summary Header */}
      <BalanceCard
        senderId={senderId}
        balance={balance}
        fraudThreshold={10000.0}
      />

      {/* Error / Fraud Alert Banner */}
      <FraudAlertBanner
        error={error}
        successMessage={successMessage}
        onClose={() => {
          setError(null);
          setSuccessMessage(null);
        }}
      />

      {/* Transfer Form Component */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <TransferForm
            senderId={senderId}
            onSubmit={handleTransferSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Transaction History Ledger Table */}
      <TransactionHistoryTable
        transfers={transfers}
        currentUserId={senderId}
        isLoading={isHistoryLoading}
      />

      {/* Receipt Modal on Successful Transfer */}
      {currentReceipt && (
        <TransferReceiptModal
          transfer={currentReceipt}
          onClose={() => setCurrentReceipt(null)}
        />
      )}
    </div>
  );
};

export default TransferPortal;
