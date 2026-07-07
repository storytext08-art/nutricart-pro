import React, { useState } from "react";
import { Plus, Minus, Trash2, Sparkles, ShoppingCart, Info, AlertCircle, PlusCircle, Check, RefreshCw } from "lucide-react";
import { CartItem } from "../types";
import { PREDEFINED_ITEMS, PredefinedFood } from "../predefinedItems";

interface CartManagerProps {
  cart: CartItem[];
  onAddItem: (name: string, ingredientsText: string, quantity: number) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onRefreshCart: () => void;
  onSelectActiveItem: (item: CartItem) => void;
  selectedItemId: string | null;
}

export const CartManager: React.FC<CartManagerProps> = ({
  cart,
  onAddItem,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onRefreshCart,
  onSelectActiveItem,
  selectedItemId,
}) => {
  const [customName, setCustomName] = useState("");
  const [customIngredients, setCustomIngredients] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"quick" | "custom">("quick");
  const [notification, setNotification] = useState<string | null>(null);

  const triggerNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    onAddItem(customName.trim(), customIngredients.trim(), quantity);
    triggerNotification(`Added ${customName.trim()} to cart!`);
    setCustomName("");
    setCustomIngredients("");
    setQuantity(1);
  };

  const handleQuickAdd = (food: PredefinedFood) => {
    onAddItem(food.name, food.ingredientsText, 1);
    triggerNotification(`Added ${food.name} to cart!`);
  };

  const getVerdictBadgeColor = (verdict?: string) => {
    if (!verdict) return "bg-gray-100 text-gray-700 border-gray-200";
    const v = verdict.toLowerCase();
    if (v.includes("ultra") || v.includes("highly") || v.includes("process")) {
      return "bg-rose-50 text-rose-700 border-rose-200";
    }
    if (v.includes("minimal") || v.includes("clean") || v.includes("whole")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden" id="cart-manager">
      {/* Header */}
      <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400 mb-1">Current Selection</h2>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 font-display">My Shopping Cart</h2>
          <p className="text-xs text-slate-500 mt-0.5">{cart.length} active unique product(s)</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRefreshCart}
            className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-600 hover:text-white hover:bg-emerald-600 transition-all px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200/50 hover:border-emerald-600"
            title="Reload with 10 diet-specific food items"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Cart (10 Foods)</span>
          </button>
          {cart.length > 0 && (
            <button
              onClick={onClearCart}
              className="text-xs font-bold uppercase tracking-wider text-rose-500 hover:text-rose-700 transition-colors px-3 py-2 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-100"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Main Forms Section */}
      <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/40">
        {/* Tab switcher */}
        <div className="flex space-x-2 bg-slate-100 p-1 rounded-2xl mb-5">
          <button
            onClick={() => setActiveTab("quick")}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              activeTab === "quick"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Quick Add
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
              activeTab === "custom"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Custom Label
          </button>
        </div>

        {/* Tab 1: Quick Add List */}
        {activeTab === "quick" && (
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {PREDEFINED_ITEMS.map((food, index) => (
              <div
                key={index}
                className="group flex items-center justify-between p-4 bg-white border border-slate-100 hover:border-emerald-300 rounded-2xl transition-all duration-200"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="font-bold text-sm text-slate-800 truncate group-hover:text-emerald-700">
                      {food.name}
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-slate-100 text-slate-500 scale-90 origin-left">
                      {food.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{food.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickAdd(food)}
                  className="p-2 bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-600 hover:text-white rounded-xl text-slate-600 transition-all shrink-0 cursor-pointer"
                  title="Add to cart"
                >
                  <PlusCircle className="w-4.5 h-4.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Custom Form */}
        {activeTab === "custom" && (
          <form onSubmit={handleAddCustom} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-1.5">
                Product Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Crunchy Peanut Butter, Diet Iced Tea"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full text-xs px-4 py-2.5 bg-white border border-slate-250 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-900 placeholder-slate-400"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Ingredients <span className="text-slate-300 font-normal">(Optional)</span>
                </label>
                <span className="text-[10px] text-emerald-700 font-bold flex items-center space-x-1 bg-emerald-50 px-2 py-0.5 rounded-lg">
                  <Sparkles className="w-3 h-3" />
                  <span>AI Lookup</span>
                </span>
              </div>
              <textarea
                placeholder="Paste nutrition label ingredients or leave blank to auto-estimate..."
                value={customIngredients}
                onChange={(e) => setCustomIngredients(e.target.value)}
                rows={2}
                className="w-full text-xs px-4 py-2.5 bg-white border border-slate-250 rounded-xl focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-900 placeholder-slate-400 resize-none"
              />
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-1/3">
                <label className="block text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-1.5">
                  Qty
                </label>
                <div className="flex items-center border border-slate-250 rounded-xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 flex-1 flex justify-center"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-bold text-slate-800 w-8 text-center bg-white py-1">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 flex-1 flex justify-center"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="w-2/3 pt-5">
                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-wider text-xs py-3 rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-4 bg-white">
        <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400 flex items-center space-x-2">
          <span>Active Cart Items</span>
          <span className="bg-slate-900 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">
            {cart.reduce((acc, curr) => acc + curr.quantity, 0)}
          </span>
        </h3>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
            <ShoppingCart className="w-12 h-12 text-slate-300 stroke-1 mb-3" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Your shopping cart is empty.</p>
            <p className="text-[11px] text-slate-400 mt-1">Select a quick product above to begin analyzing.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => {
              const isSelected = selectedItemId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => !item.isLoading && onSelectActiveItem(item)}
                  className={`border rounded-3xl p-5 transition-all duration-250 cursor-pointer ${
                    isSelected
                      ? "bg-slate-50/70 border-slate-900 shadow-xs"
                      : "bg-slate-50/50 border-slate-100/80 hover:bg-slate-50 hover:border-slate-300 shadow-2xs"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-3">
                      <h4 className="text-xl font-bold tracking-tight text-slate-900 leading-snug">
                        {item.name}
                      </h4>
                      {item.isLoading ? (
                        <div className="flex items-center space-x-1.5 mt-2">
                          <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider">
                            Analyzing...
                          </span>
                        </div>
                      ) : item.error ? (
                        <div className="flex items-center space-x-1.5 mt-2 text-rose-600">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span className="text-xs font-bold uppercase tracking-wide truncate">
                            {item.error}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 mt-2 flex-wrap gap-y-1">
                          <span
                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border ${getVerdictBadgeColor(
                              item.analysis?.processingVerdict
                            )}`}
                          >
                            {item.analysis?.processingVerdict || "Clean Label"}
                          </span>
                          {item.analysis?.allergens && item.analysis.allergens.length > 0 && (
                            <span className="px-3 py-1 text-[10px] font-bold uppercase rounded-full bg-rose-100 border border-rose-200 text-rose-700 flex items-center space-x-1">
                              <span>⚠️</span>
                              <span>{item.analysis.allergens.length} Allergens</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white mr-1 shadow-2xs">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-2.5 text-slate-800 min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="p-1.5 text-slate-500 hover:bg-slate-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>

                  {/* Individual Mini Nutrients with Bold styling */}
                  {!item.isLoading && item.analysis && (
                    <div className="mt-4 pt-4 border-t border-slate-200/60 flex justify-between text-xs text-slate-500 font-medium">
                      <div>
                        <span className="font-extrabold text-slate-900 text-sm">
                          {Math.round(item.analysis.nutrition.calories * item.quantity)}
                        </span>{" "}
                        kcal
                      </div>
                      <div>
                        P: <span className="font-bold text-slate-900">{Math.round(item.analysis.nutrition.protein * item.quantity)}g</span>
                      </div>
                      <div>
                        C: <span className="font-bold text-slate-900">{Math.round(item.analysis.nutrition.carbs * item.quantity)}g</span>
                      </div>
                      <div>
                        F: <span className="font-bold text-slate-900">{Math.round(item.analysis.nutrition.fat * item.quantity)}g</span>
                      </div>
                      <div className="hidden sm:block">
                        Sugar: <span className="font-bold text-slate-900">{Math.round(item.analysis.nutrition.sugar * item.quantity)}g</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mini Notification Banner */}
      {notification && (
        <div className="absolute bottom-4 left-4 right-4 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-lg flex items-center space-x-2 animate-bounce z-50">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="font-bold uppercase tracking-wider text-[10px]">{notification}</span>
        </div>
      )}
    </div>
  );
};
