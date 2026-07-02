import React from "react";
import OTPVerificationModal from "../components/alerts/OTPVerificationModal";

export default function OTPVerificationPage({
  onVerify,
  onCancel,
  loading,
  mobileNumber,
}) {
  return (
    <div className="flex items-center justify-center py-2xl">
      <OTPVerificationModal
        onVerify={onVerify}
        onCancel={onCancel}
        loading={loading}
        mobileNumber={mobileNumber}
      />
    </div>
  );
}
