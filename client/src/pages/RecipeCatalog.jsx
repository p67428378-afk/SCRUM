import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import RecipeCard from "../components/RecipeCard";
import ModalDialog from "../components/ModalDialog";
import { getRecipes, deleteRecipe } from "../services/api";

export default function RecipeCatalog() {
  const [recipes, setRecipes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnectionLost, setIsConnectionLost] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRecipes = async (query = "") => {
    try {
      setLoading(true);
      setError(null);
      setIsConnectionLost(false);
      const data = await getRecipes(0, 100, query);
      setRecipes(data);
    } catch (err) {
      console.error("Failed to fetch recipes:", err);
      if (!err.response) {
        setIsConnectionLost(true);
      } else {
        setError("Failed to load recipes. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchRecipes(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleDeleteClick = (id) => {
    setRecipeToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!recipeToDelete) return;
    try {
      setDeleting(true);
      setError(null);
      await deleteRecipe(recipeToDelete);
      setRecipes(recipes.filter((r) => r.id !== recipeToDelete));
      setDeleteModalOpen(false);
      setRecipeToDelete(null);
    } catch (err) {
      console.error("Failed to delete recipe:", err);
      setError("Failed to delete recipe. Please try again later.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-[#f7fafc] min-h-screen flex flex-col gap-[24px] items-start p-[32px] relative w-full">
      <Navbar />

      {/* Connection Lost Banner */}
      {isConnectionLost && (
        <div className="bg-[#db2626] content-stretch flex items-center justify-center overflow-clip p-[12px] relative rounded-[10px] shrink-0 w-full">
          <p className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">
            ⚠️ Connection lost. Please check your internet connection.
          </p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-[#db2626] content-stretch flex items-center justify-center overflow-clip p-[12px] relative rounded-[10px] shrink-0 w-full">
          <p className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[14px] text-white">
            ⚠️ {error}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="content-stretch flex items-center justify-between overflow-clip relative shrink-0 w-full">
        <h1 className="[word-break:break-word] font-bold leading-[normal] not-italic relative shrink-0 text-[#171c29] text-[32px] whitespace-nowrap">
          Recipe Catalog
        </h1>
        <Link
          to="/add-recipe"
          className="bg-[#2663eb] hover:bg-blue-700 content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[10px] shrink-0 text-[14px] text-white font-medium"
        >
          + Add Recipe
        </Link>
      </div>

      {/* Search Bar */}
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {/* Catalog Grid */}
      {loading ? (
        <div className="w-full text-center py-12 text-[#707a8c]">
          Loading recipes...
        </div>
      ) : recipes.length === 0 ? (
        <div className="w-full text-center py-12 bg-white border border-[#e3e8f0] rounded-[14px] p-8 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)]">
          <p className="text-[#707a8c] text-lg font-medium">
            No recipes found. Be the first to add one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] w-full">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ModalDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Recipe"
        footer={
          <>
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="bg-white border border-[#e3e8f0] border-solid content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[10px] shrink-0 text-[#171c29] text-[14px] font-medium hover:bg-gray-50"
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="bg-[#db2626] hover:bg-red-700 content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[10px] shrink-0 text-[14px] text-white font-medium"
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Confirm Delete"}
            </button>
          </>
        }
      >
        <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[#171c29] text-[14px] w-full">
          Are you sure you want to delete this recipe? This action cannot be
          undone.
        </p>
      </ModalDialog>
    </div>
  );
}
