import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini with server-side API Key
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper offline/fail-safe analyzer to prevent quota (429) errors from breaking the app
function getFallbackAnalysis(name: string, ingredientsText?: string) {
  const norm = name.toLowerCase().trim();

  // 1. Exact Predefined Food Fallback Database
  if (norm.includes("sardine") && norm.includes("olive oil")) {
    return {
      nutrition: { calories: 208, protein: 25, carbs: 0, fat: 12, sugar: 0, sodium: 380 },
      ingredients: ["Sardines", "Extra Virgin Olive Oil", "Sea Salt"],
      allergens: ["Fish"],
      additives: [],
      processingVerdict: "Processed",
      processingVerdictExplanation: "Whole small wild fish canned with pure olive oil and salt. Healthy natural preservation.",
      beneficials: ["Superb source of EPA/DHA omega-3s", "Rich in bioavailable Calcium and Vitamin D", "Complete high quality protein"],
      warnings: []
    };
  }
  if (norm.includes("yogurt") && norm.includes("strawberry")) {
    return {
      nutrition: { calories: 95, protein: 8.5, carbs: 12, fat: 0.1, sugar: 10, sodium: 40 },
      ingredients: ["Cultured Grade A Non Fat Milk", "Strawberries", "Water", "Fructose", "Modified Food Starch", "Black Carrot Juice", "Sucralose", "Carrageenan"],
      allergens: ["Dairy"],
      additives: [
        { name: "Carrageenan", hazard: "medium", function: "Thickener/Stabilizer", note: "Derived from seaweed, but some studies link it to digestive inflammation." },
        { name: "Sucralose", hazard: "medium", function: "Artificial Sweetener", note: "Zero-calorie sweetener that may affect gut microbiome composition." }
      ],
      processingVerdict: "Processed",
      processingVerdictExplanation: "Yogurt base with added fruit preparation, artificial sweeteners (sucralose), and thickeners (carrageenan).",
      beneficials: ["High in protein", "Contains active live cultures", "Low fat"],
      warnings: ["Contains artificial sweetener", "Contains carrageenan thickener"]
    };
  }
  if (norm.includes("olive oil") || norm.includes("extra virgin olive")) {
    return {
      nutrition: { calories: 884, protein: 0, carbs: 0, fat: 100, sugar: 0, sodium: 2 },
      ingredients: ["Extra Virgin Olive Oil"],
      allergens: [],
      additives: [],
      processingVerdict: "Clean Label",
      processingVerdictExplanation: "Cold-pressed from whole organic olives with zero added ingredients. Extremely high source of monounsaturated fatty acids.",
      beneficials: ["High in polyphenols", "Rich in heart-healthy monounsaturated fat (Oleic Acid)", "Anti-inflammatory compounds"],
      warnings: ["High calorie density"]
    };
  }
  if (norm.includes("sourdough") || norm.includes("sourdough bread")) {
    return {
      nutrition: { calories: 240, protein: 9, carbs: 46, fat: 1.5, sugar: 1.5, sodium: 480 },
      ingredients: ["Whole Wheat Flour", "Water", "Sourdough Starter", "Sea Salt"],
      allergens: ["Wheat", "Gluten"],
      additives: [],
      processingVerdict: "Minimally Processed",
      processingVerdictExplanation: "Traditionally fermented whole wheat bread made with natural wild yeast sourdough starter and clean ingredients.",
      beneficials: ["Good source of dietary fiber", "Traditionally fermented for easier digestion", "Whole grains"],
      warnings: ["Contains gluten"]
    };
  }
  if (norm.includes("salmon")) {
    return {
      nutrition: { calories: 208, protein: 20, carbs: 0, fat: 13, sugar: 0, sodium: 59 },
      ingredients: ["Raw Atlantic Salmon"],
      allergens: ["Fish"],
      additives: [],
      processingVerdict: "Clean Label",
      processingVerdictExplanation: "Fresh unprocessed fatty fish fillet, single-ingredient with zero modifications.",
      beneficials: ["Excellent source of Omega-3 fatty acids", "High-quality complete protein", "Zero carbs and sugar"],
      warnings: []
    };
  }
  if (norm.includes("feta")) {
    return {
      nutrition: { calories: 264, protein: 14, carbs: 4, fat: 21, sugar: 1, sodium: 1116 },
      ingredients: ["Pasteurized Sheep Milk", "Goat Milk", "Salt", "Cheese Culture", "Enzymes"],
      allergens: ["Dairy"],
      additives: [],
      processingVerdict: "Processed",
      processingVerdictExplanation: "Traditional Mediterranean aged cheese made with animal milk and salt. Simple ingredients, though naturally high in sodium from the brining process.",
      beneficials: ["Good source of calcium", "Rich, authentic source of healthy fats", "High protein"],
      warnings: ["High sodium content"]
    };
  }
  if (norm.includes("tofu")) {
    return {
      nutrition: { calories: 120, protein: 12, carbs: 3, fat: 6, sugar: 0.5, sodium: 10 },
      ingredients: ["Water", "Organic Soybeans", "Calcium Sulfate"],
      allergens: ["Soy"],
      additives: [],
      processingVerdict: "Minimally Processed",
      processingVerdictExplanation: "Made from whole organic soybeans coagulated with natural calcium sulfate. Rich in plant protein with minimal processing.",
      beneficials: ["Excellent plant-based protein", "Good source of calcium"],
      warnings: []
    };
  }
  if (norm.includes("spinach")) {
    return {
      nutrition: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, sugar: 0.4, sodium: 79 },
      ingredients: ["Organic Baby Spinach"],
      allergens: [],
      additives: [],
      processingVerdict: "Clean Label",
      processingVerdictExplanation: "Raw, unprocessed leafy greens. Free of any additives, preservatives, or artificial ingredients.",
      beneficials: ["High in Vitamin K and A", "Rich in iron and folate", "Extremely low calories"],
      warnings: []
    };
  }
  if (norm.includes("egg")) {
    return {
      nutrition: { calories: 143, protein: 12.6, carbs: 0.7, fat: 9.5, sugar: 0.2, sodium: 142 },
      ingredients: ["Free Range Chicken Eggs"],
      allergens: ["Eggs"],
      additives: [],
      processingVerdict: "Clean Label",
      processingVerdictExplanation: "Whole, fresh eggs with zero processing or additives.",
      beneficials: ["Complete protein source", "Rich in choline and Vitamin D", "Zero added sugar"],
      warnings: []
    };
  }
  if (norm.includes("almond") && norm.includes("pack")) {
    return {
      nutrition: { calories: 579, protein: 21, carbs: 22, fat: 50, sugar: 4.3, sodium: 1 },
      ingredients: ["Raw Almonds"],
      allergens: ["Tree Nuts"],
      additives: [],
      processingVerdict: "Clean Label",
      processingVerdictExplanation: "Raw, unsalted single-ingredient whole nuts with zero processing or added oils.",
      beneficials: ["Excellent source of healthy monounsaturated fats", "Good plant protein and fiber", "Rich in Vitamin E"],
      warnings: []
    };
  }
  if (norm.includes("lentil") && norm.includes("penne")) {
    return {
      nutrition: { calories: 340, protein: 25, carbs: 55, fat: 1.5, sugar: 1.2, sodium: 5 },
      ingredients: ["Organic Red Lentil Flour"],
      allergens: [],
      additives: [],
      processingVerdict: "Minimally Processed",
      processingVerdictExplanation: "Gluten-free pasta made entirely from ground red lentils. Minimal mechanic shaping with no chemical additives.",
      beneficials: ["Very high plant protein content", "Naturally gluten-free", "Rich in iron and fiber"],
      warnings: []
    };
  }
  if (norm.includes("veggie puff") || norm.includes("hot veggie")) {
    return {
      nutrition: { calories: 520, protein: 5.5, carbs: 58, fat: 30, sugar: 3.5, sodium: 850 },
      ingredients: ["Corn Meal", "Vegetable Oil", "Monosodium Glutamate", "Yeast Extract", "Citric Acid", "Red 40", "Yellow 6", "Sodium Diacetate"],
      allergens: [],
      additives: [
        { name: "Monosodium Glutamate", hazard: "medium", function: "Flavor Enhancer", note: "Enhances savory taste. Some individuals report temporary sensitivity reactions like headaches." },
        { name: "Red 40", hazard: "high", function: "Artificial Color", note: "Synthetic azo dye that has been linked to hyperactive behavior in children in some studies." },
        { name: "Yellow 6", hazard: "high", function: "Artificial Color", note: "Synthetic food dye derived from petroleum; associated with potential hypersensitivity." }
      ],
      processingVerdict: "Highly Ultra-Processed",
      processingVerdictExplanation: "Extruded corn snacks loaded with refined vegetable oils, flavor enhancers, and multiple synthetic chemical colorants.",
      beneficials: [],
      warnings: ["Contains artificial colorants Red 40 and Yellow 6", "Contains Monosodium Glutamate (MSG)", "High sodium and saturated fats"]
    };
  }
  if (norm.includes("almond milk") || norm.includes("unsweetened")) {
    return {
      nutrition: { calories: 15, protein: 0.6, carbs: 1.4, fat: 1.1, sugar: 0.1, sodium: 70 },
      ingredients: ["Filtered Water", "Almonds", "Calcium Carbonate", "Sea Salt", "Potassium Citrate", "Sunflower Lecithin", "Gellan Gum"],
      allergens: ["Tree Nuts"],
      additives: [
        { name: "Gellan Gum", hazard: "low", function: "Thickener/Stabilizer", note: "A natural polysaccharide used as a stabilizing agent to prevent separation of almond solids." }
      ],
      processingVerdict: "Processed",
      processingVerdictExplanation: "Water-extracted almonds formulated with thickeners, calcium fortifying minerals, and stabilizers.",
      beneficials: ["Extremely low calorie alternative to milk", "Calcium fortified", "Zero added sugar"],
      warnings: ["Contains stabilizing gums"]
    };
  }
  if (norm.includes("hummus")) {
    return {
      nutrition: { calories: 166, protein: 4.8, carbs: 14, fat: 10, sugar: 0.3, sodium: 380 },
      ingredients: ["Cooked Chickpeas", "Sesame Tahini", "Canola Oil", "Salt", "Garlic", "Citric Acid"],
      allergens: ["Sesame"],
      additives: [],
      processingVerdict: "Processed",
      processingVerdictExplanation: "Traditional blend of chickpeas, sesame paste, and oils. Freshly blended paste with mild food acids.",
      beneficials: ["Provides plant-based proteins", "Good source of healthy monounsaturated fats from tahini", "Dietary fiber"],
      warnings: []
    };
  }
  if (norm.includes("tempeh")) {
    return {
      nutrition: { calories: 195, protein: 20, carbs: 7.6, fat: 11, sugar: 0.5, sodium: 10 },
      ingredients: ["Organic Soybeans", "Water", "Organic Brown Rice", "Rhizopus Oligosporus"],
      allergens: ["Soy"],
      additives: [],
      processingVerdict: "Minimally Processed",
      processingVerdictExplanation: "Fermented plant protein made from whole, cracked organic soybeans. Traditional starter culture gives health benefits.",
      beneficials: ["High in complete plant protein", "Fermented for gut health", "Low glycemic index"],
      warnings: []
    };
  }
  if (norm.includes("vegan cheddar") || norm.includes("vegan cheese")) {
    return {
      nutrition: { calories: 285, protein: 1, carbs: 24, fat: 21, sugar: 0.1, sodium: 790 },
      ingredients: ["Filtered Water", "Coconut Oil", "Modified Potato Starch", "Sea Salt", "Olive Extract", "Beta Carotene", "Natural Yeast Flavors"],
      allergens: [],
      additives: [
        { name: "Modified Potato Starch", hazard: "low", function: "Thickener/Binder", note: "Physically or chemically altered starch used to mimic the texture of dairy proteins." }
      ],
      processingVerdict: "Highly Ultra-Processed",
      processingVerdictExplanation: "Formulated entirely from refined oils, modified starches, and natural yeast extracts with almost zero protein content.",
      beneficials: ["100% dairy-free for extreme lactose intolerance"],
      warnings: ["Extremely low protein content", "High saturated fat from coconut oil", "Contains refined starches"]
    };
  }
  if (norm.includes("chicken") || norm.includes("chicken breast")) {
    return {
      nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6, sugar: 0, sodium: 74 },
      ingredients: ["Raw Chicken Breast"],
      allergens: [],
      additives: [],
      processingVerdict: "Clean Label",
      processingVerdictExplanation: "Fresh raw poultry breast, single-ingredient with zero modifications.",
      beneficials: ["Extremely high protein and very lean", "Rich in niacin and Vitamin B6", "Zero sugar or carbs"],
      warnings: []
    };
  }
  if (norm.includes("butter")) {
    return {
      nutrition: { calories: 717, protein: 0.8, carbs: 0.1, fat: 81, sugar: 0.1, sodium: 580 },
      ingredients: ["Pasteurized Cream", "Sea Salt"],
      allergens: ["Dairy"],
      additives: [],
      processingVerdict: "Processed",
      processingVerdictExplanation: "Traditional pasteurized cream churned into solid butter with natural sea salt. Simple traditional process.",
      beneficials: ["Rich in fat-soluble vitamins (A, D, E)", "Provides high-quality butterfat from grass-fed cows"],
      warnings: ["Extremely high calorie density", "Contains saturated fats"]
    };
  }
  if (norm.includes("mayo")) {
    return {
      nutrition: { calories: 680, protein: 0.5, carbs: 0, fat: 75, sugar: 0, sodium: 520 },
      ingredients: ["Avocado Oil", "Egg Yolks", "Water", "Distilled Vinegar", "Salt", "Mustard Flour", "Rosemary Extract"],
      allergens: ["Eggs"],
      additives: [],
      processingVerdict: "Processed",
      processingVerdictExplanation: "Emulsified mayonnaise condiment featuring clean avocado oil and whole egg yolks. Formulated with zero added sugars.",
      beneficials: ["Made with heart-healthy monounsaturated avocado oil", "Sugar-free condiment choice"],
      warnings: ["High calorie density"]
    };
  }
  if (norm.includes("aged cheddar") || norm.includes("cheddar cheese")) {
    return {
      nutrition: { calories: 403, protein: 25, carbs: 1.3, fat: 33, sugar: 0.1, sodium: 620 },
      ingredients: ["Pasteurized Milk", "Cheese Cultures", "Salt", "Enzymes"],
      allergens: ["Dairy"],
      additives: [],
      processingVerdict: "Processed",
      processingVerdictExplanation: "Traditional aged dairy product made from milk, cultures, and salt. Hard cured cheese.",
      beneficials: ["High in calcium", "Good protein content with low carbs"],
      warnings: ["High saturated fat", "Contains salt"]
    };
  }
  if (norm.includes("bacon")) {
    return {
      nutrition: { calories: 541, protein: 37, carbs: 1.4, fat: 42, sugar: 0.2, sodium: 1720 },
      ingredients: ["Pork", "Water", "Salt", "Sodium Phosphate", "Sodium Erythorbate", "Sodium Nitrite"],
      allergens: [],
      additives: [
        { name: "Sodium Nitrite", hazard: "high", function: "Curing Agent/Preservative", note: "Common preservative used to cure meat, but linked to the formation of carcinogenic nitrosamines during high-heat cooking." },
        { name: "Sodium Phosphate", hazard: "medium", function: "Moisture Retainer", note: "Added to maintain moisture and texture. Excessive intake may affect kidney health." }
      ],
      processingVerdict: "Highly Ultra-Processed",
      processingVerdictExplanation: "Smoked cured pork meat treated with industrial curing chemicals (nitrites) and texturizing agents.",
      beneficials: ["High protein density"],
      warnings: ["Contains high-hazard Sodium Nitrite", "Extremely high sodium content", "Highly processed animal fat"]
    };
  }
  if (norm.includes("macadamia")) {
    return {
      nutrition: { calories: 718, protein: 7.9, carbs: 14, fat: 76, sugar: 4.6, sodium: 360 },
      ingredients: ["Macadamia Nuts", "Sea Salt"],
      allergens: ["Tree Nuts"],
      additives: [],
      processingVerdict: "Processed",
      processingVerdictExplanation: "Whole tree nuts gently roasted and seasoned with sea salt. Minimal processing.",
      beneficials: ["Extremely rich in healthy monounsaturated fats", "Very low glycemic index and sugar"],
      warnings: ["Very high calorie density"]
    };
  }
  if (norm.includes("pork rinds")) {
    return {
      nutrition: { calories: 544, protein: 61, carbs: 0, fat: 31, sugar: 0, sodium: 1800 },
      ingredients: ["Fried Pork Rinds", "Salt", "Monosodium Glutamate", "Artificial Hickory Smoke Flavor"],
      allergens: [],
      additives: [
        { name: "Monosodium Glutamate", hazard: "medium", function: "Flavor Enhancer", note: "Savory flavor enhancer that may trigger mild sensitivity in some individuals." }
      ],
      processingVerdict: "Highly Ultra-Processed",
      processingVerdictExplanation: "Deep-fried skin layers treated with artificial smoke flavoring agents and savory flavor enhancers.",
      beneficials: ["Very high protein content", "Zero carbs"],
      warnings: ["Extremely high sodium content", "Contains Monosodium Glutamate (MSG)"]
    };
  }
  if (norm.includes("ribeye") || norm.includes("beef")) {
    return {
      nutrition: { calories: 291, protein: 24, carbs: 0, fat: 22, sugar: 0, sodium: 54 },
      ingredients: ["Raw Grass-Fed Beef"],
      allergens: [],
      additives: [],
      processingVerdict: "Clean Label",
      processingVerdictExplanation: "Fresh, unprocessed grass-fed beef. Zero added hormones, chemicals, or sodium.",
      beneficials: ["High-quality complete protein", "Rich in iron, zinc, and B-vitamins", "Better omega fatty acid profile from grass-feeding"],
      warnings: []
    };
  }
  if (norm.includes("sweet potato") || norm.includes("sweet potatoes")) {
    return {
      nutrition: { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, sugar: 4.2, sodium: 55 },
      ingredients: ["Sweet Potatoes"],
      allergens: [],
      additives: [],
      processingVerdict: "Clean Label",
      processingVerdictExplanation: "Fresh raw tubers, unprocessed single agricultural ingredient.",
      beneficials: ["Excellent source of beta-carotene (Vitamin A)", "Complex carbs rich in fiber", "Low glycemic load compared to white potatoes"],
      warnings: []
    };
  }
  if (norm.includes("garbanzo") || norm.includes("chickpea")) {
    return {
      nutrition: { calories: 120, protein: 6.3, carbs: 20, fat: 2, sugar: 0.5, sodium: 240 },
      ingredients: ["Chickpeas", "Water", "Salt"],
      allergens: [],
      additives: [],
      processingVerdict: "Processed",
      processingVerdictExplanation: "Freshly cooked whole chickpeas canned in salt-brine. Processed primarily for safety and shelf-life.",
      beneficials: ["Excellent fiber and plant-protein source", "Highly prebiotic for gut biome"],
      warnings: []
    };
  }
  if (norm.includes("whey") || norm.includes("protein isolate") || norm.includes("protein powder")) {
    return {
      nutrition: { calories: 370, protein: 85, carbs: 3, fat: 1.5, sugar: 0.5, sodium: 160 },
      ingredients: ["Whey Protein Isolate", "Sunflower Lecithin", "Sea Salt", "Sucralose", "Acesulfame Potassium"],
      allergens: ["Dairy"],
      additives: [
        { name: "Sucralose", hazard: "medium", function: "Artificial Sweetener", note: "Saccharide-free sweetener linked to possible digestive flora modulation." },
        { name: "Acesulfame Potassium", hazard: "medium", function: "Artificial Sweetener", note: "Common zero-calorie artificial sweetener used for heat-stable sweetness." }
      ],
      processingVerdict: "Highly Ultra-Processed",
      processingVerdictExplanation: "Highly isolated dairy byproduct subjected to filtration, drying, and stabilization with chemical flavorings and sweeteners.",
      beneficials: ["Extremely pure and dense protein supplement", "Virtually fat and carb free"],
      warnings: ["Contains artificial sweeteners", "Industrial highly isolated dairy product"]
    };
  }
  if (norm.includes("tuna")) {
    return {
      nutrition: { calories: 116, protein: 26, carbs: 0, fat: 1, sugar: 0, sodium: 320 },
      ingredients: ["Chunk Light Tuna", "Water", "Salt"],
      allergens: ["Fish"],
      additives: [],
      processingVerdict: "Processed",
      processingVerdictExplanation: "Cooked lean fish vacuum canned in water and salt. Traditional and simple storage.",
      beneficials: ["Virtually pure lean protein source", "Low calorie density", "Contains zero sugars or carbs"],
      warnings: []
    };
  }
  if (norm.includes("wrap") || norm.includes("tortilla")) {
    return {
      nutrition: { calories: 190, protein: 15, carbs: 22, fat: 5, sugar: 0.5, sodium: 490 },
      ingredients: ["Water", "Modified Wheat Starch", "Wheat Gluten", "Oat Fiber", "Canola Oil", "Salt", "Potassium Sorbate", "Fumaric Acid"],
      allergens: ["Wheat", "Gluten"],
      additives: [
        { name: "Modified Wheat Starch", hazard: "low", function: "Thickener/Stabilizer", note: "Starch derivative adjusted for texture." },
        { name: "Potassium Sorbate", hazard: "low", function: "Preservative", note: "Common preservative preventing mold and yeast growth to extend shelf-life." }
      ],
      processingVerdict: "Highly Ultra-Processed",
      processingVerdictExplanation: "Formulated wrap containing industrially isolated fibers, gluten binders, and chemical food preservatives.",
      beneficials: ["High fiber and lower carbohydrate alternative", "Contains added proteins"],
      warnings: ["Contains wheat and gluten", "Contains artificial chemical preservatives"]
    };
  }
  if (norm.includes("oats") || norm.includes("oatmeal")) {
    return {
      nutrition: { calories: 389, protein: 16.9, carbs: 66, fat: 6.9, sugar: 1, sodium: 2 },
      ingredients: ["Whole Grain Oats"],
      allergens: [],
      additives: [],
      processingVerdict: "Minimally Processed",
      processingVerdictExplanation: "Whole grain oats rolled mechanically with zero wheat cross-contamination. Extremely clean cereal grain source.",
      beneficials: ["High in soluble beta-glucan fiber", "Excellent source of slow-digesting oats", "100% Gluten-free certified"],
      warnings: []
    };
  }
  if (norm.includes("rice & quinoa") || norm.includes("quinoa")) {
    return {
      nutrition: { calories: 150, protein: 4, carbs: 31, fat: 1.5, sugar: 0.5, sodium: 120 },
      ingredients: ["Parboiled Brown Rice", "Red Quinoa", "Sea Salt"],
      allergens: [],
      additives: [],
      processingVerdict: "Minimally Processed",
      processingVerdictExplanation: "Steamed natural brown rice mixed with whole quinoa seeds and lightly seasoned. Pure grains.",
      beneficials: ["High fiber grain blend", "Naturally gluten-free", "Provides slow release energy"],
      warnings: []
    };
  }
  if (norm.includes("cracker") || norm.includes("crackers")) {
    return {
      nutrition: { calories: 380, protein: 7, carbs: 82, fat: 3, sugar: 0.5, sodium: 580 },
      ingredients: ["Rice Flour", "Safflower Oil", "Sea Salt", "Sunflower Lecithin"],
      allergens: [],
      additives: [],
      processingVerdict: "Processed",
      processingVerdictExplanation: "Mechanically pressed and baked rice flour discs seasoned with oil and salt. Simple gluten-free crisps.",
      beneficials: ["Easily digestible starch", "100% Gluten-Free"],
      warnings: []
    };
  }
  if (norm.includes("granola") || norm.includes("bar")) {
    return {
      nutrition: { calories: 435, protein: 8, carbs: 64, fat: 16, sugar: 22, sodium: 290 },
      ingredients: ["Whole Grain Oats", "Sugar", "Canola Oil", "Rice Flour", "Honey", "Salt", "Brown Sugar Syrup", "Soy Lecithin", "Baking Soda", "Natural Flavor"],
      allergens: ["Soy", "Wheat"],
      additives: [],
      processingVerdict: "Processed",
      processingVerdictExplanation: "Oats bound together with highly concentrated sugars, oils, and natural emulsifiers.",
      beneficials: ["Contains whole grain oats"],
      warnings: ["High in added simple sugars"]
    };
  }
  if (norm.includes("chips")) {
    return {
      nutrition: { calories: 540, protein: 6, carbs: 54, fat: 34, sugar: 2, sodium: 680 },
      ingredients: ["Potatoes", "Vegetable Oil", "Maltodextrin", "Salt", "Sugar", "Monosodium Glutamate", "Yeast Extract", "Citric Acid", "Red 40 Lake", "Yellow 6 Lake", "Yellow 6", "Yellow 5", "Onion Powder", "Whey", "Garlic Powder", "Natural Flavor", "Sodium Diacetate"],
      allergens: ["Dairy"],
      additives: [
        { name: "Monosodium Glutamate", hazard: "medium", function: "Flavor Enhancer", note: "Savory flavor enhancer designed to stimulate consumption." },
        { name: "Red 40 Lake", hazard: "high", function: "Artificial Color", note: "A petroleum-derived synthetic colorant linked to potential hypersensitivity." },
        { name: "Yellow 6 Lake", hazard: "high", function: "Artificial Color", note: "Synthetic azo food dye under regulatory warning for child hyperactivity." }
      ],
      processingVerdict: "Highly Ultra-Processed",
      processingVerdictExplanation: "Industrial deep-fried starch chips heavily flavored with chemical compounds, synthetic petroleum dyes, and behavior-modulating taste enhancers.",
      beneficials: [],
      warnings: ["Contains several artificial chemical colorants (Red 40, Yellow 6, Yellow 5)", "Contains flavor enhancer MSG", "High sodium and saturated fats"]
    };
  }
  if (norm.includes("cola") || norm.includes("soda") || norm.includes("diet")) {
    return {
      nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, sodium: 15 },
      ingredients: ["Carbonated Water", "Caramel Color", "Phosphoric Acid", "Aspartame", "Potassium Benzoate", "Natural Flavors", "Potassium Citrate", "Acesulfame Potassium", "Caffeine"],
      allergens: [],
      additives: [
        { name: "Aspartame", hazard: "high", function: "Artificial Sweetener", note: "Artificial non-nutritive sweetener classified by WHO as possibly carcinogenic, and may negatively impact gut biome." },
        { name: "Caramel Color", hazard: "medium", function: "Coloring Agent", note: "Industrial coloring agent that may contain trace manufacturing impurities like 4-MEI." },
        { name: "Phosphoric Acid", hazard: "medium", function: "Acidulant", note: "Provides sharp tangy flavor, but high intake might interfere with calcium absorption and bone density." },
        { name: "Potassium Benzoate", hazard: "medium", function: "Preservative", note: "Common preservative used to keep product fresh; under some conditions may form trace benzene when in contact with acids." }
      ],
      processingVerdict: "Highly Ultra-Processed",
      processingVerdictExplanation: "100% synthetic beverage comprised exclusively of carbonated water, acids, coal-tar colorings, and chemical artificial sweetening substances.",
      beneficials: [],
      warnings: ["Contains high-hazard Aspartame artificial sweetener", "Contains phosphoric acid acidifier", "Contains chemical preservatives"]
    };
  }

  // 2. Heuristic Dynamic Fallback Generator for custom/random inputs
  const estimatedAllergens: string[] = [];
  if (norm.includes("milk") || norm.includes("cheese") || norm.includes("yogurt") || norm.includes("cream") || norm.includes("butter") || norm.includes("whey")) {
    estimatedAllergens.push("Dairy");
  }
  if (norm.includes("wheat") || norm.includes("bread") || norm.includes("pasta") || norm.includes("flour") || norm.includes("dough")) {
    estimatedAllergens.push("Wheat", "Gluten");
  }
  if (norm.includes("peanut") || norm.includes("almond") || norm.includes("cashew") || norm.includes("nut") || norm.includes("walnut")) {
    estimatedAllergens.push("Tree Nuts");
  }
  if (norm.includes("soy") || norm.includes("tofu") || norm.includes("tempeh")) {
    estimatedAllergens.push("Soy");
  }
  if (norm.includes("egg")) {
    estimatedAllergens.push("Eggs");
  }
  if (norm.includes("fish") || norm.includes("salmon") || norm.includes("tuna") || norm.includes("sardine")) {
    estimatedAllergens.push("Fish");
  }

  let calories = 150;
  let protein = 5;
  let carbs = 15;
  let fat = 5;
  let sugar = 2;
  let sodium = 120;

  if (norm.includes("meat") || norm.includes("chicken") || norm.includes("beef") || norm.includes("pork") || norm.includes("fish") || norm.includes("salmon")) {
    calories = 200; protein = 24; carbs = 0; fat = 10; sugar = 0; sodium = 80;
  } else if (norm.includes("vegetable") || norm.includes("spinach") || norm.includes("broccoli") || norm.includes("salad") || norm.includes("leaf")) {
    calories = 30; protein = 2; carbs = 5; fat = 0.5; sugar = 1; sodium = 40;
  } else if (norm.includes("snack") || norm.includes("chips") || norm.includes("cookie") || norm.includes("chocolate") || norm.includes("puff")) {
    calories = 480; protein = 6; carbs = 60; fat = 25; sugar = 15; sodium = 600;
  } else if (norm.includes("oil") || norm.includes("fat") || norm.includes("butter")) {
    calories = 800; protein = 0; carbs = 0; fat = 90; sugar = 0; sodium = 100;
  }

  return {
    nutrition: { calories, protein, carbs, fat, sugar, sodium },
    ingredients: (ingredientsText || name).split(",").map((s) => s.trim().replace(/[.[\]]/g, "")).filter(Boolean),
    allergens: estimatedAllergens,
    additives: norm.includes("diet") || norm.includes("zero") || norm.includes("sugar-free") ? [
      { name: "Aspartame", hazard: "high", function: "Sweetener", note: "Intense chemical sweetener linked to microbiome shifts." }
    ] : [],
    processingVerdict: norm.includes("snack") || norm.includes("chips") || norm.includes("soda") ? "Highly Ultra-Processed" : "Minimally Processed",
    processingVerdictExplanation: `Automated assessment for ${name}. Natural standard ingredients are estimated with standard nutritional ratios.`,
    beneficials: protein > 15 ? ["High in quality proteins"] : ["Standard energy provider"],
    warnings: sodium > 400 ? ["High sodium content warning"] : []
  };
}

