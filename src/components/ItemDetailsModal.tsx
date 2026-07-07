import React from "react";
import { X, Sparkles, AlertTriangle, CheckCircle2, ShieldAlert, Heart, Info } from "lucide-react";
import { CartItem } from "../types";

interface ItemDetailsModalProps {
  item: CartItem | null;
  onClose: () => void;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({ item, onClose }) => {
  if (!item || !item.analysis) return null;

  const analysis = item.analysis;
  const nutrition = analysis.nutrition;

  const getVerdictBadgeClass = (verdict: string) => {
    const v = verdict.toLowerCase();
    if (v.includes("ultra") || v.includes("highly")) {
      return "bg-rose-50 border-rose-200 text-rose-700";
    }
    if (v.includes("minimal") || v.includes("clean") || v.includes("whole")) {
      return "bg-emerald-50 border-emerald-200 text-emerald-700";
    }
    return "bg-amber-50 border-amber-200 text-amber-700";
  };

  const getHazardDotColor = (hazard: string) => {
    if (hazard === "high") return "bg-rose-500 ring-rose-100";
    if (hazard === "medium") return "bg-amber-500 ring-amber-100";
    return "bg-emerald-500 ring-emerald-100";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fadeIn" id="item-details-modal">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/20">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 text-[9px] font-bold tracking-[0.15em] uppercase bg-slate-900 text-white rounded-md">
                Detailed Analysis
              </span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Qty: {item.quantity} Unit(s)</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mt-2 font-display">
              {item.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {/* Verdict Banner */}
          <div className={`p-5 rounded-3xl border-2 flex items-start space-x-4 ${getVerdictBadgeClass(analysis.processingVerdict)}`}>
            <Sparkles className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-extrabold uppercase tracking-wide text-xs">
                Safety Verdict: {analysis.processingVerdict}
              </h4>
              <p className="text-sm mt-1 leading-relaxed font-medium">
                {analysis.processingVerdictExplanation}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1: Nutrition Facts Label */}
            <div className="border-4 border-slate-900 p-5 rounded-2xl font-sans text-slate-950 bg-white select-none shadow-sm">
              <h4 className="font-black text-2xl tracking-tighter uppercase border-b-8 border-slate-900 pb-1">
                Nutrition Facts
              </h4>
              <p className="text-[11px] font-bold border-b border-slate-400 py-1.5 flex justify-between uppercase tracking-wider text-slate-500">
                <span>Serving Size Base</span>
                <span className="font-extrabold text-slate-900">Per 100g / ml</span>
              </p>
              
              <div className="border-b-4 border-slate-900 py-2 flex justify-between items-baseline">
                <span className="text-lg font-black uppercase tracking-tight">Calories</span>
                <span className="text-3xl font-black">{Math.round(nutrition.calories)}</span>
              </div>

              {/* Nutrients List */}
              <div className="text-xs divide-y divide-slate-200 font-medium">
                <div className="py-2.5 flex justify-between">
                  <span>
                    <strong className="font-bold">Total Fat</strong> {nutrition.fat.toFixed(1)}g
                  </span>
                  <span className="font-extrabold">{Math.round((nutrition.fat / 65) * 100)}%</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span>
                    <strong className="font-bold">Sodium</strong> {nutrition.sodium.toFixed(0)}mg
                  </span>
                  <span className="font-extrabold">{Math.round((nutrition.sodium / 2300) * 100)}%</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span>
                    <strong className="font-bold">Total Carbohydrate</strong> {nutrition.carbs.toFixed(1)}g
                  </span>
                  <span className="font-extrabold">{Math.round((nutrition.carbs / 300) * 100)}%</span>
                </div>
                <div className="py-2 pl-4 flex justify-between text-slate-500">
                  <span>Total Sugars {nutrition.sugar.toFixed(1)}g</span>
                  <span className="font-semibold">{Math.round((nutrition.sugar / 50) * 100)}%</span>
                </div>
                <div className="py-2.5 flex justify-between border-b-8 border-slate-900">
                  <span>
                    <strong className="font-bold">Protein</strong> {nutrition.protein.toFixed(1)}g
                  </span>
                  <span className="font-extrabold">{Math.round((nutrition.protein / 50) * 100)}%</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 mt-2.5 leading-tight font-medium">
                * Percent Daily Values (DV) are based on a 2,000 calorie reference diet.
              </p>
            </div>

            {/* Column 2: Ingredients list & Allergens */}
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-2.5">
                  Parsed Ingredients
                </h4>
                <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {analysis.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 text-xs font-bold uppercase tracking-wide bg-slate-50 border border-slate-100 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              {/* Allergens Alert */}
              {analysis.allergens && analysis.allergens.length > 0 && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-3xl flex items-start space-x-3">
                  <ShieldAlert className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                  <div>
                    <h5 className="font-bold text-xs text-rose-800 uppercase tracking-wide">Potential Allergens</h5>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {analysis.allergens.map((allergen, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white border border-rose-200 text-rose-700 rounded-lg"
                        >
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Warning/Benefits Summary */}
              <div className="space-y-2.5">
                {analysis.beneficials.length > 0 && (
                  <div className="flex items-start space-x-2 text-xs text-emerald-800 bg-emerald-50/40 p-3 rounded-2xl border border-emerald-100/40">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium">
                      <strong className="font-bold uppercase tracking-wider text-[10px] block mb-0.5">Nutritional Pros</strong> {analysis.beneficials.join(", ")}
                    </span>
                  </div>
                )}
                {analysis.warnings.length > 0 && (
                  <div className="flex items-start space-x-2 text-xs text-amber-800 bg-amber-50/40 p-3 rounded-2xl border border-amber-100/40">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="font-medium">
                      <strong className="font-bold uppercase tracking-wider text-[10px] block mb-0.5">Ingredient Warnings</strong> {analysis.warnings.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additive Spotlight */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Additive Analysis Spotlight
            </h4>
            {analysis.additives && analysis.additives.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.additives.map((add, i) => (
                  <div
                    key={i}
                    className="p-4 border border-slate-100 rounded-2xl bg-slate-50/30 flex items-start space-x-3"
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ring-4 shrink-0 mt-1 ${getHazardDotColor(add.hazard)}`} />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-800">{add.name}</span>
                        <span className="px-2 py-0.5 text-[8px] font-bold rounded uppercase bg-slate-200 text-slate-600 tracking-wider">
                          {add.hazard} risk
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">
                        {add.function}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {add.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider bg-emerald-50/30 p-4 rounded-3xl border border-emerald-100">
                🎉 No food additives (artificial colors, preservatives) detected.
              </p>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end space-x-2 text-[10px] text-slate-400 font-mono items-center px-6 md:px-8">
          <Info className="w-3.5 h-3.5 text-slate-400 mr-1" />
          <span>Calculations base USDA / Food Standards Agency Guidelines.</span>
        </div>
      </div>
    </div>
  );
};
