import React from "react";
import SuccessConfirmationCard from "../components/alerts/SuccessConfirmationCard";

export default function SuccessConfirmationPage({ alertDetails, onReset }) {
  return (
    <div className="max-w-2xl mx-auto py-xl">
      <SuccessConfirmationCard alertDetails={alertDetails} onReset={onReset} />
    </div>
  );
}