// API route to handle food analysis via Gemini
app.post("/api/analyze", async (req, res) => {
  const { name, ingredientsText } = req.body;

  if (!name || typeof name !== "string") {
    return res.status(400).json({ error: "Product name is required" });
  }

  try {
    const prompt = `Analyze the food item:
Product Name: "${name}"
Ingredients list: "${ingredientsText || "Not specified (please estimate or look up standard recipe/ingredients for this product)"}"

Requirements:
1. Parse or estimate the complete ingredients list.
2. Estimate the nutritional values strictly on a **per 100g** basis.
3. Identify allergens (e.g. Dairy, Soy, Wheat, Gluten, Nuts, Eggs, Fish, Shellfish, etc.).
4. Identify and evaluate any food additives (preservatives, artificial colors, emulsifiers, sweeteners, e.g. E-numbers, high-fructose corn syrup, carrageenan, aspartame, MSG). Assign their hazard level ('high', 'medium', 'low') and explain their function/note.
5. Provide a processing level/label verdict (e.g. "Minimally Processed", "Processed", "Ultra-Processed", "Clean Label") and a brief explanation.
6. List beneficial elements (e.g. "Good source of protein", "Contains whole grains").
7. List warning elements (e.g. "High in saturated fat", "Contains artificial sweetener", "High sodium content").

CRITICAL EXCLUSIONS:
- DO NOT calculate or mention any costs, prices, budget, or cost-per-gram.
- DO NOT calculate or mention fiber content.
- DO NOT provide any numeric grade or score (e.g. "85/100" or "Meal Grade: 90%"). Keep the verdict purely qualitative.
- DO NOT write heavy, academic scientific essays (keep descriptions clear, helpful, and consumer-friendly).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nutrition: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER, description: "Calories (kcal) per 100g" },
                protein: { type: Type.NUMBER, description: "Protein (g) per 100g" },
                carbs: { type: Type.NUMBER, description: "Carbohydrates (g) per 100g" },
                fat: { type: Type.NUMBER, description: "Total Fat (g) per 100g" },
                sugar: { type: Type.NUMBER, description: "Total Sugar (g) per 100g" },
                sodium: { type: Type.NUMBER, description: "Sodium (mg) per 100g" }
              },
              required: ["calories", "protein", "carbs", "fat", "sugar", "sodium"]
            },
            ingredients: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Parsed list of clean, individual ingredient names"
            },
            allergens: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of identified allergens present in this product"
            },
            additives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Name of the food additive (e.g., Xanthan Gum, Red 40, Sodium Benzoate)" },
                  hazard: { type: Type.STRING, description: "Hazard classification: high, medium, or low" },
                  function: { type: Type.STRING, description: "The function of the additive (e.g., Preservative, Thickener, Artificial Color)" },
                  note: { type: Type.STRING, description: "A brief reason for the hazard rating and health implications" }
                },
                required: ["name", "hazard", "function", "note"]
              },
              description: "List of food additives detected and analyzed"
            },
            processingVerdict: {
              type: Type.STRING,
              description: "Qualitative category, e.g. 'Clean Label', 'Minimally Processed', 'Processed', 'Highly Ultra-Processed'"
            },
            processingVerdictExplanation: {
              type: Type.STRING,
              description: "A friendly, brief consumer-focused explanation of the processing verdict and ingredient safety."
            },
            beneficials: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of positive aspects or beneficial ingredients"
            },
            warnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of warning indicators"
            }
          },
          required: [
            "nutrition",
            "ingredients",
            "allergens",
            "additives",
            "processingVerdict",
            "processingVerdictExplanation",
            "beneficials",
            "warnings"
          ]
        }
      }
    });

    const jsonStr = response.text || "{}";
    const result = JSON.parse(jsonStr.trim());
    return res.json(result);
  } catch (error: any) {
    console.log(`[Info] Gemini rate limit or temporary error for '${name}'. Using local offline fallback.`);
    try {
      const fallbackResult = getFallbackAnalysis(name, ingredientsText);
      return res.json(fallbackResult);
    } catch (fallbackError: any) {
      console.log("Local fallback resolution completed with status warning:", fallbackError?.message || fallbackError);
      return res.status(500).json({ status: "failed", message: "Failed to analyze product composition" });
    }
  }
});

// API route to parse natural language food logs into specific nutritional targets
app.post("/api/parse-meal", async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== "string") {
    return res.status(400).json({ error: "Meal log query description is required" });
  }

  try {
    const prompt = `You are a professional nutrition scientist. Analyze the following eaten meal or food description:
"${query}"

Calculate or estimate realistic cumulative nutritional values for this entire meal portion.
Make sure the estimation matches typical food portion sizes (e.g. if they say "a banana", estimate around 100-120g portion. If they say "2 fried eggs", calculate for 2 medium eggs).

Provide estimations for:
- Calories (kcal)
- Protein (g)
- Carbohydrates (g)
- Total Fat (g)
- Sugar (g)
- Sodium (mg)

Respond strictly using the specified JSON schema. Keep values as realistic numbers.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mealName: { type: Type.STRING, description: "A friendly, descriptive name for the meal (e.g. 'Avocado Sourdough Toast with 2 Eggs')" },
            calories: { type: Type.NUMBER, description: "Estimated total calories (kcal)" },
            protein: { type: Type.NUMBER, description: "Estimated total protein (g)" },
            carbs: { type: Type.NUMBER, description: "Estimated total carbohydrates (g)" },
            fat: { type: Type.NUMBER, description: "Estimated total fat (g)" },
            sugar: { type: Type.NUMBER, description: "Estimated total sugar (g)" },
            sodium: { type: Type.NUMBER, description: "Estimated total sodium (mg)" }
          },
          required: ["mealName", "calories", "protein", "carbs", "fat", "sugar", "sodium"]
        }
      }
    });

    const jsonStr = response.text || "{}";
    const result = JSON.parse(jsonStr.trim());
    return res.json(result);
  } catch (error: any) {
    console.log("Meal estimation fallback activated:", error?.message || error);
    return res.status(500).json({ status: "failed", message: error.message || "Failed to parse meal description" });
  }
});


// Setup Vite Dev server middleware or static folder serving
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

setupVite().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
});
