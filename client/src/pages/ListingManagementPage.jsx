import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ListingModal from "../components/ListingModal";
import { propertiesApi } from "../services/api";
import {
  Plus,
  Edit2,
  Trash2,
  Building2,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function ListingManagementPage() {
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  const fetchListings = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await propertiesApi.getProperties({ limit: 50 });
      setMyListings(data.items || []);
    } catch (err) {
      console.error("Error loading my listings", err);
      setError(
        "Could not fetch listings from server. Displaying sample agent listings.",
      );
      setMyListings([
        {
          id: "demo-1",
          title: "Modern Single Family Home in Austin",
          property_type: "Single Family",
          status: "Active",
          price: 450000,
          bedrooms: 3,
          bathrooms: 2.5,
          square_feet: 2200,
          address_street: "123 Maple St",
          city: "Austin",
          state: "TX",
          zip_code: "78701",
          created_at: "2026-01-15T00:00:00Z",
        },
        {
          id: "demo-2",
          title: "Downtown Luxury Condo with Skyline Views",
          property_type: "Condo",
          status: "Active",
          price: 325000,
          bedrooms: 2,
          bathrooms: 2,
          square_feet: 1250,
          address_street: "456 Congress Ave #1204",
          city: "Austin",
          state: "TX",
          zip_code: "78701",
          created_at: "2026-01-18T00:00:00Z",
        },
        {
          id: "demo-3",
          title: "Cozy Townhouse with Private Garden",
          property_type: "Townhouse",
          status: "Pending",
          price: 380000,
          bedrooms: 3,
          bathrooms: 2,
          square_feet: 1800,
          address_street: "789 Oak Ridge Ln",
          city: "Austin",
          state: "TX",
          zip_code: "78704",
          created_at: "2026-01-20T00:00:00Z",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleCreateNew = () => {
    setEditingProperty(null);
    setIsModalOpen(true);
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setIsModalOpen(true);
  };

  const handleDelete = async (propertyId) => {
    if (
      window.confirm("Are you sure you want to delete this property listing?")
    ) {
      try {
        await propertiesApi.deleteProperty(propertyId);
        setMyListings((prev) => prev.filter((p) => p.id !== propertyId));
      } catch (err) {
        console.error("Error deleting property", err);
        setMyListings((prev) => prev.filter((p) => p.id !== propertyId));
      }
    }
  };

  const handleModalSubmit = async (formData) => {
    if (editingProperty) {
      const updated = await propertiesApi.updateProperty(
        editingProperty.id,
        formData,
      );
      setMyListings((prev) =>
        prev.map((p) =>
          p.id === editingProperty.id ? { ...p, ...updated } : p,
        ),
      );
    } else {
      const created = await propertiesApi.createProperty(formData);
      setMyListings((prev) => [created, ...prev]);
    }
  };

  const statusBadges = {
    Active: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Pending: "bg-amber-100 text-amber-800 border-amber-200",
    Sold: "bg-rose-100 text-rose-800 border-rose-200",
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Listing Management Portal
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Create, edit, and manage house listings and status updates for
              your property portfolio.
            </p>
          </div>

          <button
            onClick={handleCreateNew}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center space-x-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Listing</span>
          </button>
        </div>

        {error && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-sm font-medium">Loading property listings...</p>
          </div>
        ) : myListings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">
              No Listings Added Yet
            </h3>
            <p className="text-sm max-w-md mx-auto">
              Start adding your property listings to make them available to
              buyers and renters searching on HomeFinder.
            </p>
            <button
              onClick={handleCreateNew}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition"
            >
              Add First Listing
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4">Property Title & Address</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Specs</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myListings.map((property) => (
                    <tr
                      key={property.id}
                      className="hover:bg-slate-50/50 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">
                          {property.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          {property.address_street}, {property.city},{" "}
                          {property.state} {property.zip_code}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadges[property.status] || "bg-slate-100 text-slate-800"}`}
                        >
                          {property.status || "Active"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-slate-600">
                        {property.property_type || "Single Family"}
                      </td>

                      <td className="px-6 py-4 font-bold text-blue-600">
                        ${Number(property.price || 0).toLocaleString()}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-600">
                        {property.bedrooms} beds • {property.bathrooms} baths •{" "}
                        {property.square_feet?.toLocaleString()} sqft
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleEdit(property)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="Edit Listing"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(property.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <ListingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
          initialData={editingProperty}
          title={
            editingProperty
              ? "Edit Property Listing"
              : "Add New Property Listing"
          }
        />
      </main>
    </div>
  );
}
