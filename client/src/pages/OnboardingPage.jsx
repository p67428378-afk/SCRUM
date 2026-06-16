import React, { useState } from 'react';
import OnboardingWizard from '../components/kyc/OnboardingWizard';
import Button from '../components/common/Button';
import { kycService } from '../services/api';

export default function OnboardingPage({ onNavigate, onViewDetails }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      const result = await kycService.submitOnboarding(formData);
      setSuccessData(result);
    } catch (err) {
      console.error('Error submitting onboarding:', err);
      setError(err.response?.data?.detail || 'Failed to submit KYC onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-lg">
      {/* Page Header */}
      <div className="flex items-center gap-md mb-lg">
        <Button
          onClick={() => onNavigate('dashboard')}
          variant="secondary"
          className="px-sm py-sm"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Button>
        <div>
          <h2 className="text-3xl font-bold text-white mb-base">KYC Onboarding</h2>
          <p className="text-sm text-slate-400">Initiate a new digital KYC verification process.</p>
        </div>
      </div>

      {error && (
        <div className="glass-card rounded-xl p-md border border-red-500/20 text-red-400 max-w-2xl mx-auto">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-red-500">error</span>
            <span className="font-semibold">Submission Failed</span>
          </div>
          <p className="text-xs mt-xs pl-xl">{error}</p>
        </div>
      )}

      {successData ? (
        <div className="glass-card rounded-xl p-lg border border-green-500/20 max-w-2xl mx-auto text-center space-y-md">
          <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[40px] icon-fill">check_circle</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">KYC Onboarding Initiated</h3>
            <p className="text-sm text-slate-400 mt-xs">
              The verification and screening processes have been executed successfully.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-md max-w-md mx-auto text-left space-y-sm text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Request ID:</span>
              <span className="text-slate-200 font-mono font-medium">#{successData.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer ID:</span>
              <span className="text-slate-200 font-mono font-medium">#{successData.customer_id}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Final Status:</span>
              <span
                className={`px-sm py-[2px] rounded-full font-bold uppercase tracking-wide border ${
                  successData.status === 'APPROVED'
                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                }`}
              >
                {successData.status}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-sm pt-md">
            <Button onClick={() => onNavigate('dashboard')} variant="secondary">
              Go to Dashboard
            </Button>
            <Button onClick={() => onViewDetails(successData.id)} variant="primary">
              View Details & Audit
            </Button>
          </div>
        </div>
      ) : (
        <OnboardingWizard onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      )}
    </div>
  );
}