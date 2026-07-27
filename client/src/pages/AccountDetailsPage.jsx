import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { accountService } from "../services/api";
import AccountSummary from "../components/accounts/AccountSummary";
import FilterBar from "../components/accounts/FilterBar";
import TransactionTable from "../components/accounts/TransactionTable";
import Button from "../components/common/Button";

export default function AccountDetailsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [accounts, setAccounts] = useState([]);
  const [activeAccount, setActiveAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  // Filter states
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const categories = [
    "Food & Dining",
    "Income",
    "Groceries",
    "Transfer",
    "Transportation",
    "Shopping",
    "Entertainment",
  ];

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const data = await accountService.getAccounts();
        setAccounts(data);

        const paramId = searchParams.get("id");
        const selected = data.find((acc) => acc.id === paramId) || data[0];
        if (selected) {
          setActiveAccount(selected);
          if (!paramId) {
            setSearchParams({ id: selected.id });
          }
        }
      } catch (err) {
        setError("Failed to load accounts.");
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, [searchParams]);

  useEffect(() => {
    if (!activeAccount) return;

    const fetchTransactions = async () => {
      setLoadingTransactions(true);
      try {
        const params = {
          search: search || undefined,
          category: category || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        };
        const data = await accountService.getTransactions(
          activeAccount.id,
          params,
        );
        setTransactions(data.transactions);
      } catch (err) {
        setError("Failed to load transactions.");
      } finally {
        setLoadingTransactions(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchTransactions();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [activeAccount, search, category, startDate, endDate]);

  const handleSelectAccount = (acc) => {
    setActiveAccount(acc);
    setSearchParams({ id: acc.id });
  };

  const handleExportCSV = async () => {
    if (!activeAccount) return;
    setExporting(true);
    setError("");
    try {
      const blobData = await accountService.exportTransactions(
        activeAccount.id,
      );
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `transactions_${activeAccount.id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError("Failed to export transactions.");
    } finally {
      setExporting(false);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-1">
            Accounts & Transactions
          </h1>
          <p className="text-sm text-on-surface-variant">
            View balances and search transaction history
          </p>
        </div>
        {activeAccount && (
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="flex items-center gap-2"
            disabled={exporting}
          >
            {exporting ? "Exporting..." : "Export to CSV"}
          </Button>
        )}
      </div>

      {error && (
        <div
          className="p-4 bg-error-container/20 border border-error text-error rounded-lg text-sm"
          role="alert"
        >
          {error}
        </div>
      )}

      <AccountSummary
        accounts={accounts}
        activeAccount={activeAccount}
        onSelectAccount={handleSelectAccount}
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        categories={categories}
      />

      <TransactionTable
        transactions={transactions}
        loading={loadingTransactions}
      />
    </div>
  );
}
