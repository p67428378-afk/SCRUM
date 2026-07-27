import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import MfaForm from "../components/auth/MfaForm";
import { authService } from "../services/api";

export default function LoginPage({ onLogin }) {
  const [mfaUser, setMfaUser] = useState(null);
  const navigate = useNavigate();

  const handleLoginSuccess = async (credentials) => {
    const data = await authService.login(credentials);
    if (data.user.mfa_required) {
      setMfaUser(data.user);
    } else {
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);
      navigate("/dashboard");
    }
  };

  const handleMfaSuccess = (data) => {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
    onLogin(data.user);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-bg px-4">
      {!mfaUser ? (
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        <MfaForm userId={mfaUser.id} onVerifySuccess={handleMfaSuccess} />
      )}
    </div>
  );
}
