import React, { useState, useEffect } from "react";
import {
  getProductRecipes,
  addRecipeToProduct,
  deleteRecipe,
  listIngredients,
} from "../../services/api";
import Badge from "../common/Badge";
import { X, Plus, Trash2, Utensils, AlertCircle } from "lucide-react";

export default function RecipeModal({ product, onClose, onRecipeUpdated }) {
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState("");
  const [quantityRequired, setQuantityRequired] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [recipeList, ingredientList] = await Promise.all([
        getProductRecipes(product.id),
        listIngredients(),
      ]);
      setRecipes(recipeList);
      setIngredients(ingredientList);
      if (ingredientList.length > 0) {
        setSelectedIngredientId(ingredientList[0].id);
      }
    } catch (err) {
      console.error("Error loading recipe data:", err);
      setError("Failed to load recipe details or ingredients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (product) {
      loadData();
    }
  }, [product]);

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    if (
      !selectedIngredientId ||
      !quantityRequired ||
      parseFloat(quantityRequired) <= 0
    ) {
      setError(
        "Please select an ingredient and specify a valid quantity greater than 0.",
      );
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await addRecipeToProduct(product.id, {
        ingredient_id: selectedIngredientId,
        quantity_required: parseFloat(quantityRequired),
      });
      setQuantityRequired("");
      await loadData();
      if (onRecipeUpdated) onRecipeUpdated();
    } catch (err) {
      console.error("Error adding recipe ingredient:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to add ingredient to recipe formula.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecipeItem = async (recipeId) => {
    try {
      await deleteRecipe(recipeId);
      await loadData();
      if (onRecipeUpdated) onRecipeUpdated();
    } catch (err) {
      console.error("Error deleting recipe item:", err);
      setError("Failed to remove ingredient from recipe.");
    }
  };

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full border border-[#E5DED1] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E5DED1] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Utensils className="w-5 h-5 text-[#D96B1F]" />
            <h2 className="text-lg font-bold text-[#1F1A14]">
              Recipe Formula: {product.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#80756B] hover:text-[#1F1A14] p-1 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-[#D92D2D] rounded-md text-xs flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Add Ingredient Form */}
          <form
            onSubmit={handleAddIngredient}
            className="bg-[#FAF7F2] p-4 rounded-md border border-[#E5DED1] space-y-3"
          >
            <h4 className="text-xs font-bold uppercase text-[#80756B]">
              Add Ingredient Requirement
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
              <div className="sm:col-span-6">
                <label className="block text-xs font-medium text-[#1F1A14] mb-1">
                  Ingredient
                </label>
                <select
                  value={selectedIngredientId}
                  onChange={(e) => setSelectedIngredientId(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-[#E5DED1] rounded-md focus:outline-none focus:ring-1 focus:ring-[#D96B1F]"
                >
                  {ingredients.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.name} ({ing.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-xs font-medium text-[#1F1A14] mb-1">
                  Qty Required
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g. 0.25"
                  value={quantityRequired}
                  onChange={(e) => setQuantityRequired(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-[#E5DED1] rounded-md focus:outline-none focus:ring-1 focus:ring-[#D96B1F]"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2 bg-[#D96B1F] text-white text-xs font-medium rounded-md hover:bg-[#B85310] transition-colors flex items-center justify-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </form>

          {/* Recipe Ingredient Table */}
          <div>
            <h4 className="text-xs font-bold uppercase text-[#80756B] mb-2">
              Configured Raw Ingredients
            </h4>
            {loading ? (
              <p className="text-xs text-[#80756B] py-4 text-center">
                Loading recipe formula...
              </p>
            ) : recipes.length > 0 ? (
              <div className="border border-[#E5DED1] rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-[#E5DED1] text-xs">
                  <thead className="bg-[#FAF7F2]">
                    <tr>
                      <th className="px-3 py-2 text-left text-[#80756B]">
                        Ingredient Name
                      </th>
                      <th className="px-3 py-2 text-center text-[#80756B]">
                        Qty Per Unit
                      </th>
                      <th className="px-3 py-2 text-right text-[#80756B]">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5DED1]">
                    {recipes.map((recipe) => (
                      <tr key={recipe.id} className="hover:bg-[#FAF7F2]">
                        <td className="px-3 py-2 font-medium text-[#1F1A14]">
                          {recipe.ingredient_name || recipe.ingredient_id}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <Badge variant="info">
                            {recipe.quantity_required}{" "}
                            {recipe.ingredient_unit || "units"}
                          </Badge>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => handleDeleteRecipeItem(recipe.id)}
                            className="text-[#D92D2D] hover:text-red-700 p-1"
                            title="Remove Ingredient"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-[#80756B] italic py-4 text-center border border-dashed border-[#E5DED1] rounded-md">
                No raw ingredients mapped to this product formula yet.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#FAF7F2] border-t border-[#E5DED1] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white border border-[#E5DED1] text-xs font-medium text-[#1F1A14] rounded-md hover:bg-[#F5F2EB]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
