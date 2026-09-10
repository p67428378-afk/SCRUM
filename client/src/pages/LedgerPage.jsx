import React, { useState, useEffect } from "react";
import TransferLedgerTable from "../components/TransferLedgerTable.jsx";
import TransferReceiptModal from "../components/TransferReceiptModal.jsx";
import { getTransfers } from "../services/api.js";

export default function LedgerPage() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchTransfers = async () => {
    setLoading(true);
    try {
      const data = await getTransfers();
      if (Array.isArray(data)) {
        setTransfers(data);
      }
    } catch (err) {
      console.warn("API error fetching transfers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  return (
    <div className="bg-slate-900 text-white min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-black text-emerald-400">
          P2P Audit & Transaction History
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Full historical audit ledger for all peer-to-peer transfers
        </p>
      </header>

      <TransferLedgerTable
        transfers={transfers}
        loading={loading}
        onRefresh={fetchTransfers}
        onViewReceipt={(item) => setSelectedReceipt(item)}
      />

      {selectedReceipt && (
        <TransferReceiptModal
          transfer={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}
