import React from 'react';

export default function AuditTimeline({ logs }) {
  const formatTimestamp = (ts) => {
    if (!ts) return '';
    try {
      const date = new Date(ts);
      return `${date.toISOString().split('T')[0]} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (e) {
      return ts;
    }
  };

  return (
    <div className="glass-card rounded-xl border border-slate-700 overflow-hidden shadow-lg">
      <div className="px-md py-sm border-b border-slate-700 bg-[#1E293B]/80">
        <h3 className="text-lg font-semibold text-white">Immutable Audit Trail</h3>
      </div>
      <div className="p-md">
        {logs.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-md">No audit logs available.</p>
        ) : (
          <div className="relative border-l border-slate-700 ml-4 space-y-md">
            {logs.map((log) => (
              <div key={log.id} className="relative pl-6 group">
                {/* Timeline dot */}
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-slate-800 border-2 border-indigo-500 flex items-center justify-center group-hover:border-indigo-400 transition-colors">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                </div>
                
                <div className="space-y-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-xs">
                    <span className="text-sm font-semibold text-slate-200">{log.action}</span>
                    <span className="text-xs font-mono text-slate-500">{formatTimestamp(log.timestamp)}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/30 p-sm rounded border border-slate-800/50 font-mono">
                    {log.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}