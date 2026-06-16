import React, { useState, useEffect } from 'react';
import AuditTimeline from '../components/kyc/AuditTimeline';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { kycService } from '../services/api';

export default function DetailPage({ requestId, onNavigate }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await kycService.getRequestDetail(requestId);
        setDetail(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching request detail:', err);
        setError('Failed to load KYC request details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchDetail();
    }
  }, [requestId]);

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-lg text-center text-slate-400">
        Loading KYC request details...
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="space-y-md">
        <Button onClick={() => onNavigate('dashboard')} variant="secondary" icon="arrow_back">
          Back to Dashboard
        </Button>
        <div className="glass-card rounded-xl p-lg text-center text-red-400 border border-red-500/20">
          {error || 'Request not found.'}
        </div>
      </div>
    );
  }

  const { customer, verification, screening, audit_logs = [] } = detail;

  return (
    <div className="space-y-lg">
      {/* Page Header */}
      <div className="flex flex-col gap-sm md:flex-row md:items-end justify-between mb-lg">
        <div className="flex items-center gap-md">
          <Button
            onClick={() => onNavigate('dashboard')}
            variant="secondary"
            className="px-sm py-sm"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Button>
          <div>
            <div className="flex items-center gap-sm">
              <h2 className="text-2xl font-bold text-white">KYC Request Details</h2>
              <Badge status={detail.status} />
            </div>
            <p className="text-sm text-slate-400 mt-xs">ID: #{detail.id}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Left Column: Customer & Verification Info */}
        <div className="lg:col-span-2 space-y-lg">
          {/* Customer Profile */}
          <div className="glass-card rounded-xl border border-slate-700 overflow-hidden shadow-lg">
            <div className="px-md py-sm border-b border-slate-700 bg-[#1E293B]/80">
              <h3 className="text-lg font-semibold text-white">Customer Profile</h3>
            </div>
            <div className="p-md grid grid-cols-1 sm:grid-cols-2 gap-md text-sm">
              <div>
                <span className="text-slate-500 block text-xs font-semibold uppercase tracking-wider mb-xs">Full Name</span>
                <span className="text-slate-200 font-medium">{customer?.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs font-semibold uppercase tracking-wider mb-xs">Email Address</span>
                <span className="text-slate-200 font-medium">{customer?.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs font-semibold uppercase tracking-wider mb-xs">Phone Number</span>
                <span className="text-slate-200 font-medium">{customer?.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs font-semibold uppercase tracking-wider mb-xs">Aadhaar Number</span>
                <span className="text-slate-200 font-mono font-medium">{customer?.aadhaar_number}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 block text-xs font-semibold uppercase tracking-wider mb-xs">PAN Number</span>
                <span className="text-slate-200 font-mono font-medium uppercase">{customer?.pan_number}</span>
              </div>
            </div>
          </div>

          {/* Verification & Screening Results */}
          <div className="glass-card rounded-xl border border-slate-700 overflow-hidden shadow-lg">
            <div className="px-md py-sm border-b border-slate-700 bg-[#1E293B]/80">
              <h3 className="text-lg font-semibold text-white">Verification & Screening Results</h3>
            </div>
            <div className="p-md space-y-md">
              {/* Aadhaar */}
              <div className="flex items-center justify-between p-sm bg-slate-900/30 rounded border border-slate-800/50">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-indigo-500">fingerprint</span>
                  <div>
                    <span className="text-sm font-semibold text-slate-200 block">Aadhaar Verification</span>
                    <span className="text-xs text-slate-500">UIDAI API eKYC</span>
                  </div>
                </div>
                <Badge status={verification?.aadhaar_status} />
              </div>

              {/* PAN */}
              <div className="flex items-center justify-between p-sm bg-slate-900/30 rounded border border-slate-800/50">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-indigo-500">badge</span>
                  <div>
                    <span className="text-sm font-semibold text-slate-200 block">PAN Verification</span>
                    <span className="text-xs text-slate-500">NSDL API Validation</span>
                  </div>
                </div>
                <Badge status={verification?.pan_status} />
              </div>

              {/* RBI */}
              <div className="flex items-center justify-between p-sm bg-slate-900/30 rounded border border-slate-800/50">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-indigo-500">gavel</span>
                  <div>
                    <span className="text-sm font-semibold text-slate-200 block">RBI Sanctions Screening</span>
                    <span className="text-xs text-slate-500">Real-time Sanctions List Check</span>
                  </div>
                </div>
                <Badge status={screening?.rbi_status} />
              </div>

              {/* CIBIL */}
              <div className="flex items-center justify-between p-sm bg-slate-900/30 rounded border border-slate-800/50">
                <div className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-indigo-500">security</span>
                  <div>
                    <span className="text-sm font-semibold text-slate-200 block">CIBIL Fraud Screening</span>
                    <span className="text-xs text-slate-500">CIBIL Fraud Registry Check</span>
                  </div>
                </div>
                <Badge status={screening?.cibil_status} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Audit Timeline */}
        <div className="lg:col-span-1">
          <AuditTimeline logs={audit_logs} />
        </div>
      </div>
    </div>
  );
}