import React from "react";
import { UserProfile } from "../types";
import { User, ShieldAlert, Award, ShoppingBag, Flame, Target } from "lucide-react";

interface UserProfileSetupProps {
  profile: UserProfile;
  onChangeProfile: (profile: UserProfile) => void;
}

const DIET_TYPES = [
  "Normal",
  "Vegetarian",
  "Vegan",
  "Keto",
  "Paleo",
  "Mediterranean",
  "High Protein",
  "Low Carb",
  "Gluten Free"
];

const ALLERGENS_LIST = ["Milk", "Wheat", "Gluten", "Nuts", "Soy", "Egg", "Fish"];

export const UserProfileSetup: React.FC<UserProfileSetupProps> = ({
  profile,
  onChangeProfile
}) => {
  const updateField = (key: keyof UserProfile, value: any) => {
    onChangeProfile({
      ...profile,
      [key]: value
    });
  };

  const toggleAllergy = (allergy: string) => {
    const current = [...profile.allergies];
    if (current.includes(allergy)) {
      updateField("allergies", current.filter((a) => a !== allergy));
    } else {
      updateField("allergies", [...current, allergy]);
    }
  };

  // Quick macro estimations
  const calculateTargets = () => {
    const w = profile.weight || 70;
    const h = profile.height || 175;
    const a = profile.age || 25;
    
    // Basal Metabolic Rate (BMR) simple calculation
    let bmr = 10 * w + 6.25 * h - 5 * a + 5; // male default base
    if (profile.gender === "female") {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }

    // Activity level modifier
    let tdee = bmr * 1.2;
    if (profile.activityLevel === "moderate") tdee = bmr * 1.4;
    if (profile.activityLevel === "active") tdee = bmr * 1.6;

    // Goal adjustment
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

    return {
      calories: Math.max(1200, calories),
      protein: Math.max(40, protein),
      carbs: Math.max(30, carbs),
      fat: Math.max(30, fat),
      sugarLimit: 45,
      sodiumLimit: 2200,
      dietTweakLabel
    };
  };

  const targets = calculateTargets();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
      {/* Onboarding Profile Fields */}
      <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 md:p-8 space-y-6 shadow-xs">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400 mb-1">
            Personal Setup
          </h2>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 font-display">
            Onboarding Goals
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure your biometrics and diet preferences to optimize targets.
          </p>
        </div>

        {/* Biometrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Age (Years)
            </label>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => updateField("age", Number(e.target.value))}
              className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Gender
            </label>
            <select
              value={profile.gender}
              onChange={(e) => updateField("gender", e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden font-medium text-slate-800 bg-white"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Height (cm)
            </label>
            <input
              type="number"
              value={profile.height}
              onChange={(e) => updateField("height", Number(e.target.value))}
              className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Weight (kg)
            </label>
            <input
              type="number"
              value={profile.weight}
              onChange={(e) => updateField("weight", Number(e.target.value))}
              className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden font-medium text-slate-800"
            />
          </div>
        </div>

        {/* Fitness Goal & Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Target Goal
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-xl">
              {(["lose", "maintain", "gain"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => updateField("goal", g)}
                  className={`py-2 text-[10px] font-extrabold uppercase tracking-wide rounded-lg transition-all ${
                    profile.goal === g
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {g === "lose" ? "Lose" : g === "gain" ? "Gain" : "Stay"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Activity Level
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-xl">
              {(["sedentary", "moderate", "active"] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => updateField("activityLevel", a)}
                  className={`py-2 text-[10px] font-extrabold uppercase tracking-wide rounded-lg transition-all ${
                    profile.activityLevel === a
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Diet Type Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
            Dietary Regimen
          </label>
          <div className="flex flex-wrap gap-2">
            {DIET_TYPES.map((dt) => (
              <button
                key={dt}
                type="button"
                onClick={() => updateField("dietType", dt)}
                className={`px-3 py-2 text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all border ${
                  profile.dietType === dt
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                {dt}
              </button>
            ))}
          </div>
        </div>

        {/* Budget Mode and Shopping Interval */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Weekly Budget
            </label>
            <div className="relative">
              <input
                type="number"
                value={profile.budget}
                onChange={(e) => updateField("budget", Number(e.target.value))}
                className="w-full text-xs pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden font-extrabold text-slate-900"
              />
              <span className="absolute left-3 top-3.5 text-[10px] font-bold uppercase text-slate-400">
                $
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Currency
            </label>
            <select
              value={profile.currency}
              onChange={(e) => updateField("currency", e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden font-bold text-slate-800 bg-white"
            >
              <option value="lei">RON (lei)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Planning Mode
            </label>
            <select
              value={profile.planningType}
              onChange={(e) => updateField("planningType", e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-hidden font-bold text-slate-800 bg-white"
            >
              <option value="daily">Daily Target</option>
              <option value="weekly">Weekly Cumulative</option>
              <option value="monthly">Monthly Allocation</option>
            </select>
          </div>
        </div>

        {/* Allergen Guard Setup */}
        <div className="border-t border-slate-100 pt-5">
          <label className="block text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">
            My Allergies (Strict Safety Alerts)
          </label>
          <div className="flex flex-wrap gap-2">
            {ALLERGENS_LIST.map((allergy) => {
              const active = profile.allergies.includes(allergy);
              return (
                <button
                  key={allergy}
                  type="button"
                  onClick={() => toggleAllergy(allergy)}
                  className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${
                    active
                      ? "bg-rose-100 border-rose-200 text-rose-700 font-black flex items-center gap-1"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {active && <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                  <span>{allergy}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Target Macros Scoreboard Panel */}
      <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-6 md:p-8 space-y-8 shadow-xl">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-400 mb-1">
            Calculated Targets
          </h2>
          <h3 className="text-3xl font-black tracking-tight text-white font-display">
            Target Metrics
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Personal nutrition limit thresholds based on biometrics & goals.
          </p>
          <div className="text-[10px] px-2.5 py-1 bg-slate-800 text-slate-300 font-bold uppercase tracking-wider rounded-md mt-2 inline-block">
            Diet: {targets.dietTweakLabel}
          </div>
        </div>

        {/* Calories Display */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute right-4 bottom-4 opacity-5">
            <Flame className="w-24 h-24" />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
            Recommended Calories
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-5xl font-black tracking-tighter">
              {targets.calories.toLocaleString()}
            </span>
            <span className="text-md font-medium text-slate-400 italic">kcal / day</span>
          </div>
        </div>

        {/* Macros Breakdown */}
        <div className="space-y-6">
          <div className="flex justify-between items-end border-b border-slate-800 pb-2.5">
            <div className="flex items-center space-x-2.5">
              <Award className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Protein Target</span>
                <span className="block text-3xl font-bold mt-0.5">{targets.protein}g</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {Math.round((targets.protein * 4 / targets.calories) * 100)}% Kcal
            </span>
          </div>

          <div className="flex justify-between items-end border-b border-slate-800 pb-2.5">
            <div className="flex items-center space-x-2.5">
              <Target className="w-4 h-4 text-blue-400" />
              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Carbs Target</span>
                <span className="block text-3xl font-bold mt-0.5">{targets.carbs}g</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {Math.round((targets.carbs * 4 / targets.calories) * 100)}% Kcal
            </span>
          </div>

          <div className="flex justify-between items-end border-b border-slate-800 pb-2.5">
            <div className="flex items-center space-x-2.5">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-xs font-bold uppercase text-slate-400">Fat Target</span>
                <span className="block text-3xl font-bold mt-0.5">{targets.fat}g</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {Math.round((targets.fat * 9 / targets.calories) * 100)}% Kcal
            </span>
          </div>
        </div>

        {/* Micronutrients and Limits */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Sugar Ceiling
            </span>
            <span className="text-lg font-bold text-white">&lt; {targets.sugarLimit}g</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-800">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Sodium Ceiling
            </span>
            <span className="text-lg font-bold text-white">&lt; {targets.sodiumLimit}mg</span>
          </div>
        </div>

        {/* Dynamic Coach Tip */}
        <div className="bg-slate-800 p-5 rounded-2xl">
          <h4 className="text-[11px] font-black uppercase text-slate-300 tracking-wider mb-1.5">
            Dietary Regimen Directive
          </h4>
          <p className="text-xs text-slate-200 leading-relaxed font-medium">
            Your goals are calibrated for {profile.goal === "lose" ? "fat oxidation" : profile.goal === "gain" ? "hypertrophy" : "metabolic balance"}. Under {profile.dietType} settings, keep protein elevated and limit sodium triggers.
          </p>
        </div>
      </div>
    </div>
  );
};
