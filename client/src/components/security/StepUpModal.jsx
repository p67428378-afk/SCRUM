import React, { useState } from "react";
import { ShieldAlert, CheckCircle2 } from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";
import OtpInput from "../common/OtpInput";
import { authService } from "../../services/api";

export const StepUpModal = ({
  isOpen,
  onClose,
  actionType,
  amount,
  onSuccess,
}) => {
  const [step, setStep] = useState("init"); // init, otp, success
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInitiate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authService.stepUp(actionType, amount);
      if (res.step_up_required) {
        setStep("otp");
      } else {
        setStep("success");
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to initiate step-up verification.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    if (code.length < 6) {
      setError("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await authService.stepUp(actionType, amount, code);
      if (!res.step_up_required) {
        setStep("success");
        if (onSuccess) onSuccess();
      } else {
        setError("Verification failed. Please try again.");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("init");
    setCode("");
    setError("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Step-Up Authentication Required"
      maxWidth="max-w-md"
    >
      {step === "init" && (
        <div className="space-y-4 text-center py-4">
          <ShieldAlert className="w-16 h-16 text-amber-400 mx-auto" />
          <h4 className="text-lg font-semibold text-on-surface">
            High-Risk Action Detected
          </h4>
          <p className="text-sm text-on-surface-variant">
            You are attempting a high-risk action:{" "}
            <strong className="text-indigo-400 capitalize">
              {actionType.replace("_", " ")}
            </strong>
            {amount && (
              <span>
                {" "}
                of{" "}
                <strong className="text-indigo-400">
                  ${amount.toLocaleString()}
                </strong>
              </span>
            )}
            . For your security, we require additional verification.
          </p>
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">
              {error}
            </p>
          )}
          <div className="flex gap-3 justify-center pt-4">
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleInitiate}
              disabled={loading}
            >
              {loading ? "Initiating..." : "Verify Identity"}
            </Button>
          </div>
        </div>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerify} className="space-y-4 py-4">
          <div className="text-center space-y-2">
            <ShieldAlert className="w-12 h-12 text-indigo-400 mx-auto" />
            <h4 className="text-lg font-semibold text-on-surface">
              Enter Verification Code
            </h4>
            <p className="text-sm text-on-surface-variant">
              We have sent a 6-digit verification code to your registered
              device.
            </p>
          </div>

          <div className="flex justify-center py-4">
            <OtpInput value={code} onChange={setCode} disabled={loading} />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center">
              {error}
            </p>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || code.length < 6}
            >
              {loading ? "Verifying..." : "Confirm Action"}
            </Button>
          </div>
        </form>
      )}

      {step === "success" && (
        <div className="space-y-4 text-center py-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto" />
          <h4 className="text-lg font-semibold text-on-surface">
            Verification Successful
          </h4>
          <p className="text-sm text-on-surface-variant">
            Your identity has been verified. The action has been authorized.
          </p>
          <div className="pt-4">
            <Button variant="primary" onClick={handleClose} className="mx-auto">
              Close
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default StepUpModal;
