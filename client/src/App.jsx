import React, { useState, useEffect } from "react";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import SpendAlertSetupPage from "./pages/SpendAlertSetupPage";
import OTPVerificationModal from "./components/alerts/OTPVerificationModal";
import SuccessConfirmationPage from "./pages/SuccessConfirmationPage";
import ActiveAlertsList from "./components/alerts/ActiveAlertsList";
import { registerAlert, verifyOtp, getActiveAlerts } from "./services/api";

export default function App() {
  const [step, setStep] = useState("setup"); // 'setup', 'otp', 'success'
  const [formData, setFormData] = useState(null);
  const [otpReferenceId, setOtpReferenceId] = useState("");
  const [alertDetails, setAlertDetails] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAlerts = async () => {
    setAlertsLoading(true);
    try {
      const data = await getActiveAlerts();
      setAlerts(data);
    } catch (err) {
      console.error("Failed to fetch active alerts:", err);
    } finally {
      setAlertsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleRegisterSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      const res = await registerAlert(data);
      setFormData(data);
      setOtpReferenceId(res.otpReferenceId);
      setStep("otp");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to initiate registration. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (otpCode) => {
    setLoading(true);
    setError("");
    try {
      const res = await verifyOtp({
        ...formData,
        otpCode,
        otpReferenceId,
      });
      setAlertDetails(res);
      setStep("success");
      fetchAlerts();
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid or expired OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep("setup");
    setFormData(null);
    setOtpReferenceId("");
    setAlertDetails(null);
    setError("");
  };

  return (
    <div className="bg-[#0b1326] text-[#dae2fd] antialiased min-h-screen flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-[280px] h-screen overflow-hidden bg-[#0b1326]">
        {/* Header */}
        <Header />

        {/* Scrollable Canvas */}
        <main className="flex-1 overflow-y-auto p-xl space-y-xl custom-scrollbar">
          {/* Row 1: Header */}
          <div className="mb-lg">
            <h1 className="font-headline-lg text-headline-lg text-on-background mb-xs">
              Debit Card Spend Alerts
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Set up and manage real-time SMS notifications for your debit card
              transactions to stay informed and secure.
            </p>
          </div>

          {error && (
            <div className="p-md bg-error-container/20 border border-error text-error rounded-lg text-body-sm max-w-4xl mx-auto">
              {error}
            </div>
          )}

          {/* Main Content Steps */}
          {step === "setup" && (
            <SpendAlertSetupPage
              onSubmit={handleRegisterSubmit}
              loading={loading}
              alerts={alerts}
              alertsLoading={alertsLoading}
            />
          )}

          {step === "otp" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
              <div className="lg:col-span-7">
                <div className="bg-surface-container rounded-xl border border-outline-variant p-lg shadow-sm text-center py-12">
                  <span className="material-symbols-outlined text-primary text-5xl animate-pulse mb-4">
                    sms
                  </span>
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
                    Verification Pending
                  </h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Please complete the OTP verification in the modal to
                    activate your spend alert.
                  </p>
                </div>
              </div>
              <div className="lg:col-span-5">
                <ActiveAlertsList alerts={alerts} loading={alertsLoading} />
              </div>
            </div>
          )}

          {step === "success" && (
            <SuccessConfirmationPage
              alertDetails={alertDetails}
              onReset={handleReset}
            />
          )}

          {/* OTP Modal Overlay */}
          {step === "otp" && (
            <OTPVerificationModal
              onVerify={handleOTPVerify}
              onCancel={handleReset}
              loading={loading}
              mobileNumber={formData?.mobileNumber}
            />
          )}

          {/* Row 3: Security Banner */}
          <div className="bg-gradient-to-r from-surface-container-high to-surface-container border border-outline-variant rounded-xl p-lg flex flex-col md:flex-row items-center justify-between gap-lg shadow-sm">
            <div className="flex items-center gap-lg">
              <div className="w-12 h-12 rounded-full bg-surface-dim flex items-center justify-center border border-outline-variant shrink-0">
                <span
                  className="material-symbols-outlined text-secondary text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  security
                </span>
              </div>
              <div>
                <h3 className="font-label-md text-label-md text-on-surface mb-xs">
                  Compliance & Security Guidelines
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  All alert configurations adhere strictly to PCI-DSS v4.0 and
                  RBI mandates for secure out-of-band communication.
                </p>
              </div>
            </div>
            <div className="flex gap-md shrink-0">
              <span className="px-3 py-1 bg-surface-dim border border-outline-variant rounded-md font-code-md text-code-md text-secondary-fixed-dim text-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">
                  verified
                </span>{" "}
                PCI-DSS
              </span>
              <span className="px-3 py-1 bg-surface-dim border border-outline-variant rounded-md font-code-md text-code-md text-primary-fixed-dim text-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">
                  policy
                </span>{" "}
                RBI Guide
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
