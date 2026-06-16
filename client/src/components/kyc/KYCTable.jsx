import React from 'react';
import Badge from '../common/Badge';

export default function KYCTable({ requests, onViewDetails }) {
  const formatDate = (dateString) => {
    if (!dateString) return { date: '-', time: '' };
    try {
      const date = new Date(dateString);
      return {
        date: date.toISOString().split('T')[0],
        time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    } catch (e) {
      return { date: dateString, time: '' };
    }
  };

  return (
    <div className="glass-card rounded-xl border border-slate-700 overflow-hidden shadow-lg">
      <div className="px-md py-sm border-b border-slate-700 bg-[#1E293B]/80 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Recent KYC Onboarding Requests</h3>
        <button className="text-slate-400 hover:text-slate-200 transition-colors">
          <span className="material-symbols-outlined text-[20px]">more_horiz</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-900 border-b border-slate-700 text-xs text-slate-400 uppercase tracking-wider font-semibold">
              <th className="px-md py-sm">Request ID</th>
              <th className="px-md py-sm">Customer</th>
              <th className="px-md py-sm text-center">Aadhaar</th>
              <th className="px-md py-sm text-center">PAN</th>
              <th className="px-md py-sm text-center">Risk Intel</th>
              <th className="px-md py-sm text-center">Status</th>
              <th className="px-md py-sm text-right">Created At</th>
              <th className="px-md py-sm text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm text-slate-300 divide-y divide-slate-800">
            {requests.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-md py-lg text-center text-slate-500">
                  No KYC requests found.
                </td>
              </tr>
            ) : (
              requests.map((req) => {
                const { date, time } = formatDate(req.created_at);
                return (
                  <tr key={req.id} className="hover:bg-slate-800/50 transition-colors group">
                    <td className="px-md py-sm font-mono text-indigo-400 font-medium">
                      #{req.id.substring(0, 8)}
                    </td>
                    <td className="px-md py-sm font-medium text-slate-200">
                      {req.customer_name}
                    </td>
                    <td className="px-md py-sm text-center">
                      <span
                        className={`inline-flex items-center gap-[2px] ${
                          req.aadhaar_status === 'VERIFIED' ? 'text-green-400' : 'text-yellow-500'
                        }`}
                        title={req.aadhaar_status}
                      >
                        <span className="material-symbols-outlined text-[16px] icon-fill">
                          {req.aadhaar_status === 'VERIFIED' ? 'check_circle' : 'schedule'}
                        </span>
                      </span>
                    </td>
                    <td className="px-md py-sm text-center">
                      <span
                        className={`inline-flex items-center gap-[2px] ${
                          req.pan_status === 'VERIFIED' ? 'text-green-400' : 'text-yellow-500'
                        }`}
                        title={req.pan_status}
                      >
                        <span className="material-symbols-outlined text-[16px] icon-fill">
                          {req.pan_status === 'VERIFIED' ? 'check_circle' : 'schedule'}
                        </span>
                      </span>
                    </td>
                    <td className="px-md py-sm text-center">
                      <div className="flex items-center justify-center gap-xs">
                        <span
                          className={`px-xs py-[2px] rounded text-[10px] uppercase font-bold tracking-wide border ${
                            req.rbi_status === 'CLEARED'
                              ? 'bg-green-500/10 text-green-500 border-green-500/20'
                              : 'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}
                          title={`RBI: ${req.rbi_status}`}
                        >
                          RBI {req.rbi_status === 'CLEARED' ? '✓' : '✗'}
                        </span>
                        <span
                          className={`px-xs py-[2px] rounded text-[10px] uppercase font-bold tracking-wide border ${
                            req.cibil_status === 'CLEARED'
                              ? 'bg-green-500/10 text-green-500 border-green-500/20'
                              : 'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}
                          title={`CIBIL: ${req.cibil_status}`}
                        >
                          CBL {req.cibil_status === 'CLEARED' ? '✓' : '✗'}
                        </span>
                      </div>
                    </td>
                    <td className="px-md py-sm text-center">
                      <Badge status={req.final_status} />
                    </td>
                    <td className="px-md py-sm text-right font-mono text-[12px] text-slate-400">
                      <div>{date}</div>
                      <div className="text-slate-500">{time}</div>
                    </td>
                    <td className="px-md py-sm text-center">
                      <button
                        onClick={() => onViewDetails(req.id)}
                        className="text-slate-400 hover:text-indigo-400 transition-colors"
                        title="View Details"
                      >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}