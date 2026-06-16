import React from 'react';

export default function Badge({ status, className = '' }) {
  const normalizedStatus = (status || '').toUpperCase();

  const styles = {
    APPROVED: 'bg-green-500/10 text-green-500 border-green-500/20',
    VERIFIED: 'bg-green-500/10 text-green-500 border-green-500/20',
    CLEARED: 'bg-green-500/10 text-green-500 border-green-500/20',
    
    FLAGGED: 'bg-red-500/10 text-red-500 border-red-500/20',
    FAILED: 'bg-red-500/10 text-red-500 border-red-500/20',
    
    PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    SCHEDULE: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  };

  const currentStyle = styles[normalizedStatus] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  return (
    <span className={`inline-flex px-sm py-[2px] rounded-full font-semibold text-[10px] uppercase tracking-wide border ${currentStyle} ${className}`}>
      {status}
    </span>
  );
}