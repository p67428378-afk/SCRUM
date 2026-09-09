import React from "react";
import { Thermometer, Timer, Scale, Star, BookOpen } from "lucide-react";

export default function RecipeCard({ recipe, teaName, onSelectForQuality }) {
  if (!recipe) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col justify-between hover:shadow-md transition">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-gray-900 text-base">
              {teaName || recipe.tea_name || "Brewing Recipe"}
            </h3>
            <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold rounded mt-1">
              Standard SOP Recipe
            </span>
          </div>
          <div className="flex items-center text-amber-500 text-xs font-bold bg-amber-50 px-2 py-1 rounded border border-amber-200">
            <Star className="w-3.5 h-3.5 fill-current mr-1" />
            <span>4.8 / 5.0</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 my-4 bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
          <div className="flex flex-col items-center">
            <Thermometer className="w-4 h-4 text-red-500 mb-1" />
            <span className="text-[10px] text-gray-500 uppercase font-semibold">
              Temp
            </span>
            <span className="text-xs font-bold text-gray-900">
              {recipe.steep_temperature_c}°C
            </span>
          </div>
          <div className="flex flex-col items-center border-x border-gray-200">
            <Timer className="w-4 h-4 text-blue-500 mb-1" />
            <span className="text-[10px] text-gray-500 uppercase font-semibold">
              Steep Time
            </span>
            <span className="text-xs font-bold text-gray-900">
              {recipe.steep_time_seconds}s
            </span>
          </div>
          <div className="flex flex-col items-center">
            <Scale className="w-4 h-4 text-emerald-600 mb-1" />
            <span className="text-[10px] text-gray-500 uppercase font-semibold">
              Ratio
            </span>
            <span className="text-xs font-bold text-gray-900">
              {recipe.leaf_water_ratio_g_per_ml}
            </span>
          </div>
        </div>

        {recipe.instructions && (
          <div className="text-xs text-gray-600 mb-4 bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-100">
            <span className="font-semibold text-emerald-950 flex items-center mb-1">
              <BookOpen className="w-3.5 h-3.5 mr-1 text-emerald-700" /> Brewing
              SOP:
            </span>
            <p className="italic text-gray-700">{recipe.instructions}</p>
          </div>
        )}
      </div>

      <button
        onClick={() => onSelectForQuality && onSelectForQuality(recipe)}
        className="w-full py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-semibold text-xs rounded-lg transition"
      >
        Log Quality Feedback
      </button>
    </div>
  );
}
