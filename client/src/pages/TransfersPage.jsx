import React from "react";
import TransferForm from "../components/transfers/TransferForm";
import TransferLimits from "../components/transfers/TransferLimits";

export default function TransfersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-1">
          Transfer Funds
        </h1>
        <p className="text-sm text-on-surface-variant">
          Move money securely between your accounts
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 glass-card rounded-xl p-6">
          <h2 className="text-xl font-bold text-on-surface mb-6">
            Initiate Transfer
          </h2>
          <TransferForm />
        </div>
        <div className="lg:col-span-4">
          <TransferLimits />
        </div>
      </div>
    </div>
  );
}
