import React, { useState } from "react";
import OutstandingBillsTable from "../components/payments/OutstandingBillsTable.jsx";
import PaymentHistoryTable from "../components/payments/PaymentHistoryTable.jsx";
import PaymentGatewayPanel from "../components/payments/PaymentGatewayPanel.jsx";
import Modal from "../components/common/Modal.jsx";

export default function PaymentsPage({ bills = [], onMakePayment }) {
  const [selectedBill, setSelectedSlot] = useState(null);

  const handlePaymentSuccess = async (paymentData) => {
    await onMakePayment(paymentData);
    setSelectedSlot(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <OutstandingBillsTable
        bills={bills}
        onPayClick={(bill) => setSelectedSlot(bill)}
      />
      <PaymentHistoryTable bills={bills} />

      <Modal
        isOpen={!!selectedBill}
        onClose={() => setSelectedSlot(null)}
        title="Secure Payment Gateway"
      >
        {selectedBill && (
          <PaymentGatewayPanel
            bill={selectedBill}
            onPaymentSuccess={handlePaymentSuccess}
            onCancel={() => setSelectedSlot(null)}
          />
        )}
      </Modal>
    </div>
  );
}
