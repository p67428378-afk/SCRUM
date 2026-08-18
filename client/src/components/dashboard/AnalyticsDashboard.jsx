import React, { useEffect, useState } from "react";
import { getAnalyticsSummary } from "../../services/api";
import Card from "../common/Card";
import Badge from "../common/Badge";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await getAnalyticsSummary();
      setData(summary);
    } catch (err) {
      console.error("Error fetching analytics summary:", err);
      setError(
        "Failed to load analytics summary. Make sure the backend server is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-[#80756B]">
        <RefreshCw className="w-6 h-6 animate-spin mr-2 text-[#D96B1F]" />
        <span>Loading sales & bakery analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-[#D92D2D] rounded-md text-sm flex items-center justify-between">
        <span>{error}</span>
        <button
          onClick={fetchSummary}
          className="px-3 py-1 bg-[#D96B1F] text-white rounded text-xs hover:bg-[#B85310]"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F1A14]">
            Bakery Sales & Operations
          </h1>
          <p className="text-sm text-[#80756B]">
            Real-time overview of revenue, orders, and stock health
          </p>
        </div>
        <button
          onClick={fetchSummary}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-white border border-[#E5DED1] text-[#1F1A14] text-xs font-medium rounded-md hover:bg-[#FAF7F2] transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Revenue */}
        <Card className="border-l-4 border-l-[#D96B1F]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-medium text-[#80756B]">
                Daily Revenue
              </p>
              <p className="text-2xl font-bold text-[#1F1A14] mt-1">
                ${data.daily_revenue.toFixed(2)}
              </p>
              <p className="text-[11px] text-[#80756B] mt-1">
                Total: ${data.total_revenue.toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-orange-50 text-[#D96B1F] rounded-full">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Instant Orders */}
        <Card className="border-l-4 border-l-[#1F9E4D]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-medium text-[#80756B]">
                Instant POS Sales
              </p>
              <p className="text-2xl font-bold text-[#1F1A14] mt-1">
                {data.instant_orders_count}
              </p>
              <p className="text-[11px] text-[#80756B] mt-1">
                Completed counter sales
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-[#1F9E4D] rounded-full">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Active Pre-Orders */}
        <Card className="border-l-4 border-l-[#EB9414]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-medium text-[#80756B]">
                Active Pre-Orders
              </p>
              <p className="text-2xl font-bold text-[#1F1A14] mt-1">
                {data.active_pre_orders_count}
              </p>
              <p className="text-[11px] text-[#80756B] mt-1">
                Pending or in production
              </p>
            </div>
            <div className="p-3 bg-amber-50 text-[#EB9414] rounded-full">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </Card>

        {/* Low Stock Ingredients */}
        <Card
          className={`border-l-4 ${data.low_stock_ingredients_count > 0 ? "border-l-[#D92D2D]" : "border-l-[#1F9E4D]"}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-medium text-[#80756B]">
                Low Stock Alerts
              </p>
              <p className="text-2xl font-bold text-[#1F1A14] mt-1">
                {data.low_stock_ingredients_count}
              </p>
              <p className="text-[11px] text-[#80756B] mt-1">
                Ingredients below reorder threshold
              </p>
            </div>
            <div
              className={`p-3 rounded-full ${data.low_stock_ingredients_count > 0 ? "bg-red-50 text-[#D92D2D]" : "bg-emerald-50 text-[#1F9E4D]"}`}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Top Selling Products */}
      <Card
        title="Top Selling Bakery Items"
        subtitle="Best performing items by quantity sold"
      >
        {data.top_selling_items && data.top_selling_items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E5DED1] text-sm">
              <thead>
                <tr className="bg-[#FAF7F2] text-left text-xs uppercase font-semibold text-[#80756B]">
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3 text-center">Units Sold</th>
                  <th className="px-4 py-3 text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DED1]">
                {data.top_selling_items.map((item) => (
                  <tr
                    key={item.product_id}
                    className="hover:bg-[#FAF7F2] transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-[#1F1A14]">
                      {item.product_name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="primary">
                        {item.total_quantity_sold} sold
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-[#1F1A14]">
                      ${item.total_revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[#80756B] italic py-4 text-center">
            No sales recorded yet today.
          </p>
        )}
      </Card>
    </div>
  );
}
