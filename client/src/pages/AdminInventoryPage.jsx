import React, { useState, useEffect } from "react";
import {
  Settings,
  Plus,
  AlertCircle,
  CheckCircle,
  BookOpen,
} from "lucide-react";
import { getBooks, createBook, updateBook, deleteBook } from "../services/api";
import InventoryTable from "../components/admin/InventoryTable";
import BookFormCard from "../components/admin/BookFormCard";
import Button from "../components/common/Button";
import StatCard from "../components/common/StatCard";

export const AdminInventoryPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await getBooks({ skip: 0, limit: 100 });
      const items = Array.isArray(data) ? data : data.items || [];
      setBooks(items);
    } catch (err) {
      console.error("Failed to load inventory:", err);
      showNotification("error", "Error loading library inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateOrUpdate = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingBook) {
        await updateBook(editingBook.id, formData);
        showNotification(
          "success",
          `Book "${formData.title}" updated successfully.`,
        );
      } else {
        await createBook(formData);
        showNotification(
          "success",
          `Book "${formData.title}" added to inventory.`,
        );
      }
      setShowForm(false);
      setEditingBook(null);
      fetchInventory();
    } catch (err) {
      const msg =
        err.response?.data?.detail || "Operation failed. Please verify fields.";
      showNotification("error", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (book) => {
    setEditingBook(book);
    setShowForm(true);
  };

  const handleDeleteClick = async (bookId) => {
    if (
      !window.confirm("Are you sure you want to remove this book from catalog?")
    )
      return;
    setDeletingId(bookId);
    try {
      await deleteBook(bookId);
      showNotification("success", "Book removed from catalog.");
      fetchInventory();
    } catch (err) {
      const msg =
        err.response?.data?.detail || "Cannot delete book with active loans.";
      showNotification("error", msg);
    } finally {
      setDeletingId(null);
    }
  };

  const totalCopies = books.reduce((acc, b) => acc + (b.total_copies || 0), 0);
  const availableCopies = books.reduce(
    (acc, b) => acc + (b.available_copies || 0),
    0,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="text-purple-600" />
            <span>Librarian Inventory Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage catalog entries, add new titles, and monitor copy
            availability.
          </p>
        </div>
        {!showForm && (
          <Button
            variant="primary"
            onClick={() => {
              setEditingBook(null);
              setShowForm(true);
            }}
          >
            <Plus size={18} />
            <span>Add New Book</span>
          </Button>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Catalog Titles"
          value={books.length}
          icon={BookOpen}
          color="purple"
        />
        <StatCard
          title="Total Physical Copies"
          value={totalCopies}
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Copies Available"
          value={availableCopies}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-medium transition-all ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Form Section */}
      {showForm && (
        <BookFormCard
          initialData={editingBook}
          onSubmit={handleCreateOrUpdate}
          onCancel={() => {
            setShowForm(false);
            setEditingBook(null);
          }}
          isLoading={isSubmitting}
        />
      )}

      {/* Inventory Table */}
      {loading ? (
        <div className="h-64 bg-slate-100 rounded-xl animate-pulse"></div>
      ) : (
        <InventoryTable
          books={books}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          deletingId={deletingId}
        />
      )}
    </div>
  );
};

export default AdminInventoryPage;
