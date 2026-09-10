import React, { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  BookPlus,
  UserPlus,
  Edit2,
  Trash2,
  Layers,
  Users,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
  Search,
  Shield,
} from "lucide-react";

export const BookManagement = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("books"); // 'books' | 'members'
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Search filters
  const [bookSearch, setBookSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");

  // Book Modal / Drawer State
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookForm, setBookForm] = useState({
    isbn: "",
    title: "",
    author: "",
    category: "Technology",
    total_copies: 5,
  });

  // Member Modal State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberForm, setMemberForm] = useState({
    email: "",
    full_name: "",
    phone: "",
    membership_tier: "STANDARD",
    password: "testpassword",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [booksData, membersData] = await Promise.all([
        api.getBooks(),
        api.getMembers(),
      ]);
      setBooks(booksData);
      setMembers(membersData);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to fetch management records",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open Book Modal (New or Edit)
  const handleOpenBookModal = (book = null) => {
    if (book) {
      setEditingBook(book);
      setBookForm({
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        category: book.category,
        total_copies: book.total_copies,
      });
    } else {
      setEditingBook(null);
      setBookForm({
        isbn: "",
        title: "",
        author: "",
        category: "Technology",
        total_copies: 5,
      });
    }
    setIsBookModalOpen(true);
    setError(null);
  };

  // Save Book (Create / Update)
  const handleSaveBook = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (editingBook) {
        await api.updateBook(editingBook.id, {
          title: bookForm.title,
          author: bookForm.author,
          category: bookForm.category,
          total_copies: Number(bookForm.total_copies),
        });
        setSuccessMsg(`Book "${bookForm.title}" updated successfully!`);
      } else {
        await api.createBook({
          isbn: bookForm.isbn,
          title: bookForm.title,
          author: bookForm.author,
          category: bookForm.category,
          total_copies: Number(bookForm.total_copies),
        });
        setSuccessMsg(`Book "${bookForm.title}" added to inventory!`);
      }
      setIsBookModalOpen(false);
      await fetchData();
    } catch (err) {
      const detail =
        err.response?.data?.detail || err.message || "Failed to save book";
      setError(typeof detail === "string" ? detail : JSON.stringify(detail));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Book
  const handleDeleteBook = async (bookId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }
    setError(null);
    setSuccessMsg(null);
    try {
      await api.deleteBook(bookId);
      setSuccessMsg(`Book "${title}" deleted from catalog.`);
      await fetchData();
    } catch (err) {
      const detail =
        err.response?.data?.detail || err.message || "Failed to delete book";
      setError(typeof detail === "string" ? detail : JSON.stringify(detail));
    }
  };

  // Open Member Modal
  const handleOpenMemberModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setMemberForm({
        email: member.user?.email || "",
        full_name: member.user?.full_name || "",
        phone: member.user?.phone || "",
        membership_tier: member.membership_tier,
        password: "",
      });
    } else {
      setEditingMember(null);
      setMemberForm({
        email: "",
        full_name: "",
        phone: "",
        membership_tier: "STANDARD",
        password: "testpassword",
      });
    }
    setIsMemberModalOpen(true);
    setError(null);
  };

  // Save Member
  const handleSaveMember = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      if (editingMember) {
        await api.updateMember(editingMember.id, {
          membership_tier: memberForm.membership_tier,
          phone: memberForm.phone || undefined,
        });
        setSuccessMsg(`Member profile updated successfully!`);
      } else {
        await api.createMember({
          email: memberForm.email,
          full_name: memberForm.full_name,
          phone: memberForm.phone || undefined,
          password: memberForm.password || "testpassword",
          membership_tier: memberForm.membership_tier,
        });
        setSuccessMsg(
          `New patron "${memberForm.full_name}" registered successfully!`,
        );
      }
      setIsMemberModalOpen(false);
      await fetchData();
    } catch (err) {
      const detail =
        err.response?.data?.detail || err.message || "Failed to save member";
      setError(typeof detail === "string" ? detail : JSON.stringify(detail));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.isbn.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.author.toLowerCase().includes(bookSearch.toLowerCase()),
  );

  const filteredMembers = members.filter((m) => {
    const name = m.user?.full_name?.toLowerCase() || "";
    const email = m.user?.email?.toLowerCase() || "";
    const q = memberSearch.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
                Staff Administration Console
              </h1>
              <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                Admin & Catalog
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Manage library book inventory stock, register new patrons, and
              adjust membership tiers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeTab === "books" ? (
              <button
                onClick={() => handleOpenBookModal()}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#4F46E5] hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm shadow-indigo-100"
              >
                <BookPlus className="w-4 h-4" />+ Add New Book
              </button>
            ) : (
              <button
                onClick={() => handleOpenMemberModal()}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#4F46E5] hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm shadow-indigo-100"
              >
                <UserPlus className="w-4 h-4" />+ Register New Patron
              </button>
            )}

            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div
            role="alert"
            className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-3 text-sm animate-in fade-in"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Administration Error</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div
            role="status"
            className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-start gap-3 text-sm animate-in fade-in"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Success</p>
              <p className="text-xs text-emerald-700 mt-0.5">{successMsg}</p>
            </div>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab("books")}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "books"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="w-4 h-4" />
            Book Inventory ({books.length})
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "members"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            Patron Member Accounts ({members.length})
          </button>
        </div>

        {/* TAB 1: Books Table */}
        {activeTab === "books" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative max-w-sm w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filter inventory by Title, ISBN, Author..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Showing {filteredBooks.length} of {books.length} titles
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="p-4">ISBN</th>
                    <th className="p-4">Title & Author</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Available / Total</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBooks.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="p-4 font-mono text-xs text-slate-600">
                        {b.isbn}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">
                          {b.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          by {b.author}
                        </div>
                      </td>
                      <td className="p-4 text-xs">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium">
                          {b.category}
                        </span>
                      </td>
                      <td className="p-4 text-xs font-mono">
                        <span
                          className={`font-bold ${
                            b.available_copies > 0
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        >
                          {b.available_copies}
                        </span>{" "}
                        / {b.total_copies}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenBookModal(b)}
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBook(b.id, b.title)}
                          className="text-rose-600 hover:text-rose-800 text-xs font-semibold hover:underline"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: Members Table */}
        {activeTab === "members" && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative max-w-sm w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Filter members by Name or Email..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Showing {filteredMembers.length} of {members.length} members
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="p-4">Member Info</th>
                    <th className="p-4">Membership Tier</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Unpaid Fines</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.map((m) => {
                    const isSuspended = m.status === "SUSPENDED";
                    return (
                      <tr
                        key={m.id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="p-4">
                          <div className="font-bold text-slate-900">
                            {m.user?.full_name || "Anonymous Patron"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {m.user?.email}
                          </div>
                          {m.user?.phone && (
                            <div className="text-[11px] text-slate-400">
                              {m.user.phone}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-xs">
                          <span
                            className={`px-2.5 py-1 rounded-full font-semibold border ${
                              m.membership_tier === "PREMIUM"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : "bg-indigo-50 text-indigo-700 border-indigo-100"
                            }`}
                          >
                            {m.membership_tier} (
                            {m.membership_tier === "PREMIUM"
                              ? "10 books"
                              : "5 books"}
                            )
                          </span>
                        </td>
                        <td className="p-4 text-xs">
                          <span
                            className={`px-2.5 py-1 rounded-full font-semibold border ${
                              isSuspended
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="p-4 text-xs font-mono">
                          {Number(m.unpaid_fines || 0) > 0 ? (
                            <span className="text-rose-600 font-bold">
                              ${Number(m.unpaid_fines).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-slate-400">$0.00</span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenMemberModal(m)}
                            className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold hover:underline"
                          >
                            Update Tier
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Book Modal */}
        {isBookModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 relative">
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-bold text-lg text-slate-900 mb-4">
                {editingBook
                  ? "Edit Book Details"
                  : "Add New Book to Inventory"}
              </h3>

              <form onSubmit={handleSaveBook} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    ISBN Code
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingBook}
                    value={bookForm.isbn}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, isbn: e.target.value })
                    }
                    placeholder="e.g. 978-0137081073"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Book Title
                  </label>
                  <input
                    type="text"
                    required
                    value={bookForm.title}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, title: e.target.value })
                    }
                    placeholder="e.g. The Pragmatic Programmer"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    required
                    value={bookForm.author}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, author: e.target.value })
                    }
                    placeholder="e.g. Andrew Hunt, David Thomas"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      required
                      value={bookForm.category}
                      onChange={(e) =>
                        setBookForm({ ...bookForm, category: e.target.value })
                      }
                      placeholder="e.g. Technology"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Total Copies
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={bookForm.total_copies}
                      onChange={(e) =>
                        setBookForm({
                          ...bookForm,
                          total_copies: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsBookModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-[#4F46E5] text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Save Book"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Member Modal */}
        {isMemberModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 relative">
              <button
                onClick={() => setIsMemberModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-bold text-lg text-slate-900 mb-4">
                {editingMember
                  ? "Update Member Profile"
                  : "Register New Patron"}
              </h3>

              <form onSubmit={handleSaveMember} className="space-y-4">
                {!editingMember && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={memberForm.full_name}
                        onChange={(e) =>
                          setMemberForm({
                            ...memberForm,
                            full_name: e.target.value,
                          })
                        }
                        placeholder="e.g. Bob Smith"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={memberForm.email}
                        onChange={(e) =>
                          setMemberForm({
                            ...memberForm,
                            email: e.target.value,
                          })
                        }
                        placeholder="e.g. bob@example.com"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={memberForm.phone}
                    onChange={(e) =>
                      setMemberForm({ ...memberForm, phone: e.target.value })
                    }
                    placeholder="e.g. 555-0123"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Membership Tier
                  </label>
                  <select
                    value={memberForm.membership_tier}
                    onChange={(e) =>
                      setMemberForm({
                        ...memberForm,
                        membership_tier: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="STANDARD">Standard (Limit: 5 books)</option>
                    <option value="PREMIUM">Premium (Limit: 10 books)</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsMemberModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 bg-[#4F46E5] text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Save Patron"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
