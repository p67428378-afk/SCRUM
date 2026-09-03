import React, { useState, useEffect } from "react";
import MenuTable from "../components/menu/MenuTable";
import MenuItemModal from "../components/menu/MenuItemModal";
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../services/api";

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchItems = async () => {
    try {
      const data = await getMenuItems();
      setMenuItems(data);
    } catch (err) {
      console.error("Failed to load menu items:", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleToggleAvailability = async (id, newAvailability) => {
    await updateMenuItem(id, { is_available: newAvailability });
    fetchItems();
  };

  const handleSaveItem = async (itemData) => {
    if (editingItem) {
      await updateMenuItem(editingItem.id, itemData);
    } else {
      await createMenuItem(itemData);
    }
    setIsModalOpen(false);
    setEditingItem(null);
    fetchItems();
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      await deleteMenuItem(id);
      fetchItems();
    }
  };

  return (
    <div className="space-y-6">
      <MenuTable
        items={menuItems}
        onToggleAvailability={handleToggleAvailability}
        onAddItem={() => {
          setEditingItem(null);
          setIsModalOpen(true);
        }}
        onEditItem={(item) => {
          setEditingItem(item);
          setIsModalOpen(true);
        }}
        onDeleteItem={handleDeleteItem}
      />

      <MenuItemModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSaveItem}
        itemToEdit={editingItem}
      />
    </div>
  );
}
