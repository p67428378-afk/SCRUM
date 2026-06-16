import React, { useState } from 'react';
import Button from '../common/Button';

export default function OnboardingWizard({ onSubmit, isSubmitting }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    aadhaar_number: '',
    pan_number: '',
    cibil_consent: false,
  });
  const [errors, setErrors] = useState({});

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone is required';
      } else if (!/^\d{10}$/.test(formData.phone.replace(/[- ]/g, ''))) {
        newErrors.phone = 'Phone must be 10 digits';
      }
    } else if (currentStep === 2) {
      if (!formData.aadhaar_number.trim()) {
        newErrors.aadhaar_number = 'Aadhaar number is required';
      } else if (!/^\d{12}$/.test(formData.aadhaar_number)) {
        newErrors.aadhaar_number = 'Aadhaar must be exactly 12 digits';
      }
      if (!formData.pan_number.trim()) {
        newErrors.pan_number = 'PAN number is required';
      } else if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(formData.pan_number.toUpperCase())) {
        newErrors.pan_number = 'Invalid PAN format (e.g., ABCDE1234F)';
      }
    } else if (currentStep === 3) {
      if (!formData.cibil_consent) {
        newErrors.cibil_consent = 'Explicit digital consent is required to proceed';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(3)) {
      onSubmit({
        ...formData,
        pan_number: formData.pan_number.toUpperCase(),
      });
    }
  };

  return (
    <div className="glass-card rounded-xl border border-slate-700 overflow-hidden shadow-lg max-w-2xl mx-auto">
      <div className="px-md py-sm border-b border-slate-700 bg-[#1E293B]/80">
        <h3 className="text-lg font-semibold text-white">New Customer KYC Onboarding</h3>
      </div>

      {/* Stepper */}
      <div className="px-md py-sm bg-slate-900/50 border-b border-slate-800 flex justify-between items-center">
        {[
          { num: 1, label: 'Personal' },
          { num: 2, label: 'Identity' },
          { num: 3, label: 'Consent' },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-xs">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step === s.num
                  ? 'bg-indigo-600 text-white'
                  : step > s.num
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {step > s.num ? '✓' : s.num}
            </div>
            <span className={`text-xs font-medium ${step === s.num ? 'text-white' : 'text-slate-400'}`}>
              {s.label}
            </span>
            {s.num < 3 && <div className="w-8 h-[1px] bg-slate-700" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-md space-y-md">
        {step === 1 && (
          <div className="space-y-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-xs">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-md py-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Enter full name"
              />
              {errors.name && <p className="text-red-400 text-xs mt-xs">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-xs">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-md py-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-red-400 text-xs mt-xs">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-xs">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-md py-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Enter 10-digit phone number"
              />
              {errors.phone && <p className="text-red-400 text-xs mt-xs">{errors.phone}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-xs">
                Aadhaar Number
              </label>
              <input
                type="text"
                name="aadhaar_number"
                value={formData.aadhaar_number}
                onChange={handleChange}
                maxLength={12}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-md py-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                placeholder="Enter 12-digit Aadhaar number"
              />
              {errors.aadhaar_number && <p className="text-red-400 text-xs mt-xs">{errors.aadhaar_number}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-xs">
                PAN Number
              </label>
              <input
                type="text"
                name="pan_number"
                value={formData.pan_number}
                onChange={handleChange}
                maxLength={10}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-md py-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono uppercase"
                placeholder="Enter 10-character PAN number"
              />
              {errors.pan_number && <p className="text-red-400 text-xs mt-xs">{errors.pan_number}</p>}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-md">
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-md space-y-sm">
              <h4 className="text-sm font-semibold text-white">Review Details</h4>
              <div className="grid grid-cols-2 gap-sm text-xs">
                <div>
                  <span className="text-slate-500 block">Name</span>
                  <span className="text-slate-200 font-medium">{formData.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Email</span>
                  <span className="text-slate-200 font-medium">{formData.email}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Phone</span>
                  <span className="text-slate-200 font-medium">{formData.phone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Aadhaar</span>
                  <span className="text-slate-200 font-mono font-medium">{formData.aadhaar_number}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block">PAN</span>
                  <span className="text-slate-200 font-mono font-medium uppercase">{formData.pan_number}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-sm">
              <input
                type="checkbox"
                id="cibil_consent"
                name="cibil_consent"
                checked={formData.cibil_consent}
                onChange={handleChange}
                className="mt-1 bg-slate-900 border-slate-700 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="cibil_consent" className="text-xs text-slate-400 leading-relaxed">
                I hereby provide explicit digital consent to screen my details against the CIBIL fraud registry and RBI sanctions lists in real-time as per RBI KYC Master Directions 2016 and PMLA 2002.
              </label>
            </div>
            {errors.cibil_consent && <p className="text-red-400 text-xs">{errors.cibil_consent}</p>}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-md border-t border-slate-800">
          {step > 1 ? (
            <Button onClick={handleBack} variant="secondary" disabled={isSubmitting}>
              Back
            </Button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <Button onClick={handleNext} variant="primary">
              Next
            </Button>
          ) : (
            <Button type="submit" variant="success" disabled={isSubmitting} icon="check">
              {isSubmitting ? 'Submitting...' : 'Submit KYC'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}