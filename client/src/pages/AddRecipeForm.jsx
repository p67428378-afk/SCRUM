import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { createRecipe } from "../services/api";

export default function AddRecipeForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");
  const [instructions, setInstructions] = useState("");
  const [ingredients, setIngredients] = useState([
    { name: "", quantity: "", unit: "" },
  ]);

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "" }]);
  };

  const handleRemoveIngredient = (index) => {
    if (ingredients.length === 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (
      !title.trim() ||
      !description.trim() ||
      !prepTime ||
      !cookTime ||
      !servings ||
      !instructions.trim()
    ) {
      setError("All fields are required.");
      return;
    }

    const prep = parseInt(prepTime, 10);
    const cook = parseInt(cookTime, 10);
    const serv = parseInt(servings, 10);

    if (
      isNaN(prep) ||
      prep <= 0 ||
      isNaN(cook) ||
      cook <= 0 ||
      isNaN(serv) ||
      serv <= 0
    ) {
      setError("Please enter a valid positive number.");
      return;
    }

    // Validate ingredients
    const validIngredients = ingredients.filter(
      (ing) => ing.name.trim() && ing.quantity.trim(),
    );
    if (validIngredients.length === 0) {
      setError("Please add at least one ingredient with a name and quantity.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        prep_time: prep,
        cook_time: cook,
        servings: serv,
        instructions: instructions.trim(),
        ingredients: validIngredients.map((ing) => ({
          name: ing.name.trim(),
          quantity: ing.quantity.trim(),
          unit: ing.unit.trim() || null,
        })),
      };

      await createRecipe(payload);
      navigate("/");
    } catch (err) {
      console.error("Failed to create recipe:", err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Failed to save recipe. Please try again later.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f7fafc] min-h-screen flex flex-col gap-[24px] items-start p-[32px] relative w-full">
      <Navbar />

      {/* Breadcrumbs */}
      <div className="content-stretch flex items-start overflow-clip relative shrink-0 w-full">
        <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[#707a8c] text-[12px] whitespace-pre">
          <Link to="/" className="hover:underline">
            Recipes
          </Link>{" "}
          &rsaquo;{" "}
          <span className="text-[#171c29] font-medium">Add New Recipe</span>
        </p>
      </div>

      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-[#e3e8f0] border-solid content-stretch flex flex-col gap-[20px] items-start overflow-clip p-[24px] relative rounded-[14px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] shrink-0 w-full"
      >
        <h2 className="[word-break:break-word] font-bold leading-[normal] not-italic relative shrink-0 text-[#171c29] text-[18px] whitespace-nowrap">
          Add New Recipe
        </h2>

        {/* Error Banner */}
        {error && (
          <div className="bg-[#db2626] content-stretch flex items-center justify-center overflow-clip p-[12px] relative rounded-[10px] shrink-0 w-full">
            <p className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[14px] text-white">
              ⚠️ {error}
            </p>
          </div>
        )}

        {/* Recipe Title */}
        <div className="content-stretch flex flex-col gap-[4px] items-start overflow-clip relative shrink-0 w-full">
          <label
            htmlFor="title"
            className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[#707a8c] text-[12px] whitespace-nowrap"
          >
            Recipe Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Classic Pancakes"
            className="bg-[#f2f5fa] border border-[#e3e8f0] border-solid content-stretch flex items-start overflow-clip p-[12px] relative rounded-[10px] shrink-0 w-full outline-none focus:border-[#2663eb] text-[#171c29]"
          />
        </div>

        {/* Description */}
        <div className="content-stretch flex flex-col gap-[4px] items-start overflow-clip relative shrink-0 w-full">
          <label
            htmlFor="description"
            className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[#707a8c] text-[12px] whitespace-nowrap"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Fluffy and delicious homemade pancakes."
            className="bg-[#f2f5fa] border border-[#e3e8f0] border-solid content-stretch flex items-start overflow-clip p-[12px] relative rounded-[10px] shrink-0 w-full h-[80px] outline-none focus:border-[#2663eb] text-[#171c29] resize-none"
          />
        </div>

        {/* Times and Servings */}
        <div className="content-stretch flex flex-col items-start overflow-clip relative shrink-0 w-full">
          <div className="content-stretch flex flex-col md:flex-row gap-[16px] items-start overflow-clip relative shrink-0 w-full">
            {/* Prep Time */}
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative self-stretch w-full">
              <label
                htmlFor="prepTime"
                className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[#707a8c] text-[12px] whitespace-nowrap"
              >
                Prep Time (minutes)
              </label>
              <input
                id="prepTime"
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="10"
                className="bg-[#f2f5fa] border border-[#e3e8f0] border-solid content-stretch flex items-start overflow-clip p-[12px] relative rounded-[10px] shrink-0 w-full outline-none focus:border-[#2663eb] text-[#171c29]"
              />
            </div>

            {/* Cook Time */}
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative self-stretch w-full">
              <label
                htmlFor="cookTime"
                className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[#707a8c] text-[12px] whitespace-nowrap"
              >
                Cook Time (minutes)
              </label>
              <input
                id="cookTime"
                type="number"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                placeholder="15"
                className="bg-[#f2f5fa] border border-[#e3e8f0] border-solid content-stretch flex items-start overflow-clip p-[12px] relative rounded-[10px] shrink-0 w-full outline-none focus:border-[#2663eb] text-[#171c29]"
              />
            </div>

            {/* Servings */}
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative self-stretch w-full">
              <label
                htmlFor="servings"
                className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[#707a8c] text-[12px] whitespace-nowrap"
              >
                Servings
              </label>
              <input
                id="servings"
                type="number"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                placeholder="4"
                className="bg-[#f2f5fa] border border-[#e3e8f0] border-solid content-stretch flex items-start overflow-clip p-[12px] relative rounded-[10px] shrink-0 w-full outline-none focus:border-[#2663eb] text-[#171c29]"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#e3e8f0] h-px relative shrink-0 w-full" />

        {/* Ingredients Section */}
        <h3 className="[word-break:break-word] font-bold leading-[normal] min-w-full not-italic relative shrink-0 text-[#171c29] text-[16px] w-[min-content]">
          Ingredients
        </h3>

        {ingredients.map((ingredient, index) => (
          <div
            key={index}
            className="content-stretch flex flex-col md:flex-row gap-[12px] items-end overflow-clip relative shrink-0 w-full"
          >
            {/* Ingredient Name */}
            <div className="content-stretch flex flex-[2_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative w-full">
              <label
                htmlFor={`ing-name-${index}`}
                className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[#707a8c] text-[12px] whitespace-nowrap"
              >
                Ingredient Name
              </label>
              <input
                id={`ing-name-${index}`}
                type="text"
                value={ingredient.name}
                onChange={(e) =>
                  handleIngredientChange(index, "name", e.target.value)
                }
                placeholder="e.g., Flour"
                className="bg-[#f2f5fa] border border-[#e3e8f0] border-solid content-stretch flex items-start overflow-clip p-[12px] relative rounded-[10px] shrink-0 w-full outline-none focus:border-[#2663eb] text-[#171c29]"
              />
            </div>

            {/* Quantity */}
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative w-full">
              <label
                htmlFor={`ing-qty-${index}`}
                className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[#707a8c] text-[12px] whitespace-nowrap"
              >
                Quantity
              </label>
              <input
                id={`ing-qty-${index}`}
                type="text"
                value={ingredient.quantity}
                onChange={(e) =>
                  handleIngredientChange(index, "quantity", e.target.value)
                }
                placeholder="e.g., 2"
                className="bg-[#f2f5fa] border border-[#e3e8f0] border-solid content-stretch flex items-start overflow-clip p-[12px] relative rounded-[10px] shrink-0 w-full outline-none focus:border-[#2663eb] text-[#171c29]"
              />
            </div>

            {/* Unit */}
            <div className="content-stretch flex flex-[1_0_0] flex-col gap-[4px] items-start min-w-px overflow-clip relative w-full">
              <label
                htmlFor={`ing-unit-${index}`}
                className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[#707a8c] text-[12px] whitespace-nowrap"
              >
                Unit
              </label>
              <input
                id={`ing-unit-${index}`}
                type="text"
                value={ingredient.unit}
                onChange={(e) =>
                  handleIngredientChange(index, "unit", e.target.value)
                }
                placeholder="e.g., cups, g, ml"
                className="bg-[#f2f5fa] border border-[#e3e8f0] border-solid content-stretch flex items-start overflow-clip p-[12px] relative rounded-[10px] shrink-0 w-full outline-none focus:border-[#2663eb] text-[#171c29]"
              />
            </div>

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => handleRemoveIngredient(index)}
              className="bg-[#db2626] hover:bg-red-700 content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[10px] shrink-0 text-white font-bold h-[46px]"
              disabled={ingredients.length === 1}
              aria-label="Remove ingredient"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddIngredient}
          className="bg-white border border-[#e3e8f0] border-solid content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[10px] shrink-0 w-full text-[#171c29] text-[14px] font-medium hover:bg-gray-50"
        >
          + Add Ingredient
        </button>

        <div className="bg-[#e3e8f0] h-px relative shrink-0 w-full" />

        {/* Instructions */}
        <div className="content-stretch flex flex-col gap-[4px] items-start overflow-clip relative shrink-0 w-full">
          <label
            htmlFor="instructions"
            className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[#707a8c] text-[12px] whitespace-nowrap"
          >
            Instructions
          </label>
          <textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="1. Whisk dry ingredients.&#10;2. Whisk wet ingredients.&#10;3. Combine and cook on a hot griddle."
            className="bg-[#f2f5fa] border border-[#e3e8f0] border-solid content-stretch flex items-start overflow-clip p-[12px] relative rounded-[10px] shrink-0 w-full h-[120px] outline-none focus:border-[#2663eb] text-[#171c29] resize-none"
          />
        </div>

        {/* Form Actions */}
        <div className="content-stretch flex gap-[12px] items-start justify-end overflow-clip relative shrink-0 w-full mt-4">
          <Link
            to="/"
            className="bg-white border border-[#e3e8f0] border-solid content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[10px] shrink-0 text-[#171c29] text-[14px] font-medium hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="bg-[#2663eb] hover:bg-blue-700 content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[10px] shrink-0 text-[14px] text-white font-medium"
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Recipe"}
          </button>
        </div>
      </form>
    </div>
  );
}
