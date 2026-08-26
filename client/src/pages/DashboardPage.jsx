import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  AlertCircle,
  Plus,
  X,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import MetricGroup from "../components/dashboard/MetricGroup";
import SpendingBreakdownCard from "../components/dashboard/SpendingBreakdownCard";
import RecentTransactionsCard from "../components/dashboard/RecentTransactionsCard";
import {
  getSummary,
  getExpenses,
  getCategories,
  createExpense,
  formatApiError,
} from "../services/api";

export default function DashboardPage() {
  const [period, setPeriod] = useState("monthly");
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const [formSuccess, setFormSuccess] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, expensesRes, categoriesRes] = await Promise.all([
        getSummary({ period }),
        getExpenses({ limit: 10 }),
        getCategories(),
      ]);
      setSummary(summaryRes);
      setTransactions(expensesRes);
      setCategories(categoriesRes);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openAddModal = (type) => {
    setModalType(type);
    const validCategories = categories.filter(
      (c) => c.type === type || c.type === "both",
    );
    setFormData({
      amount: "",
      description: "",
      category_id: validCategories.length > 0 ? validCategories[0].id : "",
      date: new Date().toISOString().split("T")[0],
      payment_method: "Credit Card",
    });
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

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
      await createExpense({
        amount: numAmount,
        type: modalType,
        date: formData.date,
        description: formData.description.trim(),
        category_id: formData.category_id,
        payment_method: formData.payment_method || null,
      });

      setFormSuccess("Transaction recorded successfully!");
      setTimeout(() => {
        setIsModalOpen(false);
        fetchData();
      }, 500);
    } catch (err) {
      setFormError(formatApiError(err));
    } finally {
      setFormSubmitting(false);
    }
  };

  const filteredCategoriesForModal = categories.filter(
    (c) => c.type === modalType || c.type === "both",
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171C29] tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-sm text-[#707A8C] mt-1">
            Real-time insights on your income, expenses, and savings balance.
          </p>
        </div>

        {/* Period Selector & Quick Add */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white p-1 rounded-xl border border-gray-200 shadow-sm text-xs font-medium">
            <Calendar className="w-4 h-4 ml-2 mr-1 text-[#707A8C]" />
            {["daily", "monthly", "yearly", "all"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg capitalize transition ${
                  period === p
                    ? "bg-[#2663EB] text-white font-semibold shadow-sm"
                    : "text-[#707A8C] hover:text-[#171C29]"
                }`}
              >
                {p === "all" ? "All Time" : p}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => openAddModal("expense")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2663EB] text-white text-xs sm:text-sm font-semibold hover:bg-blue-700 shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Record Entry</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Metrics */}
      <section aria-label="Financial Metrics">
        <MetricGroup summary={summary} loading={loading} />
      </section>

      {/* Analytics & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 w-full">
          <SpendingBreakdownCard
            breakdown={summary?.category_breakdown}
            totalExpense={summary?.total_expense}
            loading={loading}
          />
        </div>

        <div className="lg:col-span-7 w-full">
          <RecentTransactionsCard
            transactions={transactions}
            categories={categories}
            loading={loading}
            onAddIncome={() => openAddModal("income")}
            onAddExpense={() => openAddModal("expense")}
          />
        </div>
      </div>

      {/* Add / Record Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    modalType === "income"
                      ? "bg-emerald-50 text-[#17A34A]"
                      : "bg-red-50 text-[#DB2626]"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#171C29]">
                  {modalType === "income" ? "Record Income" : "Record Expense"}
                </h3>
              </div>
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

              {formSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{formSuccess}</span>
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
                    htmlFor="dashboard-amount-input"
                    className="block text-xs font-semibold text-[#171C29] mb-1.5"
                  >
                    Amount ($) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="dashboard-amount-input"
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
                    htmlFor="dashboard-date-input"
                    className="block text-xs font-semibold text-[#171C29] mb-1.5"
                  >
                    Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="dashboard-date-input"
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
                  htmlFor="dashboard-desc-input"
                  className="block text-xs font-semibold text-[#171C29] mb-1.5"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  id="dashboard-desc-input"
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
                    htmlFor="dashboard-category-select"
                    className="block text-xs font-semibold text-[#171C29] mb-1.5"
                  >
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="dashboard-category-select"
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
                    htmlFor="dashboard-payment-select"
                    className="block text-xs font-semibold text-[#171C29] mb-1.5"
                  >
                    Payment Method
                  </label>
                  <select
                    id="dashboard-payment-select"
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
                  {formSubmitting ? "Saving..." : "Save Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
