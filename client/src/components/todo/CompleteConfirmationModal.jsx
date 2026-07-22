import React from "react";
import Modal from "../common/Modal.jsx";

export default function CompleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  todo,
}) {
  if (!todo) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Completion">
      <div className="space-y-4">
        <p className="text-on-surface-variant text-body-md">
          Are you sure you want to mark the task{" "}
          <strong className="text-on-background">"{todo.title}"</strong> as
          complete?
        </p>
        <div className="flex justify-end gap-3 pt-md">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-outline text-outline hover:bg-surface-container transition-colors font-label-md"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(todo.id);
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-brand-green text-white hover:bg-green-600 transition-colors font-label-md flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">check</span>
            Yes, Complete
          </button>
        </div>
      </div>
    </Modal>
  );
}
