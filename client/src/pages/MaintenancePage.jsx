import React from "react";
import SubmitRequestForm from "../components/maintenance/SubmitRequestForm.jsx";
import RequestHistoryList from "../components/maintenance/RequestHistoryList.jsx";

export default function MaintenancePage({ requests = [], onSubmitRequest }) {
  return (
    <div className="flex flex-col gap-6">
      <SubmitRequestForm onSubmit={onSubmitRequest} />
      <RequestHistoryList requests={requests} />
    </div>
  );
}
