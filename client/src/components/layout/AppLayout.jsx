import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import TransferForm from "../transfers/TransferForm";
import Modal from "../common/Modal";

export default function AppLayout({ children, user }) {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-bg text-on-background">
      <Sidebar
        user={user}
        onNewTransaction={() => setIsTransferModalOpen(true)}
      />

      <div className="ml-sidebar-width flex-1 flex flex-col min-h-screen">
        <Header user={user} />

        <main className="flex-1 pt-24 px-8 pb-12 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {isTransferModalOpen && (
        <Modal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          title="New Transfer"
        >
          <TransferForm onSuccess={() => setIsTransferModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
}
