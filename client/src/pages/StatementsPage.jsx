import React, { useState, useEffect } from "react";
import { accountService } from "../services/api";
import Button from "../components/common/Button";
import Badge from "../components/common/Badge";

export default function StatementsPage() {
  const [accounts, setAccounts] = useState([]);
  const [activeAccount, setActiveAccount] = useState(null);
  const [statements, setStatements] = useState([]);
  const [selectedStatement, setSelectedStatement] = useState(null);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingStatements, setLoadingStatements] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountService.getAccounts();
        setAccounts(data);
        if (data.length > 0) {
          setActiveAccount(data[0]);
        }
      } catch (err) {
        setError("Failed to load accounts.");
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, []);

  useEffect(() => {
    if (!activeAccount) return;

    const fetchStatements = async () => {
      setLoadingStatements(true);
      setError("");
      try {
        const data = await accountService.getStatements(activeAccount.id);
        setStatements(data);
      } catch (err) {
        setError("Failed to load statements.");
      } finally {
        setLoadingStatements(false);
      }
    };

    fetchStatements();
  }, [activeAccount]);

  const handleViewDetail = async (stmt) => {
    setLoadingDetail(true);
    setError("");
    try {
      const detail = await accountService.getStatementDetail(
        activeAccount.id,
        stmt.id,
      );
      setSelectedStatement(detail);
    } catch (err) {
      setError("Failed to load statement details.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatBalance = (balance) => {
    const num = parseFloat(balance);
    return isNaN(num)
      ? "$0.00"
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(num);
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (loadingAccounts) {
    return (
      <div className="text-center py-8 text-on-surface-variant">
        Loading accounts...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-on-surface mb-1">
          Account Statements
        </h1>
        <p className="text-sm text-on-surface-variant">
          View and download your monthly account statements
        </p>
      </div>

      {error && (
        <div
          className="p-4 bg-error-container/20 border border-error text-error rounded-lg text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Account Selector */}
      <div className="glass-card rounded-xl p-6">
        <label className="block text-sm font-medium text-on-surface-variant mb-2">
          Select Account
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <button
              key={acc.id}
              onClick={() => {
                setActiveAccount(acc);
                setSelectedStatement(null);
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                activeAccount?.id === acc.id
                  ? "border-brand-indigo bg-brand-indigo/10 text-on-surface"
                  : "border-slate-border bg-surface-variant/10 text-on-surface-variant hover:bg-surface-variant/20"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wider">
                {acc.account_type} Account
              </p>
              <p className="text-lg font-bold text-on-surface mt-1">
                {formatBalance(acc.balance)}
              </p>
              <p className="text-xs text-outline mt-2">
                {acc.account_number_masked}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Statements List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-bold text-on-surface mb-4">
              Available Statements
            </h2>

            {loadingStatements ? (
              <p className="text-sm text-on-surface-variant text-center py-4">
                Loading statements...
              </p>
            ) : statements.length === 0 ? (
              <p className="text-sm text-on-surface-variant text-center py-4">
                No statements available for this account.
              </p>
            ) : (
              <div className="space-y-3">
                {statements.map((stmt) => (
                  <div
                    key={stmt.id}
                    className="flex items-center justify-between p-4 bg-surface-variant/20 rounded-lg border border-slate-border/50 hover:border-brand-indigo/50 transition-all"
                  >
                    <div>
                      <p className="text-sm font-bold text-on-surface">
                        {stmt.statement_period}
                      </p>
                      <p className="text-xs text-outline mt-1">
                        Generated: {formatDate(stmt.created_at)}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleViewDetail(stmt)}
                      variant="outline"
                      size="sm"
                      disabled={loadingDetail}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Statement Detail View */}
        <div className="lg:col-span-7">
          {selectedStatement ? (
            <div className="glass-card rounded-xl p-6 space-y-6 print:bg-white print:text-black print:p-0 print:border-0">
              <div className="flex justify-between items-start border-b border-slate-border pb-4 print:border-black">
                <div>
                  <h3 className="text-2xl font-bold text-on-surface print:text-black">
                    e-Statement
                  </h3>
                  <p className="text-sm text-on-surface-variant print:text-black">
                    Period: {selectedStatement.statement_period}
                  </p>
                </div>
                <div className="flex gap-2 print:hidden">
                  <Button onClick={handlePrint} variant="primary" size="sm">
                    Print / Save PDF
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-surface-variant/10 p-4 rounded-lg border border-slate-border/50 print:bg-transparent print:border-black">
                <div>
                  <p className="text-xs text-on-surface-variant print:text-black">
                    Starting Balance
                  </p>
                  <p className="text-lg font-bold text-on-surface print:text-black">
                    {formatBalance(selectedStatement.starting_balance)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-on-surface-variant print:text-black">
                    Ending Balance
                  </p>
                  <p className="text-lg font-bold text-on-surface print:text-black">
                    {formatBalance(selectedStatement.ending_balance)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider print:text-black">
                  Transactions in Period
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-border text-xs font-semibold text-on-surface-variant uppercase tracking-wider print:border-black print:text-black">
                        <th className="py-2">Date</th>
                        <th className="py-2">Description</th>
                        <th className="py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-border/30 text-sm print:divide-black">
                      {selectedStatement.transactions.length === 0 ? (
                        <tr>
                          <td
                            colSpan="3"
                            className="py-4 text-center text-on-surface-variant print:text-black"
                          >
                            No transactions in this period.
                          </td>
                        </tr>
                      ) : (
                        selectedStatement.transactions.map((tx) => {
                          const isCredit = parseFloat(tx.amount) > 0;
                          return (
                            <tr key={tx.id} className="text-xs">
                              <td className="py-2 text-on-surface-variant print:text-black">
                                {formatDate(tx.date)}
                              </td>
                              <td className="py-2 font-semibold text-on-surface print:text-black">
                                {tx.description}
                              </td>
                              <td
                                className={`py-2 text-right font-bold ${
                                  isCredit
                                    ? "text-emerald print:text-black"
                                    : "text-on-surface print:text-black"
                                }`}
                              >
                                {formatBalance(tx.amount)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-xl p-12 text-center text-on-surface-variant flex flex-col items-center justify-center h-full min-h-[300px]">
              <p className="text-lg font-semibold">No Statement Selected</p>
              <p className="text-sm mt-2">
                Select a statement from the list to view details and download
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
