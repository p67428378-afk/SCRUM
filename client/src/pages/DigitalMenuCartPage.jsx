import React, { useState, useEffect } from "react";
import { Search, Filter, Sparkles, ShoppingBag } from "lucide-react";
import MenuItemCard from "../components/menu/MenuItemCard";
import { getCategories, getMenuItems } from "../services/api";

export default function DigitalMenuCartPage({
  cartItems,
  onAddToCart,
  onOpenCart,
}) {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedTag, setSelectedTag] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Initial mock items fallback in case backend is empty or initializing
  const fallbackMenuItems = [
    {
      id: "item-1",
      name: "Butter Chicken (Murgh Makhani)",
      description:
        "Tender chicken pieces simmered in a rich tomato, butter, and cashew cream sauce.",
      price: 14.99,
      image_url:
        "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&q=80&w=600",
      dietary_tags: "Non-Veg, Chef Special",
      is_available: true,
    },
    {
      id: "item-2",
      name: "Hyderabadi Dum Biryani",
      description:
        "Fragrant basmati rice layered with spiced marinated chicken and slow cooked under dum.",
      price: 12.5,
      image_url:
        "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600",
      dietary_tags: "Non-Veg",
      is_available: true,
    },
    {
      id: "item-3",
      name: "Paneer Tikka Masala",
      description:
        "Char-grilled cottage cheese cubes cooked in a spiced onion tomato gravy.",
      price: 13.99,
      image_url:
        "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&q=80&w=600",
      dietary_tags: "Veg, Chef Special",
      is_available: true,
    },
    {
      id: "item-4",
      name: "Garlic Butter Naan",
      description:
        "Traditional Indian flatbread brushed with garlic and fresh butter.",
      price: 3.5,
      image_url:
        "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600",
      dietary_tags: "Veg",
      is_available: true,
    },
    {
      id: "item-5",
      name: "Gulab Jamun with Rabri",
      description:
        "Soft milk solids dumplings fried and soaked in cardamom rose syrup served with rabri.",
      price: 6.99,
      image_url:
        "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=600",
      dietary_tags: "Veg",
      is_available: true,
    },
    {
      id: "item-6",
      name: "Mango Lassi",
      description:
        "Refreshing sweet yogurt drink blended with Alphonso mango pulp.",
      price: 4.5,
      image_url:
        "https://images.unsplash.com/photo-1570696516188-ade861b84a49?auto=format&fit=crop&q=80&w=600",
      dietary_tags: "Veg",
      is_available: true,
    },
  ];

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedTag]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [catsRes, itemsRes] = await Promise.all([
        getCategories().catch(() => []),
        getMenuItems({
          category_id:
            selectedCategory === "ALL" ? undefined : selectedCategory,
          dietary_tag: selectedTag === "ALL" ? undefined : selectedTag,
          available_only: false,
        }).catch(() => null),
      ]);

      setCategories(catsRes || []);
      if (itemsRes && itemsRes.length > 0) {
        setMenuItems(itemsRes);
      } else {
        setMenuItems(fallbackMenuItems);
      }
    } catch (err) {
      console.warn("API error fetching menu, using fallbacks:", err);
      setMenuItems(fallbackMenuItems);
    } finally {
      setLoading(false);
    }
  };

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === "ALL" || item.category_id === selectedCategory;
    const matchesTag =
      selectedTag === "ALL" ||
      (item.dietary_tags &&
        item.dietary_tags.toLowerCase().includes(selectedTag.toLowerCase()));

    return matchesSearch && matchesCategory && matchesTag;
  });

  const getItemQuantityInCart = (itemId) => {
    const cartItem = cartItems.find((i) => i.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-white p-8 sm:p-12 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 px-3 py-1 rounded-full text-amber-300 text-xs font-semibold mb-4 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Bandra's Finest Gourmet Kitchen
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-3">
            Bandra Hotel Food Delivery
          </h1>
          <p className="text-amber-100/90 text-sm sm:text-base leading-relaxed mb-6">
            Authentic Indian delicacies, kebabs, biryanis, and rich curries
            crafted by executive chefs and delivered fresh to your doorstep.
          </p>

          <div className="flex flex-wrap gap-4 text-xs font-medium text-amber-200">
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg">
              <span>⚡ Fast 30-45 Min Delivery</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg">
              <span>🏷️ Flat $3.00 Delivery Fee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Butter Chicken, Biryani, Naan, Desserts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-gray-50/50"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === "ALL"
                ? "bg-amber-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? "bg-amber-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Dietary Badges */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Dietary:
          </span>
          {["ALL", "Veg", "Non-Veg", "Chef Special"].map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                selectedTag === tag
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tag === "ALL" ? "All Types" : tag}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          Menu ({filteredMenuItems.length})
        </h2>
        {cartItems.length > 0 && (
          <button
            onClick={onOpenCart}
            className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200"
          >
            <ShoppingBag className="w-4 h-4" />
            View Cart ({cartItems.reduce((a, b) => a + b.quantity, 0)} items)
          </button>
        )}
      </div>

      {/* Menu Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-80 bg-gray-100 animate-pulse rounded-2xl border border-gray-200"
            />
          ))}
        </div>
      ) : filteredMenuItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <p className="text-gray-500 text-sm font-medium">
            No menu items match your search filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenuItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onAddToCart={onAddToCart}
              cartQuantity={getItemQuantityInCart(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
