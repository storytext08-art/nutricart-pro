export interface UserProfile {
  age: number;
  gender: string;
  height: number;
  weight: number;
  goal: "lose" | "gain" | "maintain";
  activityLevel: "sedentary" | "moderate" | "active";
  dietType: string;
  preferredStores: string[];
  currency: string;
  budget: number;
  allergies: string[];
  dislikedFoods: string[];
  lovedFoods: string[];
  planningType: "daily" | "weekly" | "monthly";
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  sodium: number;
}

export interface AdditiveInfo {
  name: string;
  hazard: "high" | "medium" | "low";
  function: string;
  note: string;
}

export interface FoodAnalysis {
  nutrition: NutritionalInfo;
  ingredients: string[];
  allergens: string[];
  additives: AdditiveInfo[];
  processingVerdict: string; // e.g. "Minimally Processed", "Processed", "Ultra-Processed", "Clean Label"
  processingVerdictExplanation: string;
  beneficials: string[];
  warnings: string[];
}

export interface CartItem {
  id: string;
  name: string;
  quantity: number;
  ingredientsText?: string;
  analysis?: FoodAnalysis;
  isLoading?: boolean;
  error?: string;
}

export interface EatenMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  sodium: number;
  loggedAt: string;
}
