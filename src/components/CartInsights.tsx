import React, { useState } from "react";
import { Activity, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, AlertOctagon, Heart, RefreshCw, ShoppingBag, PiggyBank, Smile } from "lucide-react";
import { CartItem, AdditiveInfo, UserProfile } from "../types";

interface CartInsightsProps {
  cart: CartItem[];
  selectedItem: CartItem | null;
  profile: UserProfile;
}

export const CartInsights: React.FC<CartInsightsProps> = ({ cart, selectedItem, profile }) => {
  const [activeSubTab, setActiveSubTab] = useState<"totals" | "safety">("totals");

  const getTargets = () => {
    const w = profile.weight || 70;
    const h = profile.height || 175;
    const a = profile.age || 25;
    
    let bmr = 10 * w + 6.25 * h - 5 * a + 5;
    if (profile.gender === "female") {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }

    let tdee = bmr * 1.2;
    if (profile.activityLevel === "moderate") tdee = bmr * 1.4;
    if (profile.activityLevel === "active") tdee = bmr * 1.6;

    let calories = Math.round(tdee);
    if (profile.goal === "lose") calories = Math.round(tdee - 500);
    if (profile.goal === "gain") calories = Math.round(tdee + 300);

    // Diet type modifier (changes calorie target dynamically for every diet)
    let calorieMultiplier = 1.0;
    const selectedDiet = (profile.dietType || "Normal").toLowerCase();

    if (selectedDiet === "vegetarian") {
      calorieMultiplier = 0.96;
    } else if (selectedDiet === "vegan") {
      calorieMultiplier = 0.94;
    } else if (selectedDiet === "keto") {
      calorieMultiplier = 0.88;
    } else if (selectedDiet === "paleo") {
      calorieMultiplier = 0.92;
    } else if (selectedDiet === "mediterranean") {
      calorieMultiplier = 0.98;
    } else if (selectedDiet === "high protein") {
      calorieMultiplier = 1.05;
    } else if (selectedDiet === "low carb") {
      calorieMultiplier = 0.90;
    } else if (selectedDiet === "gluten free") {
      calorieMultiplier = 0.95;
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

    return {
      calories: Math.max(1200, calories),
      protein: Math.max(40, protein),
      carbs: Math.max(30, carbs),
      fat: Math.max(30, fat),
      sugarLimit: 45,
      sodiumLimit: 2200,
      budget: profile.budget || 350
    };
  };

  const targets = getTargets();

  // Filter completed analysed items
  const analysedItems = cart.filter((item) => !item.isLoading && item.analysis);

  // Aggregate Nutritional Totals (assuming 100g base per unit qty)
  const totalCalories = analysedItems.reduce(
    (acc, item) => acc + (item.analysis?.nutrition.calories || 0) * item.quantity,
    0
  );
  const totalProtein = analysedItems.reduce(
    (acc, item) => acc + (item.analysis?.nutrition.protein || 0) * item.quantity,
    0
  );
  const totalCarbs = analysedItems.reduce(
    (acc, item) => acc + (item.analysis?.nutrition.carbs || 0) * item.quantity,
    0
  );
  const totalFat = analysedItems.reduce(
    (acc, item) => acc + (item.analysis?.nutrition.fat || 0) * item.quantity,
    0
  );
  const totalSugar = analysedItems.reduce(
    (acc, item) => acc + (item.analysis?.nutrition.sugar || 0) * item.quantity,
    0
  );
  const totalSodium = analysedItems.reduce(
    (acc, item) => acc + (item.analysis?.nutrition.sodium || 0) * item.quantity,
    0
  );

  // Collect and deduplicate Allergens across cart
  const allAllergens = Array.from(
    new Set(analysedItems.flatMap((item) => item.analysis?.allergens || []))
  );

  // Collect and deduplicate warnings
  const allWarnings = Array.from(
    new Set(analysedItems.flatMap((item) => item.analysis?.warnings || []))
  );

  // Collect and deduplicate beneficial elements
  const allBeneficials = Array.from(
    new Set(analysedItems.flatMap((item) => item.analysis?.beneficials || []))
  );

  // Group additives
  const highHazardAdditives: { additive: AdditiveInfo; productName: string }[] = [];
  const medHazardAdditives: { additive: AdditiveInfo; productName: string }[] = [];
  const lowHazardAdditives: { additive: AdditiveInfo; productName: string }[] = [];

  analysedItems.forEach((item) => {
    item.analysis?.additives.forEach((add) => {
      const entry = { additive: add, productName: item.name };
      if (add.hazard === "high") {
        highHazardAdditives.push(entry);
      } else if (add.hazard === "medium") {
        medHazardAdditives.push(entry);
      } else {
        lowHazardAdditives.push(entry);
      }
    });
  });

  // Calculate Processing Level Breakdown
  let ultraProcessedCount = 0;
  let moderatelyProcessedCount = 0;
  let cleanLabelCount = 0;

  analysedItems.forEach((item) => {
    const verdict = (item.analysis?.processingVerdict || "").toLowerCase();
    if (verdict.includes("ultra") || verdict.includes("highly")) {
      ultraProcessedCount += item.quantity;
    } else if (verdict.includes("minimal") || verdict.includes("clean") || verdict.includes("whole")) {
      cleanLabelCount += item.quantity;
    } else {
      moderatelyProcessedCount += item.quantity;
    }
  });

  const totalItemsCount = analysedItems.reduce((acc, item) => acc + item.quantity, 0);

  // Macro progress percentages towards target goals
  const proteinPercent = (totalProtein / (targets.protein || 1)) * 100;
  const carbsPercent = (totalCarbs / (targets.carbs || 1)) * 100;
  const fatPercent = (totalFat / (targets.fat || 1)) * 100;

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white rounded-3xl overflow-hidden shadow-xl" id="cart-insights">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400 mb-1">Basket Evaluation</h2>
          <h2 className="text-3xl font-black tracking-tight text-white font-display">Cart Insights</h2>
        </div>
        <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-full text-slate-300 text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span>Live Sync</span>
        </div>
      </div>

      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <Heart className="w-16 h-16 text-slate-700 stroke-1 mb-4 animate-pulse" />
          <h4 className="text-xl font-bold tracking-tight text-white">Empty Basket Analysis</h4>
          <p className="text-xs text-slate-400 mt-2 max-w-[280px] leading-relaxed">
            Add items to your cart on the left. The dynamic intelligence engine will analyze chemical safety and nutrient volume.
          </p>
        </div>
      ) : analysedItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
          <h4 className="text-xl font-bold tracking-tight text-white">Analyzing Composition</h4>
          <p className="text-xs text-slate-400 mt-2">
            AI is checking raw ingredients against dietary hazard databases.
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          {/* Sub Tab Switcher with Sleek Dark styling */}
          <div className="px-6 md:px-8 pt-4 flex border-b border-slate-800">
            <button
              onClick={() => setActiveSubTab("totals")}
              className={`pb-3 text-xs font-black uppercase tracking-wider transition-all relative pr-6 cursor-pointer ${
                activeSubTab === "totals" ? "text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Totals & Macros
              {activeSubTab === "totals" && (
                <div className="absolute bottom-0 left-0 right-6 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveSubTab("safety")}
              className={`pb-3 text-xs font-black uppercase tracking-wider transition-all relative px-2 cursor-pointer ${
                activeSubTab === "safety" ? "text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Safety & Additives
              {activeSubTab === "safety" && (
                <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
            {/* Sub Tab 1: Nutritional Totals */}
            {activeSubTab === "totals" && (
              <div className="space-y-8 animate-fadeIn">
                {/* Total Calories & Budget Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-800">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2">
                      Calories Progress
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl md:text-5xl font-black block leading-none tracking-tighter">
                        {Math.round(totalCalories)}
                      </span>
                      <span className="text-xs text-slate-400 font-bold uppercase">
                        / {targets.calories} kcal
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, (totalCalories / targets.calories) * 100)}%` }}
                        className={`h-full ${totalCalories > targets.calories ? "bg-rose-500" : "bg-emerald-400"}`}
                      />
                    </div>
                  </div>

                  {/* Budget Spent Optimization */}
                  <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-800">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2">
                      Budget Allocation
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl md:text-5xl font-black block leading-none tracking-tighter">
                        {cart.reduce((acc, item) => {
                          const getPrice = (name: string): number => {
                            const n = name.toLowerCase();
                            if (n.includes("spinach")) return 6;
                            if (n.includes("granola") || n.includes("bar")) return 15;
                            if (n.includes("chips") || n.includes("flamin")) return 8;
                            if (n.includes("yogurt")) return 5;
                            if (n.includes("cola") || n.includes("beverage")) return 4;
                            if (n.includes("bread") || n.includes("sourdough")) return 9;
                            if (n.includes("protein isolate") || n.includes("whey")) return 120;
                            if (n.includes("rice cake")) return 7;
                            if (n.includes("energy drink") || n.includes("raspberry")) return 10;
                            if (n.includes("sausage")) return 18;
                            return 12;
                          };
                          return acc + getPrice(item.name) * item.quantity;
                        }, 0)}
                      </span>
                      <span className="text-xs text-slate-400 font-bold uppercase">
                        / {targets.budget} {profile.currency}
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div
                        style={{
                          width: `${Math.min(
                            100,
                            (cart.reduce((acc, item) => {
                              const getPrice = (name: string): number => {
                                const n = name.toLowerCase();
                                if (n.includes("spinach")) return 6;
                                if (n.includes("granola") || n.includes("bar")) return 15;
                                if (n.includes("chips") || n.includes("flamin")) return 8;
                                if (n.includes("yogurt")) return 5;
                                if (n.includes("cola") || n.includes("beverage")) return 4;
                                if (n.includes("bread") || n.includes("sourdough")) return 9;
                                if (n.includes("protein isolate") || n.includes("whey")) return 120;
                                if (n.includes("rice cake")) return 7;
                                if (n.includes("energy drink") || n.includes("raspberry")) return 10;
                                if (n.includes("sausage")) return 18;
                                return 12;
                              };
                              return acc + getPrice(item.name) * item.quantity;
                            }, 0) /
                              targets.budget) *
                              100
                          )}%`,
                        }}
                        className={`h-full ${
                          cart.reduce((acc, item) => {
                            const getPrice = (name: string): number => {
                              const n = name.toLowerCase();
                              if (n.includes("spinach")) return 6;
                              if (n.includes("granola") || n.includes("bar")) return 15;
                              if (n.includes("chips") || n.includes("flamin")) return 8;
                              if (n.includes("yogurt")) return 5;
                              if (n.includes("cola") || n.includes("beverage")) return 4;
                              if (n.includes("bread") || n.includes("sourdough")) return 9;
                              if (n.includes("protein isolate") || n.includes("whey")) return 120;
                              if (n.includes("rice cake")) return 7;
                              if (n.includes("energy drink") || n.includes("raspberry")) return 10;
                              if (n.includes("sausage")) return 18;
                              return 12;
                            };
                            return acc + getPrice(item.name) * item.quantity;
                          }, 0) > targets.budget
                            ? "bg-rose-500"
                            : "bg-emerald-400"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Macros Display with custom styled bar track layout from Theme HTML */}
                <div className="space-y-6">
                  {/* Protein */}
                  <div className="flex justify-between items-end border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Protein</span>
                      <span className="block text-3xl md:text-4xl font-bold mt-1">
                        {Math.round(totalProtein)}g{" "}
                        <span className="text-xs text-slate-400 font-normal">/ {targets.protein}g</span>
                      </span>
                    </div>
                    <div className="w-32 md:w-44 h-1.5 bg-slate-800 overflow-hidden rounded-full mb-2">
                      <div
                        style={{ width: `${Math.min(100, proteinPercent)}%` }}
                        className="h-full bg-emerald-400 transition-all duration-500"
                      />
                    </div>
                  </div>

                  {/* Carbohydrates */}
                  <div className="flex justify-between items-end border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Carbohydrates</span>
                      <span className="block text-3xl md:text-4xl font-bold mt-1">
                        {Math.round(totalCarbs)}g{" "}
                        <span className="text-xs text-slate-400 font-normal">/ {targets.carbs}g</span>
                      </span>
                    </div>
                    <div className="w-32 md:w-44 h-1.5 bg-slate-800 overflow-hidden rounded-full mb-2">
                      <div
                        style={{ width: `${Math.min(100, carbsPercent)}%` }}
                        className="h-full bg-blue-400 transition-all duration-500"
                      />
                    </div>
                  </div>

                  {/* Healthy Fats */}
                  <div className="flex justify-between items-end border-b border-slate-800 pb-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Healthy Fats</span>
                      <span className="block text-3xl md:text-4xl font-bold mt-1">
                        {Math.round(totalFat)}g{" "}
                        <span className="text-xs text-slate-400 font-normal">/ {targets.fat}g</span>
                      </span>
                    </div>
                    <div className="w-32 md:w-44 h-1.5 bg-slate-800 overflow-hidden rounded-full mb-2">
                      <div
                        style={{ width: `${Math.min(100, fatPercent)}%` }}
                        className="h-full bg-amber-400 transition-all duration-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Progress Gauges for Sugar & Sodium */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sugar Limit</span>
                    <p className="text-xl font-bold mt-0.5 text-white">{Math.round(totalSugar)}g / {targets.sugarLimit}g</p>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, (totalSugar / targets.sugarLimit) * 100)}%` }}
                        className={`h-full ${totalSugar > targets.sugarLimit ? "bg-rose-500" : "bg-emerald-400"}`}
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sodium Limit</span>
                    <p className="text-xl font-bold mt-0.5 text-white">{Math.round(totalSodium)}mg / {targets.sodiumLimit}mg</p>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, (totalSodium / targets.sodiumLimit) * 100)}%` }}
                        className={`h-full ${totalSodium > 1500 ? "bg-rose-500" : "bg-emerald-400"}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Processing Classification Profile */}
                <div className="bg-slate-800/20 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Basket Processing Profile
                  </h4>
                  <div className="flex h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${totalItemsCount ? (cleanLabelCount / totalItemsCount) * 100 : 0}%` }}
                      className="bg-emerald-400"
                    />
                    <div
                      style={{ width: `${totalItemsCount ? (moderatelyProcessedCount / totalItemsCount) * 100 : 0}%` }}
                      className="bg-amber-400"
                    />
                    <div
                      style={{ width: `${totalItemsCount ? (ultraProcessedCount / totalItemsCount) * 100 : 0}%` }}
                      className="bg-rose-500"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400">
                    <span>Clean ({cleanLabelCount})</span>
                    <span>Processed ({moderatelyProcessedCount})</span>
                    <span>Ultra ({ultraProcessedCount})</span>
                  </div>
                </div>
              </div>
            )}

            {/* Sub Tab 2: Ingredient Safety & Additives */}
            {activeSubTab === "safety" && (
              <div className="space-y-6 animate-fadeIn text-slate-200">
                {/* Allergen Alert Box */}
                <div className={`p-5 rounded-2xl border ${
                  allAllergens.length > 0
                    ? "bg-rose-950/20 border-rose-900/50"
                    : "bg-emerald-950/20 border-emerald-900/50"
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <ShieldAlert className={`w-5 h-5 ${allAllergens.length > 0 ? "text-rose-400" : "text-emerald-400"}`} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${allAllergens.length > 0 ? "text-rose-300" : "text-emerald-300"}`}>
                      Allergen Safety Guard
                    </span>
                  </div>
                  {allAllergens.length > 0 ? (
                    <div>
                      <p className="text-xs text-slate-300 leading-relaxed mb-3">
                        Caution: High risk dietary allergens identified in active ingredients:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {allAllergens.map((allergen, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide bg-rose-900/50 border border-rose-800 text-rose-200 rounded"
                          >
                            {allergen}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300">
                      Zero allergen contamination warnings detected (Milk, Gluten, Nuts, Soy, Egg, Wheat clear).
                    </p>
                  )}
                </div>

                {/* Additive Breakdown List */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Chemical Additive Audit
                    </h4>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-bold uppercase">
                      {highHazardAdditives.length + medHazardAdditives.length + lowHazardAdditives.length} flagged
                    </span>
                  </div>

                  {/* High Hazard */}
                  {highHazardAdditives.length > 0 && (
                    <div className="border border-rose-900/60 rounded-2xl overflow-hidden">
                      <div className="bg-rose-900/80 text-rose-100 px-4 py-2.5 flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider">
                        <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>High Hazard Chemicals ({highHazardAdditives.length})</span>
                      </div>
                      <div className="divide-y divide-rose-950/40 bg-rose-950/10">
                        {highHazardAdditives.map((entry, i) => (
                          <div key={i} className="p-4 text-xs">
                            <div className="flex justify-between items-start font-bold text-white mb-1.5">
                              <span>{entry.additive.name}</span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                in {entry.productName}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              <span className="font-bold text-rose-300 uppercase tracking-wider text-[9px] bg-rose-900/30 border border-rose-800/50 px-1.5 py-0.5 rounded mr-2">
                                {entry.additive.function}
                              </span>
                              {entry.additive.note}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medium Hazard */}
                  {medHazardAdditives.length > 0 && (
                    <div className="border border-amber-900/60 rounded-2xl overflow-hidden">
                      <div className="bg-amber-900/80 text-amber-100 px-4 py-2.5 flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Moderate Hazard Warnings ({medHazardAdditives.length})</span>
                      </div>
                      <div className="divide-y divide-amber-950/40 bg-amber-950/10">
                        {medHazardAdditives.map((entry, i) => (
                          <div key={i} className="p-4 text-xs">
                            <div className="flex justify-between items-start font-bold text-white mb-1.5">
                              <span>{entry.additive.name}</span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                in {entry.productName}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              <span className="font-bold text-amber-300 uppercase tracking-wider text-[9px] bg-amber-900/30 border border-amber-800/50 px-1.5 py-0.5 rounded mr-2">
                                {entry.additive.function}
                              </span>
                              {entry.additive.note}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Low Hazard */}
                  {lowHazardAdditives.length > 0 && (
                    <div className="border border-slate-800 rounded-2xl overflow-hidden">
                      <div className="bg-slate-800 text-slate-200 px-4 py-2.5 flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Safe / Minimal Risk ({lowHazardAdditives.length})</span>
                      </div>
                      <div className="divide-y divide-slate-800/50 bg-slate-900/40 max-h-[220px] overflow-y-auto">
                        {lowHazardAdditives.map((entry, i) => (
                          <div key={i} className="p-4 text-xs">
                            <div className="flex justify-between items-start font-bold text-white mb-1.5">
                              <span>{entry.additive.name}</span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                in {entry.productName}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              <span className="font-bold text-emerald-300 uppercase tracking-wider text-[9px] bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded mr-2">
                                {entry.additive.function}
                              </span>
                              {entry.additive.note}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {highHazardAdditives.length === 0 &&
                    medHazardAdditives.length === 0 &&
                    lowHazardAdditives.length === 0 && (
                      <div className="p-8 border border-slate-850 rounded-2xl bg-slate-900/40 text-center text-slate-400 text-xs uppercase tracking-wide">
                        No synthetic food additives detected. Healthy grocery baseline.
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* Daily Summary Block from Theme HTML */}
          <div className="p-6 md:p-8 bg-slate-800 border-t border-slate-750 shrink-0">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Daily Summary</p>
            <p className="text-sm leading-relaxed font-medium text-slate-100">
              Current cart is containing{" "}
              <span className="text-emerald-400 font-bold">
                {cleanLabelCount > 0
                  ? `${Math.round((cleanLabelCount / (totalItemsCount || 1)) * 100)}% Clean Label`
                  : "0% clean label"}
              </span>{" "}
              elements. Nutrient density matches optimal thresholds for general recovery, highlighting high safety protocols.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
