import React from "react";
import PropTypes from "prop-types";
import { DollarSign, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";

export default function MetricGroup({ summary, loading }) {
  const totalIncome = summary?.total_income ?? 0;
  const totalExpense = summary?.total_expense ?? 0;
  const netBalance = summary?.net_balance ?? 0;

  const savingsRate =
    totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : "0.0";

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(val);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse flex flex-col gap-3"
          >
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      id: "net-balance",
      label: "Net Balance",
      value: formatCurrency(netBalance),
      icon: DollarSign,
      textColor: netBalance >= 0 ? "text-[#17A34A]" : "text-[#DB2626]",
      bgColor: netBalance >= 0 ? "bg-emerald-50" : "bg-red-50",
      iconColor: netBalance >= 0 ? "text-[#17A34A]" : "text-[#DB2626]",
      subtext: netBalance >= 0 ? "Surplus Available" : "Deficit Recorded",
    },
    {
      id: "total-income",
      label: "Total Income",
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      textColor: "text-[#17A34A]",
      bgColor: "bg-emerald-50",
      iconColor: "text-[#17A34A]",
      subtext: "Incoming Cashflow",
    },
    {
      id: "total-expenses",
      label: "Total Expenses",
      value: formatCurrency(totalExpense),
      icon: TrendingDown,
      textColor: "text-[#DB2626]",
      bgColor: "bg-red-50",
      iconColor: "text-[#DB2626]",
      subtext: "Outgoing Outflows",
    },
    {
      id: "savings-rate",
      label: "Savings Rate",
      value: `${savingsRate}%`,
      icon: PiggyBank,
      textColor: "text-[#2663EB]",
      bgColor: "bg-blue-50",
      iconColor: "text-[#2663EB]",
      subtext: "Of Total Income Saved",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div
            key={m.id}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#707A8C] uppercase tracking-wider">
                {m.label}
              </span>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.bgColor} ${m.iconColor}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div
                className={`text-2xl font-bold tracking-tight ${m.textColor}`}
              >
                {m.value}
              </div>
              <p className="text-xs font-medium text-[#707A8C] mt-1">
                {m.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

MetricGroup.propTypes = {
  summary: PropTypes.shape({
    total_income: PropTypes.number,
    total_expense: PropTypes.number,
    net_balance: PropTypes.number,
    category_breakdown: PropTypes.arrayOf(
      PropTypes.shape({
        category_id: PropTypes.string,
        category_name: PropTypes.string,
        amount: PropTypes.number,
        percentage: PropTypes.number,
      }),
    ),
  }),
  loading: PropTypes.bool,
};

MetricGroup.defaultProps = {
  summary: {
    total_income: 0,
    total_expense: 0,
    net_balance: 0,
    category_breakdown: [],
  },
  loading: false,
};
