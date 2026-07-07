import React, { useState } from "react";
import { Sparkles, Trash2, Calendar, Flame, Target, Smile, ChevronRight, Apple, Info, AlertCircle, ShoppingBag, Plus, RefreshCw, Droplet, Award } from "lucide-react";
import { EatenMeal, UserProfile } from "../types";
import { motion } from "motion/react";

interface NutritionalTrackerProps {
  profile: UserProfile;
  eatenMeals: EatenMeal[];
  onAddMeal: (meal: Omit<EatenMeal, "id" | "loggedAt">) => void;
  onRemoveMeal: (id: string) => void;
  onClearMeals: () => void;
  waterIntake: number;
  onUpdateWater: (value: number | ((prev: number) => number)) => void;
  streakCount: number;
}

export const NutritionalTracker: React.FC<NutritionalTrackerProps> = ({
  profile,
  eatenMeals,
  onAddMeal,
  onRemoveMeal,
  onClearMeals,
  waterIntake,
  onUpdateWater,
  streakCount,
}) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualName, setManualName] = useState("");
  const [manualCalories, setManualCalories] = useState(350);
  const [manualProtein, setManualProtein] = useState(20);
  const [manualCarbs, setManualCarbs] = useState(40);
  const [manualFat, setManualFat] = useState(12);
  const [showManualForm, setShowManualForm] = useState(false);

  // Calibrate calorie & macro targets based on profile and diet
  const calculateTargets = () => {
    const w = profile.weight || 70;
    const h = profile.height || 175;
    const a = profile.age || 25;
    
    // Calculate BMR
    let bmr = 10 * w + 6.25 * h - 5 * a + 5;
    if (profile.gender === "female") {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }

    // Apply activity multiplier
    let tdee = bmr * 1.2;
    if (profile.activityLevel === "moderate") tdee = bmr * 1.4;
    if (profile.activityLevel === "active") tdee = bmr * 1.6;

    // Apply fitness goal delta
    let calories = Math.round(tdee);
    if (profile.goal === "lose") calories = Math.round(tdee - 500);
    if (profile.goal === "gain") calories = Math.round(tdee + 300);

    // Diet type modifier (changes calorie target dynamically for every diet)
    let calorieMultiplier = 1.0;
    let dietTweakLabel = "Standard Calibration";
    const selectedDiet = (profile.dietType || "Normal").toLowerCase();

    if (selectedDiet === "vegetarian") {
      calorieMultiplier = 0.96;
      dietTweakLabel = "Vegetarian Plant-Based Adaptor (-4%)";
    } else if (selectedDiet === "vegan") {
      calorieMultiplier = 0.94;
      dietTweakLabel = "Vegan Plant Satiety Adjuster (-6%)";
    } else if (selectedDiet === "keto") {
      calorieMultiplier = 0.88;
      dietTweakLabel = "Ketogenic Fat-Adaptation Focus (-12%)";
    } else if (selectedDiet === "paleo") {
      calorieMultiplier = 0.92;
      dietTweakLabel = "Paleo Whole-Food Energy Burn (-8%)";
    } else if (selectedDiet === "mediterranean") {
      calorieMultiplier = 0.98;
      dietTweakLabel = "Mediterranean Cardio Health (-2%)";
    } else if (selectedDiet === "high protein") {
      calorieMultiplier = 1.05;
      dietTweakLabel = "Thermogenic High Protein Boost (+5%)";
    } else if (selectedDiet === "low carb") {
      calorieMultiplier = 0.90;
      dietTweakLabel = "Low Carb Glycemic Control (-10%)";
    } else if (selectedDiet === "gluten free") {
      calorieMultiplier = 0.95;
      dietTweakLabel = "Gluten-Free Anti-Inflammatory (-5%)";
    }

    calories = Math.round(calories * calorieMultiplier);

    // Macro splits adjusted by diet
    let protein = Math.round(w * 1.8);
    let fatPercent = 0.25;

    if (selectedDiet === "vegetarian") {
      protein = Math.round(w * 1.6);
    } else if (selectedDiet === "vegan") {
      protein = Math.round(w * 1.5);
    } else if (selectedDiet === "keto") {
      protein = Math.round((calories * 0.20) / 4);
      fatPercent = 0.70;
    } else if (selectedDiet === "paleo") {
      protein = Math.round(w * 2.0);
      fatPercent = 0.35;
    } else if (selectedDiet === "high protein") {
      protein = Math.round(w * 2.4);
      fatPercent = 0.20;
    } else if (selectedDiet === "low carb") {
      protein = Math.round(w * 2.0);
      fatPercent = 0.40;
    }

    if (profile.goal === "gain" && selectedDiet !== "keto" && selectedDiet !== "vegan") {
      protein = Math.max(protein, Math.round(w * 2.2));
    }

    let fat = Math.round((calories * fatPercent) / 9);
    let carbs = Math.max(20, Math.round((calories - (protein * 4) - (fat * 9)) / 4));

    // Water target base: 35ml per kg of body weight
    const waterTarget = Math.max(1500, Math.round(w * 35));

    return {
      calories: Math.max(1200, calories),
      protein: Math.max(40, protein),
      carbs: Math.max(30, carbs),
      fat: Math.max(30, fat),
      sugarLimit: 45,
      sodiumLimit: 2200,
      dietTweakLabel,
      waterTarget,
    };
  };

  const targets = calculateTargets();

  // Aggregate consumed nutrients
  const consumed = eatenMeals.reduce(
    (acc, meal) => {
      acc.calories += meal.calories || 0;
      acc.protein += meal.protein || 0;
      acc.carbs += meal.carbs || 0;
      acc.fat += meal.fat || 0;
      acc.sugar += meal.sugar || 0;
      acc.sodium += meal.sodium || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, sodium: 0 }
  );

  const handleAiLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/parse-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to contact the AI nutrition database");
      }

      const parsed = await response.json();
      if (!parsed || typeof parsed.calories !== "number") {
        throw new Error("Could not construct nutritional breakdown. Try again.");
      }

      onAddMeal({
        name: parsed.mealName || query.trim(),
        calories: parsed.calories,
        protein: parsed.protein,
        carbs: parsed.carbs,
        fat: parsed.fat,
        sugar: parsed.sugar,
        sodium: parsed.sodium,
      });

      setQuery("");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while analyzing.");
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    onAddMeal({
      name: manualName.trim(),
      calories: Number(manualCalories),
      protein: Number(manualProtein),
      carbs: Number(manualCarbs),
      fat: Number(manualFat),
      sugar: Number(manualFat * 0.1), // rough estimate for sugar
      sodium: Number(manualProtein * 10), // rough estimate
    });

    setManualName("");
    setManualCalories(350);
    setManualProtein(20);
    setManualCarbs(40);
    setManualFat(12);
    setShowManualForm(false);
  };

  const caloriePercent = Math.min(100, Math.round((consumed.calories / targets.calories) * 100));
  const proteinPercent = Math.min(100, Math.round((consumed.protein / targets.protein) * 100));
  const carbsPercent = Math.min(100, Math.round((consumed.carbs / targets.carbs) * 100));
  const fatPercent = Math.min(100, Math.round((consumed.fat / targets.fat) * 100));
  const waterPercent = Math.min(100, Math.round((waterIntake / targets.waterTarget) * 100));

  // Suggestive prompt presets
  const presets = [
    "I ate a chicken breast with 150g brown rice and steam broccoli",
    "Had a bowl of Greek yogurt with berries, honey, and almonds",
    "Had two slices of pepperoni pizza and a zero sugar lemonade",
    "Egg white omelette with spinach, whole wheat toast, and black coffee",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-1 w-full animate-fadeIn" id="nutritional-tracker-layout">
      {/* Left Column: AI Food Logger Panel */}
      <div className="lg:col-span-7 flex flex-col justify-between bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden p-6 md:p-8">
        <div className="space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-emerald-600 mb-1">
              <Sparkles className="w-5 h-5 fill-emerald-100 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em]">
                AI Active Tracker
              </span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 font-display">
              AI Food Intelligence Log
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Type naturally what you ate or drank today. Our deep neural parser estimates the exact calories, proteins, carbohydrates, fats, sodium, and sugars from your portion description instantly.
            </p>
          </div>

          <form onSubmit={handleAiLogSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                placeholder="Describe your meal (e.g. 'I had a medium sized avocado, 2 slices of smoked salmon on multigrain bread, and a double espresso with milk')..."
                className="w-full text-xs p-4 bg-slate-50/70 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-2xl h-28 focus:outline-hidden font-medium text-slate-800 transition-all resize-none shadow-inner"
              />
              <div className="absolute right-3.5 bottom-3 text-[10px] text-slate-400 font-mono tracking-wider">
                {query.length} chars
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-xs py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />
                    <span>Analyzing Composition...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                    <span>Process Food & Log</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowManualForm(!showManualForm)}
                className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold uppercase tracking-wider text-xs rounded-xl transition-all cursor-pointer shrink-0"
              >
                {showManualForm ? "Hide Manual Form" : "Log Manually"}
              </button>
            </div>
          </form>

          {/* Preset Chips */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
              Quick AI Simulation Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(preset)}
                  disabled={loading}
                  className="text-left text-[11px] px-3 py-2 bg-slate-50 border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50 text-slate-600 rounded-xl transition-all cursor-pointer font-medium leading-tight max-w-full truncate"
                >
                  "{preset}"
                </button>
              ))}
            </div>
          </div>

          {/* Manual Entry Form */}
          {showManualForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Log Meal Manually
              </h3>
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Meal Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Scrambled eggs"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Calories (kcal)
                    </label>
                    <input
                      type="number"
                      required
                      value={manualCalories}
                      onChange={(e) => setManualCalories(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      value={manualProtein}
                      onChange={(e) => setManualProtein(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      value={manualCarbs}
                      onChange={(e) => setManualCarbs(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Fat (g)
                    </label>
                    <input
                      type="number"
                      value={manualFat}
                      onChange={(e) => setManualFat(Number(e.target.value))}
                      className="w-full text-xs p-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-widest text-[10px] rounded-lg transition-all cursor-pointer"
                >
                  Quick Save Meal
                </button>
              </form>
            </motion.div>
          )}
        </div>

        {/* Eaten Food History Log */}
        <div className="mt-8 border-t border-slate-100 pt-6 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Today's Logged Intake ({eatenMeals.length})</span>
              </h3>
              {eatenMeals.length > 0 && (
                <button
                  onClick={onClearMeals}
                  className="text-[10px] font-extrabold uppercase text-rose-500 hover:text-rose-700 tracking-wider hover:bg-rose-50 px-2 py-1 rounded-md transition-all cursor-pointer"
                >
                  Reset Daily Log
                </button>
              )}
            </div>

            {eatenMeals.length === 0 ? (
              <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 flex flex-col items-center justify-center">
                <Apple className="w-8 h-8 text-slate-300 stroke-1 mb-2 animate-bounce" />
                <span className="text-[11px] font-bold uppercase tracking-wider">No food logged yet today</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Your parsed meals will show up here.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {eatenMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-300 transition-all text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-extrabold text-slate-800 block truncate leading-tight">
                        {meal.name}
                      </span>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono mt-0.5">
                        <span className="text-emerald-600 font-bold">{meal.calories} kcal</span>
                        <span>•</span>
                        <span>P: {meal.protein}g</span>
                        <span>•</span>
                        <span>C: {meal.carbs}g</span>
                        <span>•</span>
                        <span>F: {meal.fat}g</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveMeal(meal.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all shrink-0 cursor-pointer"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Progressive Calorie & Nutrient Ring Targets */}
      <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl overflow-hidden shadow-xl p-6 md:p-8 flex flex-col justify-between border border-slate-800 relative">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400 mb-1">
                {profile.dietType} Calibrations
              </h2>
              <h2 className="text-3xl font-black tracking-tight text-white font-display">
                Target Progress
              </h2>
              <div className="text-[10px] px-2.5 py-1 bg-slate-800 text-slate-300 font-bold uppercase tracking-wider rounded-md mt-1.5 inline-block">
                Diet: {targets.dietTweakLabel}
              </div>
            </div>

            {/* Daily Streak Count Badge */}
            <div className="flex items-center space-x-2.5 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl shrink-0 shadow-lg select-none">
              <Award className="w-5 h-5 text-amber-400 fill-amber-400/10 animate-pulse" />
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 block leading-none">Daily Streak</span>
                <span className="text-xs font-extrabold text-white font-mono">{streakCount} Days 🔥</span>
              </div>
            </div>
          </div>

          {/* Calorie Large Card Progress */}
          <div className="bg-slate-850 p-6 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 block mb-1">
                  Active Calories Target
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-none">
                    {consumed.calories}
                  </span>
                  <span className="text-xs text-slate-400 font-bold uppercase font-mono">
                    / {targets.calories} kcal
                  </span>
                </div>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
                <Flame className="w-6 h-6 fill-emerald-400" />
              </div>
            </div>

            {/* Progress indicator */}
            <div className="space-y-1 mt-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
                <span>Intake Gauge</span>
                <span>{caloriePercent}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${caloriePercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Water Intake Card Progress */}
          <div className="bg-slate-850 p-6 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 block mb-1">
                  Active Hydration Tracker
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-none">
                    {waterIntake}
                  </span>
                  <span className="text-xs text-slate-400 font-bold uppercase font-mono">
                    / {targets.waterTarget} ml
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                <Droplet className="w-6 h-6 fill-blue-400 animate-bounce" />
              </div>
            </div>

            {/* Interactive Hydration Controls */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => onUpdateWater(prev => prev + 250)}
                className="px-3 py-1.5 bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/20 rounded-xl text-[10px] font-extrabold text-blue-300 uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1"
              >
                <span>+250ml</span>
                <span className="text-[8px] text-blue-400 font-normal">(Cup)</span>
              </button>
              <button
                onClick={() => onUpdateWater(prev => prev + 500)}
                className="px-3 py-1.5 bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/20 rounded-xl text-[10px] font-extrabold text-blue-300 uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1"
              >
                <span>+500ml</span>
                <span className="text-[8px] text-blue-400 font-normal">(Bottle)</span>
              </button>
              <button
                onClick={() => onUpdateWater(prev => prev + 750)}
                className="px-3 py-1.5 bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/20 rounded-xl text-[10px] font-extrabold text-blue-300 uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1"
              >
                <span>+750ml</span>
                <span className="text-[8px] text-blue-400 font-normal">(Large)</span>
              </button>
              {waterIntake > 0 && (
                <button
                  onClick={() => onUpdateWater(0)}
                  className="px-3 py-1.5 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/10 rounded-xl text-[10px] font-extrabold text-rose-300 uppercase tracking-wider transition-all cursor-pointer"
                  title="Reset today's water"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Progress indicator */}
            <div className="space-y-1 mt-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">
                <span>Hydration Level</span>
                <span>{waterPercent}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${waterPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Core Macros Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Macronutrient Breakdown
            </h3>

            {/* Protein */}
            <div className="bg-slate-850/50 p-4 rounded-xl border border-slate-800/50 flex flex-col justify-between">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  🍖 Protein Target
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {consumed.protein}g / {targets.protein}g
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${proteinPercent}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div className="bg-slate-850/50 p-4 rounded-xl border border-slate-800/50 flex flex-col justify-between">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  🌾 Carbohydrates
                </span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {consumed.carbs}g / {targets.carbs}g
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${carbsPercent}%` }}
                />
              </div>
            </div>

            {/* Fat */}
            <div className="bg-slate-850/50 p-4 rounded-xl border border-slate-800/50 flex flex-col justify-between">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  🥑 Total Lipids (Fat)
                </span>
                <span className="text-xs font-mono font-bold text-blue-400">
                  {consumed.fat}g / {targets.fat}g
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${fatPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Informative advice based on progress */}
        <div className="mt-6 border-t border-slate-800 pt-5 text-slate-400 text-[11px] font-medium leading-relaxed flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            {caloriePercent >= 100 ? (
              <span className="text-rose-400 font-extrabold block uppercase tracking-wide">
                Daily Caloric Target Exceeded ⚠️
              </span>
            ) : caloriePercent >= 80 ? (
              <span className="text-emerald-400 font-extrabold block uppercase tracking-wide">
                Optimized Nutrient Threshold Achieved 🎉
              </span>
            ) : (
              <span className="text-slate-300 font-extrabold block uppercase tracking-wide">
                Target Fuel Recommendation
              </span>
            )}
            {profile.dietType === "Keto" 
              ? "Focus on high-fat foods, medium meats, and raw vegetables to keep carbs below 20g-30g daily target."
              : "Eat healthy grains, fresh lean meats, and green vegetables to optimize fiber and amino acids profile."}
          </div>
        </div>
      </div>
    </div>
  );
};
