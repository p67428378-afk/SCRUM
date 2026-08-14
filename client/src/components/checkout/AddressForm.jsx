import React, { useState } from "react";
import { MapPin, Plus, Check } from "lucide-react";

export default function AddressForm({
  savedAddresses = [],
  selectedAddressId,
  onSelectAddress,
  onSaveNewAddress,
  deliveryAddressText,
  onUpdateAddressText,
}) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("Bandra, Mumbai");
  const [postalCode, setPostalCode] = useState("400050");
  const [isDefault, setIsDefault] = useState(false);
  const [error, setError] = useState("");

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!streetAddress.trim()) {
      setError("Street address is required");
      return;
    }
    setError("");
    try {
      if (onSaveNewAddress) {
        await onSaveNewAddress({
          street_address: streetAddress,
          city,
          postal_code: postalCode,
          is_default: isDefault,
        });
      }
      const fullText = `${streetAddress}, ${city} - ${postalCode}`;
      onUpdateAddressText(fullText);
      setIsAddingNew(false);
      setStreetAddress("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save address");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Delivery Address</h3>
        </div>
        {!isAddingNew && (
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Address
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
          {error}
        </div>
      )}

      {/* Saved Addresses List */}
      {!isAddingNew && savedAddresses.length > 0 && (
        <div className="grid gap-3 mb-4">
          {savedAddresses.map((addr) => {
            const fullText = `${addr.street_address}, ${addr.city} - ${addr.postal_code}`;
            const isSelected =
              selectedAddressId === addr.id || deliveryAddressText === fullText;
            return (
              <div
                key={addr.id}
                onClick={() => {
                  if (onSelectAddress) onSelectAddress(addr.id);
                  if (onUpdateAddressText) onUpdateAddressText(fullText);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition flex items-start justify-between gap-3 ${
                  isSelected
                    ? "border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20"
                    : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? "border-amber-600 bg-amber-600 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {addr.street_address}
                    </p>
                    <p className="text-xs text-gray-600">
                      {addr.city} - {addr.postal_code}
                    </p>
                    {addr.is_default && (
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Address Form or Custom Address Input */}
      {isAddingNew ? (
        <form
          onSubmit={handleSaveAddress}
          className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200"
        >
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            New Delivery Address
          </h4>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Street Address / House / Flat No.
            </label>
            <input
              type="text"
              required
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="e.g. 102 Sea View Apartments, Hill Road"
              className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                City / Area
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isDefault"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded text-amber-600 focus:ring-amber-500"
            />
            <label
              htmlFor="isDefault"
              className="text-xs text-gray-700 font-medium"
            >
              Save as default delivery address
            </label>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 shadow-sm"
            >
              Save Address
            </button>
          </div>
        </form>
      ) : (
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Delivery Address Text
          </label>
          <textarea
            rows={2}
            value={deliveryAddressText}
            onChange={(e) => onUpdateAddressText(e.target.value)}
            placeholder="Enter full delivery address details (Street, Building, Landmark, City, Postal Code)"
            className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          />
        </div>
      )}
    </div>
  );
}
