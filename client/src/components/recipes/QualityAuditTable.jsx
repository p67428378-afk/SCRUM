import React from "react";
import { Star, Clock } from "lucide-react";

export default function QualityAuditTable({
  logs = [],
  recipes = [],
  teas = [],
}) {
  const getTeaNameForLog = (log) => {
    const recipe = recipes.find((r) => r.id === log.recipe_id);
    if (recipe) {
      const tea = teas.find((t) => t.id === recipe.tea_id);
      if (tea) return tea.name;
    }
    return log.tea_name || "Brewed Tea";
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return new Date().toLocaleString();
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-sm flex items-center">
          <Clock className="w-4 h-4 text-emerald-700 mr-2" />
          Brewing Quality Audit Log History
        </h3>
        <span className="text-xs text-gray-500 font-medium">
          {logs.length} Total Entries
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-xs font-bold tracking-wider border-b border-gray-200">
              <th className="py-3 px-4">Brew Time</th>
              <th className="py-3 px-4">Tea Variety</th>
              <th className="py-3 px-4">Rating</th>
              <th className="py-3 px-4">Quality Feedback</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-xs">
            {logs.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-6 text-center text-gray-500">
                  No quality logs recorded yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id || log.created_at} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-500 font-mono">
                    {formatTimestamp(log.brewed_at || log.created_at)}
                  </td>
                  <td className="py-3 px-4 font-bold text-gray-900">
                    {getTeaNameForLog(log)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current mr-1" />
                      <span>{log.rating} / 5</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-700 italic">
                    "{log.feedback || "No comments provided."}"
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
