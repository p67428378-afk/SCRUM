import React, { useState, useEffect } from 'react';
import KPISection from '../components/kyc/KPISection';
import KYCTable from '../components/kyc/KYCTable';
import Button from '../components/common/Button';
import { kycService } from '../services/api';

export default function DashboardPage({ onNavigate, onViewDetails }) {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setRequestsFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, approved: 0, flagged: 0, pending: 0 });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await kycService.getRequests({ limit: 100 });
      setRequests(data);
      
      // Calculate stats
      const total = data.length;
      const approved = data.filter((r) => r.final_status === 'APPROVED').length;
      const flagged = data.filter((r) => r.final_status === 'FLAGGED').length;
      const pending = data.filter((r) => r.final_status === 'PENDING').length;
      setStats({ total, approved, flagged, pending });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to load KYC requests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    let result = [...requests];

    // Apply status filter
    if (statusFilter !== 'All Statuses') {
      result = result.filter((r) => r.final_status.toUpperCase() === statusFilter.toUpperCase());
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.customer_name.toLowerCase().includes(query) ||
          r.id.toLowerCase().includes(query)
      );
    }

    setRequestsFiltered(result);
  }, [requests, statusFilter, searchQuery]);

  const handleClearFilters = () => {
    setStatusFilter('All Statuses');
    setSearchQuery('');
  };

  return (
    <div className="space-y-lg">
      {/* Page Header */}
      <div className="flex flex-col gap-sm md:flex-row md:items-end justify-between mb-lg">
        <div>
          <h2 className="text-3xl font-bold text-white mb-base">KYC Overview</h2>
          <p className="text-sm text-slate-400">Monitor and manage customer onboarding compliance.</p>
        </div>
        <div className="flex gap-sm">
          <Button
            onClick={() => onNavigate('onboarding')}
            variant="primary"
            icon="add"
          >
            New KYC Onboarding
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <KPISection stats={stats} />

      {/* Action Row & Filters */}
      <div className="flex flex-col sm:flex-row gap-md justify-between items-center bg-[#1E293B] p-sm rounded-lg border border-slate-700 mt-lg">
        <div className="flex flex-wrap items-center gap-sm w-full sm:w-auto">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg pl-md pr-xl py-[6px] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option>All Statuses</option>
              <option>Approved</option>
              <option>Flagged</option>
              <option>Pending</option>
            </select>
            <span className="material-symbols-outlined absolute right-sm top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>
          
          <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
            <span className="material-symbols-outlined text-slate-400 pl-sm text-[18px]">calendar_month</span>
            <input
              className="bg-transparent border-none text-slate-200 text-sm py-[6px] pl-sm pr-md focus:ring-0 w-[180px] cursor-pointer"
              placeholder="Jun 10 - Jun 16, 2026"
              readOnly
              type="text"
              value="Jun 10 - Jun 16, 2026"
            />
          </div>
          
          <button
            onClick={handleClearFilters}
            className="p-[6px] border border-slate-700 bg-slate-900 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition-colors"
            title="Clear Filters"
          >
            <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
          </button>
        </div>
        
        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-sm top-1/2 transform -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-xl pr-md py-[6px] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-200 text-sm placeholder-slate-500 transition-colors"
            placeholder="Search ID or Name..."
          />
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <div className="glass-card rounded-xl p-lg text-center text-slate-400">
          Loading KYC requests...
        </div>
      ) : error ? (
        <div className="glass-card rounded-xl p-lg text-center text-red-400 border border-red-500/20">
          {error}
        </div>
      ) : (
        <KYCTable requests={filteredRequests} onViewDetails={onViewDetails} />
      )}
    </div>
  );
}