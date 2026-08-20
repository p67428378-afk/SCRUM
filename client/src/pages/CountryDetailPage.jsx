import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCountryDetail, addInvestment } from "../services/api.js";
import Badge from "../components/common/Badge.jsx";
import {
  ArrowLeft,
  Building2,
  Users,
  Globe2,
  DollarSign,
  Plus,
  TrendingUp,
  AlertCircle,
  Calendar,
  Layers,
  X,
} from "lucide-react";

export default function CountryDetailPage() {
  const { id } = useParams();
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add Investment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assetName, setAssetName] = useState("");
  const [sector, setSector] = useState("Technology");
  const [amountUsd, setAmountUsd] = useState("");
  const [status, setStatus] = useState("Performing");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCountryDetail(id);
      setCountry(data);
    } catch (err) {
      console.error("Failed to load country details:", err);
      setError("Country not found or backend API error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetail();
    }
  }, [id]);

  const handleAddInvestment = async (e) => {
    e.preventDefault();
    if (!assetName.trim() || !amountUsd || isNaN(amountUsd)) {
      setFormError(
        "Please enter a valid asset name and numeric investment amount.",
      );
      return;
    }

    setSubmitLoading(true);
    setFormError(null);

    try {
      await addInvestment(id, {
        asset_name: assetName.trim(),
        sector,
        amount_usd: parseFloat(amountUsd),
        status,
        date_added: new Date().toISOString().split("T")[0],
      });

      // Refresh country details on success
      await fetchDetail();

      // Reset modal
      setAssetName("");
      setAmountUsd("");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to add investment:", err);
      setFormError("Failed to record investment. Please check input data.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-[#e3e8f0] rounded-xl p-12 text-center text-[#707a8c]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2"></div>
        <p className="text-sm font-medium">
          Loading country portfolio profile...
        </p>
      </div>
    );
  }

  if (error || !country) {
    return (
      <div className="bg-white border border-[#e3e8f0] rounded-xl p-12 text-center max-w-xl mx-auto my-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-800">
          Country Details Unavailable
        </h3>
        <p className="text-sm text-gray-600 my-2">
          {error || "Unable to locate country record."}
        </p>
        <Link
          to="/countries"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Country Explorer</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Back Nav & Action */}
      <div className="flex items-center justify-between">
        <Link
          to="/countries"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#707a8c] hover:text-[#171c29] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Country List</span>
        </Link>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#2663eb] text-white hover:bg-blue-700 font-semibold rounded-lg text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Asset Investment</span>
        </button>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white border border-[#e3e8f0] rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2663eb] font-extrabold text-xl">
              {country.code}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-[#171c29]">
                  {country.name}
                </h1>
                <Badge status={country.portfolio_status} />
              </div>
              <p className="text-sm text-[#707a8c] mt-0.5">
                Continent:{" "}
                <strong className="text-gray-800">
                  {country.continent_name}
                </strong>{" "}
                | Region: {country.region || "N/A"}
              </p>
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-4 text-right">
            <span className="text-xs font-semibold text-[#707a8c] uppercase tracking-wider block mb-0.5">
              Total Investment Allocation
            </span>
            <span className="text-2xl font-bold text-[#2663eb]">
              $
              {(country.total_investment_usd || 0).toLocaleString("en-US", {
                minimumFractionDigits: 0,
              })}
            </span>
          </div>
        </div>

        {/* Quick Country Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-gray-400 shrink-0" />
            <div>
              <span className="text-xs text-[#707a8c] block">Capital City</span>
              <span className="text-sm font-semibold text-[#171c29]">
                {country.capital || "—"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-400 shrink-0" />
            <div>
              <span className="text-xs text-[#707a8c] block">Population</span>
              <span className="text-sm font-semibold text-[#171c29]">
                {country.population
                  ? country.population.toLocaleString("en-US")
                  : "—"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Globe2 className="w-5 h-5 text-gray-400 shrink-0" />
            <div>
              <span className="text-xs text-[#707a8c] block">ISO Code</span>
              <span className="text-sm font-mono font-semibold text-[#171c29]">
                {country.code}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-gray-400 shrink-0" />
            <div>
              <span className="text-xs text-[#707a8c] block">
                Linked Assets Count
              </span>
              <span className="text-sm font-semibold text-[#171c29]">
                {country.investments ? country.investments.length : 0} Assets
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Investments Table */}
      <div className="bg-white border border-[#e3e8f0] rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#171c29]">
              Linked Portfolio Asset Investments
            </h3>
            <p className="text-xs text-[#707a8c] mt-0.5">
              Asset holdings and sector distribution in {country.name}
            </p>
          </div>
        </div>

        {!country.investments || country.investments.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <TrendingUp className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium">
              No portfolio investments added yet for {country.name}.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#2663eb] hover:underline"
            >
              <Plus className="w-4 h-4" />
              <span>Add first investment asset</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-[#707a8c] uppercase tracking-wider">
                  <th className="py-3.5 px-6">Asset Name</th>
                  <th className="py-3.5 px-4">Sector</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date Added</th>
                  <th className="py-3.5 px-6 text-right">Amount (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-[#171c29]">
                {country.investments.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6 font-semibold text-gray-900">
                      {inv.asset_name}
                    </td>
                    <td className="py-4 px-4 text-gray-600">{inv.sector}</td>
                    <td className="py-4 px-4">
                      <Badge status={inv.status} />
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-500">
                      {inv.date_added ||
                        (inv.created_at
                          ? new Date(inv.created_at).toLocaleDateString()
                          : "—")}
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-blue-700">
                      $
                      {(inv.amount_usd || 0).toLocaleString("en-US", {
                        minimumFractionDigits: 0,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Investment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="text-lg font-bold text-[#171c29]">
                Add Investment Asset
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddInvestment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Asset Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar Energy Farm Project"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2663eb] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Sector
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2663eb] focus:outline-none"
                >
                  <option value="Technology">Technology</option>
                  <option value="Renewable Energy">Renewable Energy</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Financial Services">Financial Services</option>
                  <option value="Real Estate">Real Estate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Investment Amount (USD)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  placeholder="e.g. 5000000"
                  value={amountUsd}
                  onChange={(e) => setAmountUsd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2663eb] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2663eb] focus:outline-none"
                >
                  <option value="Performing">Performing</option>
                  <option value="Watchlist">Watchlist</option>
                  <option value="Underperforming">Underperforming</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-4 py-2 text-sm font-semibold bg-[#2663eb] text-white hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50"
                >
                  {submitLoading ? "Saving..." : "Record Investment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
