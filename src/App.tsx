import { useState, useEffect } from "react";
import { Sparkles, Heart, RefreshCw, PlusCircle, CheckCircle2, Settings, User, LogOut } from "lucide-react";
import { CartItem, UserProfile, EatenMeal } from "./types";
import { CartManager } from "./components/CartManager";
import { CartInsights } from "./components/CartInsights";
import { ItemDetailsModal } from "./components/ItemDetailsModal";
import { UserProfileSetup } from "./components/UserProfileSetup";
import { AuthScreen } from "./components/AuthScreen";
import { NutritionalTracker } from "./components/NutritionalTracker";
import { getDietSpecificPredefinedItems } from "./predefinedItems";

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [activeTab, setActiveTab] = useState<"ingredients" | "tracking">("ingredients");
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [eatenMeals, setEatenMeals] = useState<EatenMeal[]>([]);
  const [waterIntake, setWaterIntake] = useState<number>(0);
  const [streakCount, setStreakCount] = useState<number>(1);
  const [profile, setProfile] = useState<UserProfile>({
    gender: "male",
    age: 25,
    weight: 70,
    height: 175,
    activityLevel: "moderate",
    goal: "maintain",
    dietType: "Normal",
    budget: 350,
    currency: "Lei",
    allergies: [],
    planningType: "weekly"
  });

  // Sync with localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("nutricart_ai_cart_v2");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart storage:", e);
      }
    } else {
      // Initialize with a healthy starter item to show off the system immediately
      handleAddItem("Organic Baby Spinach", "Organic Baby Spinach", 1);
    }

    const savedProfile = localStorage.getItem("nutricart_ai_profile");
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Failed to parse profile storage:", e);
      }
    }

    const savedUser = localStorage.getItem("nutricart_ai_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user storage:", e);
      }
    }

    const savedMeals = localStorage.getItem("nutricart_ai_eaten_meals");
    if (savedMeals) {
      try {
        setEatenMeals(JSON.parse(savedMeals));
      } catch (e) {
        console.error("Failed to parse eaten meals:", e);
      }
    }

    const todayStr = new Date().toISOString().split("T")[0];
    const savedWater = localStorage.getItem("nutricart_ai_water_intake");
    const savedWaterDate = localStorage.getItem("nutricart_ai_water_date");

    if (savedWater && savedWaterDate === todayStr) {
      setWaterIntake(Number(savedWater));
    } else {
      setWaterIntake(0);
      localStorage.setItem("nutricart_ai_water_intake", "0");
      localStorage.setItem("nutricart_ai_water_date", todayStr);
    }

    const savedStreak = localStorage.getItem("nutricart_ai_streak_count");
    const savedStreakDate = localStorage.getItem("nutricart_ai_streak_date");
    if (savedStreak && savedStreakDate) {
      const lastDate = new Date(savedStreakDate);
      const todayDate = new Date(todayStr);
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        const newStreak = Number(savedStreak) + 1;
        setStreakCount(newStreak);
        localStorage.setItem("nutricart_ai_streak_count", String(newStreak));
        localStorage.setItem("nutricart_ai_streak_date", todayStr);
      } else if (diffDays > 1) {
        setStreakCount(1);
        localStorage.setItem("nutricart_ai_streak_count", "1");
        localStorage.setItem("nutricart_ai_streak_date", todayStr);
      } else {
        setStreakCount(Number(savedStreak));
      }
    } else {
      setStreakCount(1);
      localStorage.setItem("nutricart_ai_streak_count", "1");
      localStorage.setItem("nutricart_ai_streak_date", todayStr);
    }
    
    setIsFirstLoad(false);
  }, []);

  useEffect(() => {
    if (!isFirstLoad) {
      localStorage.setItem("nutricart_ai_cart_v2", JSON.stringify(cart));
    }
  }, [cart, isFirstLoad]);

  useEffect(() => {
    if (!isFirstLoad) {
      localStorage.setItem("nutricart_ai_profile", JSON.stringify(profile));
    }
  }, [profile, isFirstLoad]);

  useEffect(() => {
    if (!isFirstLoad) {
      if (user) {
        localStorage.setItem("nutricart_ai_user", JSON.stringify(user));
      } else {
        localStorage.removeItem("nutricart_ai_user");
      }
    }
  }, [user, isFirstLoad]);

  useEffect(() => {
    if (!isFirstLoad) {
      localStorage.setItem("nutricart_ai_eaten_meals", JSON.stringify(eatenMeals));
    }
  }, [eatenMeals, isFirstLoad]);

  useEffect(() => {
    if (!isFirstLoad) {
      localStorage.setItem("nutricart_ai_water_intake", String(waterIntake));
      localStorage.setItem("nutricart_ai_water_date", new Date().toISOString().split("T")[0]);
    }
  }, [waterIntake, isFirstLoad]);

  const handleAddMeal = (meal: Omit<EatenMeal, "id" | "loggedAt">) => {
    const newMeal: EatenMeal = {
      ...meal,
      id: Math.random().toString(36).substring(2, 9),
      loggedAt: new Date().toISOString(),
    };
    setEatenMeals((prev) => [newMeal, ...prev]);
  };

  const handleRemoveMeal = (id: string) => {
    setEatenMeals((prev) => prev.filter((m) => m.id !== id));
  };

  const handleClearMeals = () => {
    setEatenMeals([]);
  };

  const handleAddItem = async (name: string, ingredientsText: string, quantity: number) => {
    const tempId = Math.random().toString(36).substring(2, 9);
    
    // Add item to cart with loading state
    const newItem: CartItem = {
      id: tempId,
      name,
      ingredientsText,
      quantity,
      isLoading: true
    };
    
    setCart((prev) => [newItem, ...prev]);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, ingredientsText })
      });

      if (!response.ok) {
        throw new Error("Failed to process food composition");
      }

      const analysis = await response.json();

      setCart((prev) =>
        prev.map((item) =>
          item.id === tempId
            ? { ...item, isLoading: false, analysis }
            : item
        )
      );
    } catch (error: any) {
      console.error("Cart analysis error:", error);
      setCart((prev) =>
        prev.map((item) =>
          item.id === tempId
            ? { ...item, isLoading: false, error: "Analysis error. Please retry." }
            : item
        )
      );
    }
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const handleClearCart = () => {
    setCart([]);
    setSelectedItem(null);
  };

  const handleRefreshCart = async () => {
    setSelectedItem(null);
    const dietFoods = getDietSpecificPredefinedItems(profile.dietType);
    
    // Create new cart item templates in loading state
    const newItems: CartItem[] = dietFoods.map((f) => ({
      id: Math.random().toString(36).substring(2, 9),
      name: f.name,
      ingredientsText: f.ingredientsText,
      quantity: 1,
      isLoading: true
    }));

    // Reset the cart with these 10 items
    setCart(newItems);

    // Fire analysis calls sequentially to reduce network spikes and honor rate limit quotas
    for (const item of newItems) {
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ name: item.name, ingredientsText: item.ingredientsText })
        });

        if (!response.ok) {
          throw new Error("Failed to analyze");
        }

        const analysis = await response.json();

        setCart((prev) =>
          prev.map((ci) =>
            ci.id === item.id
              ? { ...ci, isLoading: false, analysis }
              : ci
          )
        );
      } catch (err) {
        console.log("Batch analysis info for", item.name, err);
        setCart((prev) =>
          prev.map((ci) =>
            ci.id === item.id
              ? { ...ci, isLoading: false, error: "Analysis failed. Click to retry." }
              : ci
          )
        );
      }
      
      // Delay slightly between requests (e.g., 150ms) to ensure smooth sequence processing
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-emerald-100">
      {/* If the user is not authenticated, show the login screen firstly */}
      {!user && (
        <AuthScreen
          onLoginSuccess={(userData) => {
            setUser(userData);
          }}
        />
      )}

      {/* Primary Navigation / App Bar with BOLD TYPOGRAPHY theme styling */}
      <header className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-baseline border-b border-slate-100 gap-4">
        <div className="flex flex-col">
          <div className="flex items-baseline space-x-1.5">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none text-emerald-600 font-display">
              NUTRI CART <span className="text-slate-900">AI</span>
            </h1>
            {user && (
              <span className="text-[11px] bg-slate-100 text-slate-700 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Hi, {user.name}
              </span>
            )}
          </div>
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-slate-400 mt-1">
            Real-Time Ingredient Analysis
          </span>
        </div>
        <nav className="flex gap-4 items-center">
          <button
            onClick={() => {
              setActiveTab("ingredients");
              setShowProfileSetup(false);
            }}
            className={`text-xs md:text-sm font-bold uppercase tracking-widest pb-1 transition-all cursor-pointer ${
              activeTab === "ingredients" && !showProfileSetup
                ? "border-b-2 border-slate-900 text-slate-900"
                : "text-slate-400 hover:text-slate-650"
            }`}
          >
            Ingredient Analysis
          </button>
          <button
            onClick={() => {
              setActiveTab("tracking");
              setShowProfileSetup(false);
            }}
            className={`text-xs md:text-sm font-bold uppercase tracking-widest pb-1 transition-all cursor-pointer ${
              activeTab === "tracking" && !showProfileSetup
                ? "border-b-2 border-slate-900 text-slate-900"
                : "text-slate-400 hover:text-slate-650"
            }`}
          >
            Nutritional Tracking
          </button>
          <button
            onClick={() => setShowProfileSetup(!showProfileSetup)}
            className={`flex items-center space-x-2 px-4 py-2 font-bold uppercase tracking-wider text-xs rounded-xl transition-all cursor-pointer shadow-xs ${
              showProfileSetup
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {showProfileSetup ? (
              <>
                <User className="w-4 h-4 text-emerald-200" />
                <span>Show Panel</span>
              </>
            ) : (
              <>
                <Settings className="w-4 h-4 text-emerald-400 animate-spin-slow" />
                <span>Calibrate Goals</span>
              </>
            )}
          </button>
          {user && (
            <button
              onClick={() => {
                setUser(null);
                localStorage.removeItem("nutricart_ai_user");
              }}
              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer border border-rose-100/40"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </nav>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col min-h-[calc(100vh-140px)]">
        {showProfileSetup ? (
          <div className="space-y-6 animate-fadeIn">
            {/* Active profile setup */}
            <UserProfileSetup profile={profile} onChangeProfile={(p) => setProfile(p)} />
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowProfileSetup(false)}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-md cursor-pointer"
              >
                Apply & View Insights
              </button>
            </div>
          </div>
        ) : activeTab === "tracking" ? (
          <NutritionalTracker
            profile={profile}
            eatenMeals={eatenMeals}
            onAddMeal={handleAddMeal}
            onRemoveMeal={handleRemoveMeal}
            onClearMeals={handleClearMeals}
            waterIntake={waterIntake}
            onUpdateWater={setWaterIntake}
            streakCount={streakCount}
          />
        ) : (
          <>
            {/* Intro Alert */}
            <div className="mb-8 p-6 bg-slate-50 border border-slate-100 rounded-3xl flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="p-2.5 bg-emerald-100 rounded-2xl text-emerald-800 shrink-0">
                <Heart className="w-5 h-5 fill-emerald-800" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-1">
                  Active Optimization Panel
                </h2>
                <h3 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 leading-tight">
                  Allergen Inspector & Cumulative Budget/Macro Tracker
                </h3>
                <p className="text-xs md:text-sm text-slate-500 mt-2 leading-relaxed">
                  Build your grocery cart, input raw ingredient labels, and discover additive safety scores instantly. Our engine checks safety profiles, flags hazardous food additives, alerts you to custom allergens, and computes progress against your personal targets.
                </p>
                
                {/* Active Goals Badge Row */}
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                  <span className="px-3 py-1 bg-emerald-50 text-[10px] font-bold uppercase text-emerald-700 rounded-full border border-emerald-100">
                    Diet: {profile.dietType}
                  </span>
                  <span className="px-3 py-1 bg-blue-50 text-[10px] font-bold uppercase text-blue-700 rounded-full border border-blue-100">
                    Goal: {profile.goal === "lose" ? "Weight Loss" : profile.goal === "gain" ? "Hypertrophy" : "Maintain"}
                  </span>
                  <span className="px-3 py-1 bg-amber-50 text-[10px] font-bold uppercase text-amber-700 rounded-full border border-amber-100">
                    Budget Limit: {profile.budget} {profile.currency}
                  </span>
                  {profile.allergies.length > 0 && (
                    <span className="px-3 py-1 bg-rose-50 text-[10px] font-bold uppercase text-rose-700 rounded-full border border-rose-100 flex items-center space-x-1">
                      <span>⚠️ Guarding:</span>
                      <span>{profile.allergies.join(", ")}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bento Board Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-1">
              {/* Left Panel: Cart Manager */}
              <div className="lg:col-span-6 min-h-[580px]">
                <CartManager
                  cart={cart}
                  onAddItem={handleAddItem}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                  onClearCart={handleClearCart}
                  onRefreshCart={handleRefreshCart}
                  onSelectActiveItem={(item) => setSelectedItem(item)}
                  selectedItemId={selectedItem?.id || null}
                />
              </div>

              {/* Right Panel: Cumulative Insights */}
              <div className="lg:col-span-6 min-h-[580px]">
                <CartInsights cart={cart} selectedItem={selectedItem} profile={profile} />
              </div>
            </div>
          </>
        )}
      </main>

      {/* Item Detail Modal overlay */}
      {selectedItem && (
        <ItemDetailsModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* Footer Bar */}
      <footer className="h-14 bg-white border-t border-slate-100 flex items-center px-6 md:px-8 shrink-0">
        <div className="flex gap-4 items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Analysis Engine V4.1 — Real-time Nutritional Sync Active
          </span>
        </div>
      </footer>
    </div>
  );
}
