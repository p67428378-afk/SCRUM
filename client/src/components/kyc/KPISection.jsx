import React from 'react';

export default function KPISection({ stats }) {
  const { total = 0, approved = 0, flagged = 0, pending = 0 } = stats || {};

  const approvedPercent = total > 0 ? ((approved / total) * 100).toFixed(1) : '0.0';
  const flaggedPercent = total > 0 ? ((flagged / total) * 100).toFixed(1) : '0.0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
      {/* Card 1 */}
      <div className="glass-card rounded-xl p-md flex flex-col justify-between relative overflow-hidden group hover:border-slate-500 transition-colors">
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
        <div className="flex justify-between items-start mb-md">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Requests</span>
          <span className="material-symbols-outlined text-slate-500 text-[20px]">group_add</span>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-bold text-white font-mono">{total.toLocaleString()}</span>
          <div className="flex items-center text-green-400 bg-green-400/10 px-xs py-[2px] rounded text-xs font-medium">
            <span className="material-symbols-outlined text-[14px]">trending_up</span>
            <span className="ml-[2px]">+15%</span>
          </div>
        </div>
      </div>

      {/* Card 2 */}
      <div className="glass-card rounded-xl p-md flex flex-col justify-between relative overflow-hidden group hover:border-slate-500 transition-colors">
        <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
        <div className="flex justify-between items-start mb-md">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Approved KYC</span>
          <span className="material-symbols-outlined text-green-500 text-[20px]">verified_user</span>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-bold text-white font-mono">{approved.toLocaleString()}</span>
          <div className="flex items-center text-slate-400 text-xs font-medium">
            <span>{approvedPercent}%</span>
          </div>
        </div>
      </div>

      {/* Card 3 */}
      <div className="glass-card rounded-xl p-md flex flex-col justify-between relative overflow-hidden group hover:border-slate-500 transition-colors">
        <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
        <div className="flex justify-between items-start mb-md">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Flagged Risks</span>
          <span className="material-symbols-outlined text-red-500 text-[20px]">warning</span>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-bold text-red-400 font-mono">{flagged.toLocaleString()}</span>
          <div className="flex items-center text-slate-400 text-xs font-medium">
            <span>{flaggedPercent}%</span>
          </div>
        </div>
      </div>

      {/* Card 4 */}
      <div className="glass-card rounded-xl p-md flex flex-col justify-between relative overflow-hidden group hover:border-slate-500 transition-colors">
        <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
        <div className="flex justify-between items-start mb-md">
          <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Pending Verif.</span>
          <span className="material-symbols-outlined text-yellow-500 text-[20px]">pending_actions</span>
        </div>
        <div className="flex items-end justify-between">
          <span className="text-3xl font-bold text-yellow-400 font-mono">{pending.toLocaleString()}</span>
          <div className="flex items-center text-slate-400 text-xs font-medium">
            <span>Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}