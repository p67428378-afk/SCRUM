import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
} from "../services/api";
import InventoryForm from "../components/inventory/InventoryForm";

export default function InventoryFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchItem = async () => {
        try {
          setLoading(true);
          const data = await getInventoryItem(id);
          setItem(data);
          setError(null);
        } catch (err) {
          console.error("Failed to fetch item details", err);
          setError("Failed to load item details.");
        } finally {
          setLoading(false);
        }
      };
      fetchItem();
    }
  }, [id]);

  const handleSubmit = async (payload) => {
    try {
      setLoading(true);
      if (id) {
        await updateInventoryItem(id, payload);
      } else {
        await createInventoryItem(payload);
      }
      navigate("/inventory");
    } catch (err) {
      console.error("Failed to save item", err);
      setError("Failed to save item. Please check your inputs and try again.");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/inventory");
  };

  if (loading && !item) {
    return (
      <div className="flex items-center justify-center h-64 text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin mr-2">
          sync
        </span>
        Loading item details...
      </div>
    );
  }

  return (
    <div className="space-y-gutter">
      {/* Page Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-1">
            {id ? "Edit Inventory Item" : "New Inventory Item"}
          </h2>
          <p className="text-on-surface-variant font-body-md">
            {id
              ? "Modify the details of an existing jewelry item."
              : "Add a new jewelry item to the inventory."}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-error-container/20 border border-error/20 rounded-xl p-4 text-error max-w-2xl mx-auto">
          {error}
        </div>
      )}

      {/* Form */}
      <InventoryForm
        initialData={item}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
