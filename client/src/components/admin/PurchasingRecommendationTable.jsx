import React from "react";
import {
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import Badge from "../common/Badge";

export const PurchasingRecommendationTable = ({
  genres = [],
  books = [],
  avgTurnaround = 0,
}) => {
  const genreList = Array.isArray(genres) ? genres : [];
  const bookList = Array.isArray(books) ? books : [];

  // Group books stock by genre
  const stockByGenre = bookList.reduce((acc, book) => {
    const g = book.genre || "Uncategorized";
    if (!acc[g]) {
      acc[g] = { total: 0, available: 0, titles: 0 };
    }
    acc[g].total += book.total_copies || 0;
    acc[g].available += book.available_copies || 0;
    acc[g].titles += 1;
    return acc;
  }, {});

  // Combine analytics genres with stock data
  const combinedData = genreList.map((item) => {
    const genreName = item.genre || "General";
    const stock = stockByGenre[genreName] || {
      total: 0,
      available: 0,
      titles: 0,
    };
    const checkouts = item.checkout_count || 0;

    // Determine recommendation
    let status = "Sufficient";
    let badgeVariant = "success";
    let recommendation = "Maintain current stock level";

    const availRatio = stock.total > 0 ? stock.available / stock.total : 0;

    if (checkouts >= 5 || (stock.total > 0 && availRatio < 0.25)) {
      status = "High Demand";
      badgeVariant = "danger";
      recommendation = "High circulation — Order additional copies";
    } else if (checkouts >= 2 || availRatio < 0.5) {
      status = "Moderate Demand";
      badgeVariant = "warning";
      recommendation = "Moderate interest — Monitor inventory levels";
    }

    return {
      genre: genreName,
      checkouts,
      titles: stock.titles,
      totalCopies: stock.total,
      availableCopies: stock.available,
      status,
      badgeVariant,
      recommendation,
    };
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag size={20} className="text-purple-600" />
            <span>Purchasing & Inventory Recommendations</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Data-driven purchasing guidance calculated from checkout frequency
            and copy turnover
          </p>
        </div>
        {typeof avgTurnaround === "number" && avgTurnaround > 0 && (
          <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-100 text-xs font-medium">
            <TrendingUp size={16} />
            <span>Avg Loan Turnaround: {avgTurnaround.toFixed(1)} days</span>
          </div>
        )}
      </div>

      {combinedData.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          No purchasing recommendation data available.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Genre Category</th>
                <th className="py-3 px-4">Checkout Volume</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Demand Status</th>
                <th className="py-3 px-4">Purchasing Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {combinedData.map((row) => (
                <tr
                  key={row.genre}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {row.genre}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {row.checkouts} loans
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="font-semibold text-slate-800">
                      {row.availableCopies}
                    </span>{" "}
                    / {row.totalCopies} available
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={row.badgeVariant}>
                      {row.status === "High Demand" && (
                        <AlertTriangle size={12} className="mr-1 inline" />
                      )}
                      {row.status === "Sufficient" && (
                        <CheckCircle2 size={12} className="mr-1 inline" />
                      )}
                      {row.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                    {row.recommendation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PurchasingRecommendationTable;
