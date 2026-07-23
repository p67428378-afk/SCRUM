import React, { useState } from "react";

export default function LinkedAccountsList({
  accounts,
  onLinkAccount,
  onUnlinkAccount,
}) {
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [accountProvider, setAccountProvider] = useState("");
  const [accountType, setAccountType] = useState("CHECKING");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!accountProvider || !accountNumber || !routingNumber) {
      setError("All fields are required.");
      return;
    }
    try {
      await onLinkAccount({
        account_provider: accountProvider,
        account_type: accountType,
        account_number: accountNumber,
        routing_number: routingNumber,
      });
      setAccountProvider("");
      setAccountNumber("");
      setRoutingNumber("");
      setShowLinkForm(false);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to link account.");
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant flex flex-col h-fit">
      <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-surface-bright">
        <h2 className="font-headline-md text-headline-md text-on-surface">
          Funding Accounts
        </h2>
        <span className="material-symbols-outlined text-outline">
          account_balance_wallet
        </span>
      </div>

      <div className="divide-y divide-outline-variant">
        {accounts.length === 0 ? (
          <div className="p-6 text-center text-on-surface-variant">
            No linked funding accounts. Link an account to fund your payments.
          </div>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              className="p-6 hover:bg-surface-container-low transition-all flex justify-between items-center"
              data-testid="account-item"
            >
              <div className="flex flex-col">
                <span className="font-headline-md text-[16px] text-on-surface">
                  {account.account_provider}
                </span>
                <span className="text-on-surface-variant text-label-md">
                  {account.account_type} • ...{account.account_number_last4}
                </span>
              </div>
              <div className="text-right flex items-center gap-4">
                <div>
                  <div className="font-bold text-on-surface">
                    ${Number(account.balance).toFixed(2)}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter ${account.is_active ? "bg-secondary/10 text-secondary" : "bg-error/10 text-error"}`}
                  >
                    {account.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <button
                  onClick={() => onUnlinkAccount(account.id)}
                  className="p-1 text-outline hover:text-error hover:bg-error/5 rounded transition-all"
                  title="Unlink Account"
                >
                  <span className="material-symbols-outlined text-lg">
                    link_off
                  </span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showLinkForm ? (
        <form
          onSubmit={handleSubmit}
          className="p-6 border-t border-outline-variant bg-surface-container-low space-y-4"
        >
          <h3 className="font-bold text-on-surface text-sm">
            Link New Funding Account
          </h3>
          {error && (
            <div className="p-3 bg-error/10 text-error text-xs rounded border border-error/20">
              {error}
            </div>
          )}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1">
                Bank/Provider Name
              </label>
              <input
                type="text"
                value={accountProvider}
                onChange={(e) => setAccountProvider(e.target.value)}
                placeholder="e.g. Chase, ApexBank"
                className="w-full p-2 bg-surface border border-outline-variant rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1">
                Account Type
              </label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full p-2 bg-surface border border-outline-variant rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="CHECKING">Checking</option>
                <option value="SAVINGS">Savings</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter full account number"
                className="w-full p-2 bg-surface border border-outline-variant rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-outline uppercase mb-1">
                Routing Number
              </label>
              <input
                type="text"
                value={routingNumber}
                onChange={(e) => setRoutingNumber(e.target.value)}
                placeholder="9-digit routing number"
                className="w-full p-2 bg-surface border border-outline-variant rounded text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 bg-primary text-white py-2 rounded text-xs font-bold hover:bg-primary/90 transition-all"
            >
              Save Account
            </button>
            <button
              type="button"
              onClick={() => setShowLinkForm(false)}
              className="flex-1 bg-surface border border-outline-variant text-on-surface-variant py-2 rounded text-xs font-bold hover:bg-surface-container transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="p-6 mt-auto border-t border-outline-variant">
          <button
            onClick={() => setShowLinkForm(true)}
            className="w-full bg-surface-container-low border border-outline-variant text-on-surface-variant px-5 py-3 rounded-xl font-label-md hover:bg-surface-container hover:text-on-surface transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">link</span>
            Link New Account
          </button>
        </div>
      )}
    </div>
  );
}
