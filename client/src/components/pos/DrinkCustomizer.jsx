import React, { useState, useEffect } from "react";
import { Sliders, Plus, Minus, ShoppingCart } from "lucide-react";

export default function DrinkCustomizer({ selectedTea, onAddToCart }) {
  const [sweetness, setSweetness] = useState("50%");
  const [temperature, setTemperature] = useState("Iced");
  const [milkOption, setMilkOption] = useState("Oat");
  const [addOns, setAddOns] = useState(["Boba"]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (selectedTea) {
      setQuantity(1);
    }
  }, [selectedTea]);

  if (!selectedTea) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center text-center h-full">
        <Sliders className="w-10 h-10 text-gray-300 mb-3" />
        <h3 className="font-bold text-gray-700 mb-1">No Tea Selected</h3>
        <p className="text-xs text-gray-500 max-w-xs">
          Select a tea variety from the left catalog to customize sweetness,
          temperature, milk, and add-ons.
        </p>
      </div>
    );
  }

  const sweetnessOptions = ["0%", "25%", "50%", "75%", "100%"];
  const temperatureOptions = ["Hot", "Warm", "Iced"];
  const milkOptions = [
    { label: "Whole", value: "Whole", extra: 0 },
    { label: "Oat (+ $0.75)", value: "Oat", extra: 0.75 },
    { label: "Almond (+ $0.75)", value: "Almond", extra: 0.75 },
    { label: "None", value: "None", extra: 0 },
  ];

  const availableAddOns = [
    { name: "Boba", price: 0.75 },
    { name: "Grass Jelly", price: 0.5 },
    { name: "Egg Pudding", price: 0.75 },
    { name: "Aloe Vera", price: 0.5 },
  ];

  const handleAddOnToggle = (addonName) => {
    if (addOns.includes(addonName)) {
      setAddOns(addOns.filter((a) => a !== addonName));
    } else {
      setAddOns([...addOns, addonName]);
    }
  };

  // Calculate unit price calculation
  let basePrice = Number(selectedTea.unit_price || 5.0);

  const selectedMilkObj = milkOptions.find((m) => m.value === milkOption);
  const milkExtra = selectedMilkObj ? selectedMilkObj.extra : 0;

  const addOnExtra = addOns.reduce((sum, name) => {
    const addon = availableAddOns.find((a) => a.name === name);
    return sum + (addon ? addon.price : 0);
  }, 0);

  const itemUnitPrice = basePrice + milkExtra + addOnExtra;
  const totalPrice = itemUnitPrice * quantity;

  const handleAdd = () => {
    onAddToCart({
      tea_id: selectedTea.id,
      tea_name: selectedTea.name,
      quantity,
      sweetness_level: sweetness,
      temperature,
      milk_option: milkOption,
      add_ons: addOns,
      item_price: itemUnitPrice,
      total_price: totalPrice,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between h-full">
      <div>
        <div className="border-b border-gray-200 pb-3 mb-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              2. Customization
            </span>
            <h2 className="text-lg font-bold text-gray-900">
              {selectedTea.name}
            </h2>
          </div>
          <span className="text-sm font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
            ${basePrice.toFixed(2)} base
          </span>
        </div>

        {/* Sweetness */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Sweetness Level
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {sweetnessOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSweetness(option)}
                className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                  sweetness === option
                    ? "bg-emerald-700 text-white border-emerald-700"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Temperature */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Temperature
          </label>
          <div className="grid grid-cols-3 gap-2">
            {temperatureOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setTemperature(option)}
                className={`py-2 text-xs font-bold rounded-lg border transition ${
                  temperature === option
                    ? "bg-emerald-700 text-white border-emerald-700"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Milk Option */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Milk Choice
          </label>
          <div className="grid grid-cols-2 gap-2">
            {milkOptions.map((m) => (
              <label
                key={m.value}
                className={`flex items-center p-2 rounded-lg border text-xs font-medium cursor-pointer transition ${
                  milkOption === m.value
                    ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="milk"
                  checked={milkOption === m.value}
                  onChange={() => setMilkOption(m.value)}
                  className="mr-2 text-emerald-600 focus:ring-emerald-500"
                />
                {m.label}
              </label>
            ))}
          </div>
        </div>

        {/* Add-ons */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Add-ons
          </label>
          <div className="grid grid-cols-2 gap-2">
            {availableAddOns.map((addon) => {
              const checked = addOns.includes(addon.name);
              return (
                <label
                  key={addon.name}
                  className={`flex items-center p-2 rounded-lg border text-xs font-medium cursor-pointer transition ${
                    checked
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleAddOnToggle(addon.name)}
                    className="mr-2 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span>
                    {addon.name} (+${addon.price.toFixed(2)})
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quantity & Add to Cart */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Quantity
          </span>
          <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-1 border border-gray-200">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-gray-700 font-bold hover:bg-gray-200"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-bold text-sm text-gray-900 w-6 text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-gray-700 font-bold hover:bg-gray-200"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="w-full py-3 bg-emerald-700 text-white font-bold rounded-xl hover:bg-emerald-800 transition flex items-center justify-center space-x-2 shadow-sm"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Add to Order Ticket (${totalPrice.toFixed(2)})</span>
        </button>
      </div>
    </div>
  );
}
