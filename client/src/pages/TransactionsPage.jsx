import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Receipt,
  X,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import FilterBar from "../components/transactions/FilterBar";
import TransactionsTable from "../components/transactions/TransactionsTable";
import {
  getExpenses,
  getCategories,
  createExpense,
  updateExpense,
  deleteExpense,
  formatApiError,
} from "../services/api";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modal State (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [modalType, setModalType] = useState("expense");
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category_id: "",
    date: new Date().toISOString().split("T")[0],
    payment_method: "Credit Card",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete State
  const [deletingTx, setDeletingTx] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getExpenses({
        search: search.trim() || undefined,
        category_id: categoryId || undefined,
        type: type || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        limit: 200,
      });
      setTransactions(data);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, [search, categoryId, type, startDate, endDate]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch {
      // Handled silently or by main error
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchTransactions]);

  const handleResetFilters = () => {
    setSearch("");
    setCategoryId("");
    setType("");
    setStartDate("");
    setEndDate("");
  };

  const openCreateModal = () => {
    setEditingTransaction(null);
    setModalType("expense");
    const validCategories = categories.filter(
      (c) => c.type === "expense" || c.type === "both",
    );
    setFormData({
      amount: "",
      description: "",
      category_id: validCategories.length > 0 ? validCategories[0].id : "",
      date: new Date().toISOString().split("T")[0],
      payment_method: "Credit Card",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tx) => {
    setEditingTransaction(tx);
    setModalType(tx.type);
    setFormData({
      amount: String(tx.amount),
      description: tx.description,
      category_id: tx.category_id,
      date: tx.date,
      payment_method: tx.payment_method || "Credit Card",
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError("Amount must be a positive number greater than 0.");
      return;
    }

    if (!formData.description.trim()) {
      setFormError("Description is required.");
      return;
    }

    if (!formData.category_id) {
      setFormError("Please select a category.");
      return;
    }

    setFormSubmitting(true);
    try {
      const payload = {
        amount: numAmount,
        type: modalType,
        date: formData.date,
        description: formData.description.trim(),
        category_id: formData.category_id,
        payment_method: formData.payment_method || null,
      };

      if (editingTransaction) {
        await updateExpense(editingTransaction.id, payload);
      } else {
        await createExpense(payload);
      }

      setIsModalOpen(false);
      fetchTransactions();
    } catch (err) {
      setFormError(formatApiError(err));
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTx) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deleteExpense(deletingTx.id);
      setDeletingTx(null);
      fetchTransactions();
    } catch (err) {
      setDeleteError(formatApiError(err));
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredCategoriesForModal = categories.filter(
    (c) => c.type === modalType || c.type === "both",
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2663EB] flex items-center justify-center shadow-sm">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171C29] tracking-tight">
              Transactions Ledger
            </h1>
            <p className="text-sm text-[#707A8C]">
              Manage, search, and categorize all income and expense items.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2663EB] text-white text-sm font-semibold hover:bg-blue-700 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Component */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        type={type}
        onTypeChange={setType}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        categories={categories}
        onReset={handleResetFilters}
      />

      {/* Transactions Table Component */}
      <TransactionsTable
        transactions={transactions}
        categories={categories}
        loading={loading}
        onEdit={openEditModal}
        onDelete={(tx) => setDeletingTx(tx)}
      />

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-[#171C29]">
                {editingTransaction
                  ? "Edit Transaction"
                  : "Add New Transaction"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-semibold text-[#171C29] mb-1.5">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setModalType("expense");
                      const cats = categories.filter(
                        (c) => c.type === "expense" || c.type === "both",
                      );
                      if (cats.length > 0)
                        setFormData((prev) => ({
                          ...prev,
                          category_id: cats[0].id,
                        }));
                    }}
                    className={`py-2 rounded-lg text-xs font-bold transition ${
                      modalType === "expense"
                        ? "bg-white text-[#DB2626] shadow-sm"
                        : "text-[#707A8C]"
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalType("income");
                      const cats = categories.filter(
                        (c) => c.type === "income" || c.type === "both",
                      );
                      if (cats.length > 0)
                        setFormData((prev) => ({
                          ...prev,
                          category_id: cats[0].id,
                        }));
                    }}
                    className={`py-2 rounded-lg text-xs font-bold transition ${
                      modalType === "income"
                        ? "bg-white text-[#17A34A] shadow-sm"
                        : "text-[#707A8C]"
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Amount and Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="tx-amount-input"
                    className="block text-xs font-semibold text-[#171C29] mb-1.5"
                  >
                    Amount ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="tx-amount-input"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="tx-date-input"
                    className="block text-xs font-semibold text-[#171C29] mb-1.5"
                  >
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="tx-date-input"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="tx-description-input"
                  className="block text-xs font-semibold text-[#171C29] mb-1.5"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  id="tx-description-input"
                  type="text"
                  placeholder="e.g. Grocery Shopping, Monthly Salary..."
                  maxLength={255}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition"
                  required
                />
              </div>

              {/* Category & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="tx-category-select"
                    className="block text-xs font-semibold text-[#171C29] mb-1.5"
                  >
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="tx-category-select"
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition text-[#171C29]"
                    required
                  >
                    <option value="" disabled>
                      Select Category
                    </option>
                    {filteredCategoriesForModal.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="tx-payment-select"
                    className="block text-xs font-semibold text-[#171C29] mb-1.5"
                  >
                    Payment Method
                  </label>
                  <select
                    id="tx-payment-select"
                    value={formData.payment_method}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        payment_method: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition text-[#171C29]"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI / Online">UPI / Online</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-[#707A8C] hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#2663EB] text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
                >
                  {formSubmitting
                    ? "Saving..."
                    : editingTransaction
                      ? "Update Entry"
                      : "Save Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#171C29]">
                  Delete Transaction
                </h3>
                <p className="text-xs text-[#707A8C]">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            {deleteError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <p className="text-sm text-[#707A8C] mb-6">
              Are you sure you want to delete transaction{" "}
              <strong className="text-[#171C29]">
                "{deletingTx.description}"
              </strong>{" "}
              for{" "}
              <strong className="text-[#171C29]">${deletingTx.amount}</strong>?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingTx(null)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#707A8C] hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="px-5 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition shadow-sm"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
