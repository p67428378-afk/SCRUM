import React, { useState } from "react";
import PropTypes from "prop-types";
import { Tags, ShieldCheck, UserCheck, Calendar } from "lucide-react";

export default function CategoryDirectoryTable({ categories, loading }) {
  const [filterType, setFilterType] = useState("all");

  const filteredCategories = (categories || []).filter((cat) => {
    if (filterType === "all") return true;
    return cat.type === filterType || cat.type === "both";
  });

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2663EB] flex items-center justify-center">
            <Tags className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#171C29]">
              Categories Directory
            </h3>
            <p className="text-xs text-[#707A8C]">
              Available categories for transaction tagging
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
          {["all", "expense", "income"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-lg capitalize transition ${
                filterType === t
                  ? "bg-white text-[#2663EB] font-bold shadow-sm"
                  : "text-[#707A8C] hover:text-[#171C29]"
              }`}
            >
              {t === "all" ? "All Types" : t}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[#171C29]">
          <thead className="bg-gray-50/80 text-xs font-semibold text-[#707A8C] uppercase tracking-wider border-b border-gray-100">
            <tr>
              <th scope="col" className="px-6 py-3.5">
                Category Name
              </th>
              <th scope="col" className="px-6 py-3.5">
                Type
              </th>
              <th scope="col" className="px-6 py-3.5">
                Origin
              </th>
              <th scope="col" className="px-6 py-3.5">
                Created Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCategories.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-xs text-[#707A8C]"
                >
                  No categories found matching this filter.
                </td>
              </tr>
            ) : (
              filteredCategories.map((cat) => {
                const isIncome = cat.type === "income";
                const isBoth = cat.type === "both";

                return (
                  <tr key={cat.id} className="hover:bg-gray-50/60 transition">
                    <td className="px-6 py-4 font-semibold text-[#171C29]">
                      {cat.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${
                          isBoth
                            ? "bg-purple-50 text-purple-700"
                            : isIncome
                              ? "bg-emerald-50 text-[#17A34A]"
                              : "bg-red-50 text-[#DB2626]"
                        }`}
                      >
                        {cat.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      {cat.is_predefined ? (
                        <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md font-medium">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#2663EB]" />
                          Predefined
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-medium">
                          <UserCheck className="w-3.5 h-3.5 text-[#2663EB]" />
                          Custom
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-[#707A8C]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{formatDate(cat.created_at)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3.5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs text-[#707A8C]">
        <span>Total categories: {filteredCategories.length}</span>
      </div>
    </div>
  );
}

CategoryDirectoryTable.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      is_predefined: PropTypes.bool.isRequired,
      created_at: PropTypes.string,
    }),
  ).isRequired,
  loading: PropTypes.bool,
};

CategoryDirectoryTable.defaultProps = {
  loading: false,
};
