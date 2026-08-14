import React from "react";
import AuthForm from "../components/auth/AuthForm";

export default function LoginPage({ onAuthSuccess }) {
  return <AuthForm onAuthSuccess={onAuthSuccess} />;
}
