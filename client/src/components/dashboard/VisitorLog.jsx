import React from "react";
import Badge from "../common/Badge.jsx";

export default function VisitorLog({ visitors = [] }) {
  return (
    <div className="card-surface p-6 w-full overflow-x-auto">
      <h3 className="text-lg font-semibold text-slate-200 mb-4">
        Recent Visitor Log
      </h3>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <th className="py-3 px-4">Visitor Name</th>
            <th className="py-3 px-4">Expected Arrival</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Actual Arrival</th>
            <th className="py-3 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="text-sm text-slate-300 divide-y divide-slate-800">
          {visitors.length === 0 ? (
            <tr>
              <td colSpan="5" className="py-4 text-center text-slate-400">
                No visitors logged yet.
              </td>
            </tr>
          ) : (
            visitors.map((visitor) => (
              <tr
                key={visitor.id}
                className="hover:bg-slate-800/50 transition-colors"
              >
                <td className="py-4 px-4 font-medium text-slate-200">
                  {visitor.name}
                </td>
                <td className="py-4 px-4">
                  {new Date(visitor.expected_arrival).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="py-4 px-4">
                  <Badge status={visitor.status} />
                </td>
                <td className="py-4 px-4 text-slate-400">
                  {visitor.actual_arrival
                    ? new Date(visitor.actual_arrival).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "--"}
                </td>
                <td className="py-4 px-4 text-right">
                  <button className="text-[#6366F1] hover:text-[#4f46e5] text-xs font-semibold uppercase tracking-wider">
                    View Details
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
