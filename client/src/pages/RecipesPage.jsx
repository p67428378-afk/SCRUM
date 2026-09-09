import React, { useState, useEffect } from "react";
import RecipeCard from "../components/recipes/RecipeCard";
import QualityLogForm from "../components/recipes/QualityLogForm";
import QualityAuditTable from "../components/recipes/QualityAuditTable";
import {
  getRecipes,
  getQualityLogs,
  logQuality,
  getTeas,
} from "../services/api";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [qualityLogs, setQualityLogs] = useState([]);
  const [teas, setTeas] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  const mockDefaultRecipes = [
    {
      id: "r1",
      tea_id: "1",
      tea_name: "Sencha Green Tea",
      steep_temperature_c: 80,
      steep_time_seconds: 120,
      leaf_water_ratio_g_per_ml: "5g / 250ml",
      instructions:
        "Pre-heat gaiwan vessel with warm water. Rinse leaves for 5 seconds. Steep at 80°C for 120 seconds.",
    },
    {
      id: "r2",
      tea_id: "2",
      tea_name: "Dragonwell Imperial Green",
      steep_temperature_c: 85,
      steep_time_seconds: 90,
      leaf_water_ratio_g_per_ml: "4g / 200ml",
      instructions:
        "Use glass tumbler. Stream water gently down side of vessel. Steep for 90s.",
    },
    {
      id: "r3",
      tea_id: "3",
      tea_name: "Wuyi Rock Oolong",
      steep_temperature_c: 95,
      steep_time_seconds: 45,
      leaf_water_ratio_g_per_ml: "7g / 150ml",
      instructions:
        "Yixing clay pot recommended. Perform flash steep for 45s at 95°C.",
    },
  ];

  const mockDefaultLogs = [
    {
      id: "l1",
      recipe_id: "r1",
      tea_name: "Sencha Green Tea",
      rating: 5,
      feedback:
        "Perfect umami balance, ideal 80°C steep temperature maintained.",
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "l2",
      recipe_id: "r3",
      tea_name: "Wuyi Rock Oolong",
      rating: 5,
      feedback:
        "Rich mineral aroma, 45s flash steep brought out roasted floral notes.",
      created_at: new Date(Date.now() - 10800000).toISOString(),
    },
  ];

  const fetchRecipeData = async () => {
    setLoading(true);
    try {
      const [recipesData, logsData, teasData] = await Promise.allSettled([
        getRecipes(),
        getQualityLogs(),
        getTeas(),
      ]);

      if (
        recipesData.status === "fulfilled" &&
        Array.isArray(recipesData.value) &&
        recipesData.value.length > 0
      ) {
        setRecipes(recipesData.value);
      } else {
        setRecipes(mockDefaultRecipes);
      }

      if (
        logsData.status === "fulfilled" &&
        Array.isArray(logsData.value) &&
        logsData.value.length > 0
      ) {
        setQualityLogs(logsData.value);
      } else {
        setQualityLogs(mockDefaultLogs);
      }

      if (teasData.status === "fulfilled" && Array.isArray(teasData.value)) {
        setTeas(teasData.value);
      }
    } catch {
      setRecipes(mockDefaultRecipes);
      setQualityLogs(mockDefaultLogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipeData();
  }, []);

  const handleSubmitQualityLog = async (qualityPayload) => {
    try {
      await logQuality(qualityPayload);
    } catch {
      // Local fallback
      const targetRecipe = recipes.find(
        (r) => r.id === qualityPayload.recipe_id,
      );
      const newLog = {
        id: String(Date.now()),
        recipe_id: qualityPayload.recipe_id,
        tea_name: targetRecipe?.tea_name || "Brewed Tea",
        rating: qualityPayload.rating,
        feedback: qualityPayload.feedback,
        created_at: new Date().toISOString(),
      };
      setQualityLogs((prev) => [newLog, ...prev]);
    }
    fetchRecipeData();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Brewing Recipe Guide & Quality Control
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Standard operating procedures for steeping parameters,
              leaf-to-water ratios, and barista feedback logging.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-bold">
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
              Active Recipes: {recipes.length}
            </span>
            <span className="px-3 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg">
              Compliance: 99.4%
            </span>
            <span className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
              Avg Rating: 4.8 / 5.0
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1 & 2: Recipe Specifications Catalog */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Brewing Recipe Catalog & SOPs
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipes.map((rec) => (
                <RecipeCard
                  key={rec.id}
                  recipe={rec}
                  teaName={rec.tea_name}
                  onSelectForQuality={(selected) => setSelectedRecipe(selected)}
                />
              ))}
            </div>
          </div>

          {/* Audit Trail Table */}
          <QualityAuditTable logs={qualityLogs} recipes={recipes} teas={teas} />
        </div>

        {/* Column 3: Quality Log Submission Form */}
        <div className="lg:col-span-1">
          <QualityLogForm
            recipes={recipes}
            teas={teas}
            selectedRecipe={selectedRecipe}
            onSubmitQualityLog={handleSubmitQualityLog}
          />
        </div>
      </div>
    </div>
  );
}
