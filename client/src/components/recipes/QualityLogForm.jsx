import React, { useState } from "react";
import { Star, Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function QualityLogForm({
  recipes = [],
  teas = [],
  selectedRecipe,
  onSubmitQualityLog,
}) {
  const [recipeId, setRecipeId] = useState(
    selectedRecipe?.id || recipes[0]?.id || "",
  );
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const activeRecipeId = recipeId || selectedRecipe?.id || recipes[0]?.id;
    if (!activeRecipeId) {
      setError("Please select a valid recipe.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await onSubmitQualityLog({
        recipe_id: activeRecipeId,
        rating: Number(rating),
        feedback,
      });
      setSuccess(true);
      setFeedback("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit quality log.");
    } finally {
      setLoading(false);
    }
  };

  const getTeaName = (rec) => {
    const tea = teas.find((t) => t.id === rec.tea_id);
    return tea ? tea.name : rec.tea_name || "Tea Recipe";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center">
        <Star className="w-5 h-5 text-amber-500 fill-current mr-2" />
        Brewing Quality Feedback Form
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center">
          <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600 flex-shrink-0" />
          <span>Quality feedback logged successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Select Recipe *
          </label>
          <select
            value={recipeId || selectedRecipe?.id || recipes[0]?.id || ""}
            onChange={(e) => setRecipeId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            {recipes.map((r) => (
              <option key={r.id} value={r.id}>
                {getTeaName(r)} ({r.steep_temperature_c}°C,{" "}
                {r.steep_time_seconds}s)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Quality Rating *
          </label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1.5 focus:outline-none transition transform hover:scale-110"
              >
                <Star
                  className={`w-7 h-7 ${
                    star <= rating
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-300 hover:text-amber-200"
                  }`}
                />
              </button>
            ))}
            <span className="text-sm font-bold text-gray-700 ml-2 self-center">
              {rating} / 5 Stars
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
            Feedback Comments
          </label>
          <textarea
            rows="3"
            placeholder="e.g. Exceptional vegetal aroma and smooth umami finish. Water temperature held steady at 80°C."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-emerald-800 transition flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>{loading ? "Submitting..." : "Submit Quality Log"}</span>
        </button>
      </form>
    </div>
  );
}
