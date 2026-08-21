import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SplitLayout from "../components/SplitLayout";
import Table from "../components/Table";
import ModalDialog from "../components/ModalDialog";
import { getRecipe, deleteRecipe } from "../services/api";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnectionLost, setIsConnectionLost] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsConnectionLost(false);
        const data = await getRecipe(id);
        setRecipe(data);
      } catch (err) {
        console.error("Failed to fetch recipe:", err);
        if (!err.response) {
          setIsConnectionLost(true);
        } else if (err.response && err.response.status === 404) {
          setError("Recipe not found.");
        } else {
          setError("Failed to load recipe details. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true);
      setError(null);
      await deleteRecipe(id);
      setDeleteModalOpen(false);
      navigate("/");
    } catch (err) {
      console.error("Failed to delete recipe:", err);
      setError("Failed to delete recipe. Please try again later.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#f7fafc] min-h-screen flex flex-col gap-[24px] items-start p-[32px] relative w-full">
        <Navbar />
        <div className="w-full text-center py-12 text-[#707a8c]">
          Loading recipe details...
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="bg-[#f7fafc] min-h-screen flex flex-col gap-[24px] items-start p-[32px] relative w-full">
        <Navbar />
        <div className="bg-[#db2626] content-stretch flex items-center justify-center overflow-clip p-[12px] relative rounded-[10px] shrink-0 w-full">
          <p className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[14px] text-white">
            ⚠️ {error || "Recipe not found."}
          </p>
        </div>
        <Link to="/" className="text-[#2663eb] hover:underline font-medium">
          &larr; Back to Catalog
        </Link>
      </div>
    );
  }

  const {
    title,
    description,
    prep_time,
    cook_time,
    servings,
    instructions,
    ingredients,
  } = recipe;

  // Format ingredients for Table component
  const ingredientHeaders = ["Ingredient", "Quantity", "Unit"];
  const ingredientRows = ingredients.map((ing) => [
    ing.name,
    ing.quantity,
    ing.unit,
  ]);

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

      {/* Breadcrumbs */}
      <div className="content-stretch flex items-start overflow-clip relative shrink-0 w-full">
        <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[#707a8c] text-[12px] whitespace-pre">
          <Link to="/" className="hover:underline">
            Recipes
          </Link>{" "}
          &rsaquo; <span className="text-[#171c29] font-medium">{title}</span>
        </p>
      </div>

      {/* Split Layout */}
      <SplitLayout
        left={
          <div className="bg-white border border-[#e3e8f0] border-solid content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[24px] relative rounded-[14px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] shrink-0 w-full">
            <h2 className="[word-break:break-word] font-bold leading-[normal] not-italic relative shrink-0 text-[#171c29] text-[24px]">
              {title}
            </h2>
            <p className="[word-break:break-word] font-normal leading-[normal] min-w-full not-italic relative shrink-0 text-[#171c29] text-[14px] w-[min-content]">
              {description}
            </p>
            <div className="bg-[#f2f5fa] content-stretch flex h-[200px] items-center justify-center overflow-clip relative rounded-[10px] shrink-0 w-full">
              <p className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[#707a8c] text-[14px] whitespace-nowrap">
                🍳 Fallback Illustration
              </p>
            </div>
            <div className="[word-break:break-word] content-stretch flex font-normal gap-[12px] items-start leading-[normal] not-italic overflow-clip relative shrink-0 text-[#707a8c] text-[14px] w-full whitespace-nowrap">
              <p className="relative shrink-0">⏱️ Prep: {prep_time}m</p>
              <p className="relative shrink-0">🔥 Cook: {cook_time}m</p>
              <p className="relative shrink-0">👥 Servings: {servings}</p>
            </div>
            <div className="bg-[#e3e8f0] h-px relative shrink-0 w-full my-2" />
            <h3 className="[word-break:break-word] font-bold leading-[normal] min-w-full not-italic relative shrink-0 text-[#171c29] text-[18px] w-[min-content]">
              Instructions
            </h3>
            <div className="[word-break:break-word] font-normal min-w-full not-italic relative shrink-0 text-[#171c29] text-[14px] w-[min-content] whitespace-pre-line leading-relaxed">
              {instructions}
            </div>
          </div>
        }
        right={
          <>
            {/* Ingredients Card */}
            <div className="[word-break:break-word] bg-white border border-[#e3e8f0] border-solid content-stretch flex flex-col gap-[12px] items-start leading-[normal] not-italic overflow-clip p-[24px] relative rounded-[14px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] shrink-0 w-full">
              <h3 className="font-bold relative shrink-0 text-[#171c29] text-[18px] whitespace-nowrap">
                Ingredients
              </h3>
              <Table headers={ingredientHeaders} rows={ingredientRows} />
            </div>

            {/* Actions Card */}
            <div className="bg-white border border-[#e3e8f0] border-solid content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[24px] relative rounded-[14px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] shrink-0 w-full">
              <h3 className="[word-break:break-word] font-bold leading-[normal] not-italic relative shrink-0 text-[#171c29] text-[18px] whitespace-nowrap">
                Actions
              </h3>
              <button
                onClick={handleDeleteClick}
                className="bg-[#db2626] hover:bg-red-700 content-stretch flex gap-[8px] items-center justify-center leading-[normal] not-italic overflow-clip px-[16px] py-[12px] relative rounded-[10px] shrink-0 text-[14px] text-white w-full whitespace-nowrap font-medium"
              >
                <span>🗑️</span>
                <span>Delete Recipe</span>
              </button>
            </div>
          </>
        }
      />

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
