export interface PredefinedFood {
  name: string;
  ingredientsText: string;
  description: string;
  category: string;
}

export const PREDEFINED_ITEMS: PredefinedFood[] = [
  {
    name: "Organic Baby Spinach",
    ingredientsText: "Organic Baby Spinach.",
    description: "Fresh, 100% organic baby spinach with no added preservatives or sodium.",
    category: "Fresh Produce"
  },
  {
    name: "Oats & Honey Granola Bars",
    ingredientsText: "Whole Grain Oats, Sugar, Canola Oil, Rice Flour, Honey, Salt, Brown Sugar Syrup, Soy Lecithin, Baking Soda, Natural Flavor.",
    description: "Classic crunchy granola bars featuring oats and sweet natural honey.",
    category: "Snacks & Cereals"
  },
  {
    name: "Spiced Flamin' Hot Chips",
    ingredientsText: "Potatoes, Vegetable Oil (Sunflower, Corn, and/or Canola Oil), Flamin' Hot Seasoning (Maltodextrin, Salt, Sugar, Monosodium Glutamate, Yeast Extract, Citric Acid, Artificial Color [Red 40 Lake, Yellow 6 Lake, Yellow 6, Yellow 5], Onion Powder, Whey, Garlic Powder, Natural Flavor, Sodium Diacetate), Salt.",
    description: "Highly processed, spicy snack chips with synthetic food dyes and flavor enhancers.",
    category: "Snacks & Cereals"
  },
  {
    name: "Greek Yogurt (Strawberry)",
    ingredientsText: "Cultured Grade A Non Fat Milk, Strawberries, Water, Fructose, Less than 1% of Modified Food Starch, Black Carrot Juice and Carmine (for color), Natural Flavors, Kosher Gelatin, Carrageenan, Malic Acid, Sodium Citrate, Sucralose, Potassium Sorbate (to maintain freshness), Acesulfame Potassium.",
    description: "Creamy flavored Greek yogurt with strawberry fruit pieces, thickeners, and non-nutritive sweeteners.",
    category: "Dairy & Eggs"
  },
  {
    name: "Zero Sugar Diet Cola",
    ingredientsText: "Carbonated Water, Caramel Color, Phosphoric Acid, Aspartame, Potassium Benzoate (to protect taste), Natural Flavors, Potassium Citrate, Acesulfame Potassium, Caffeine.",
    description: "Popular carbonated beverage containing zero calories, caramel coloring, and artificial sweeteners.",
    category: "Beverages"
  },
  {
    name: "Whole Wheat Sourdough Bread",
    ingredientsText: "Whole Wheat Flour, Water, Sourdough Starter (Wheat Flour, Water), Sea Salt.",
    description: "Traditional fermented bread made with simple, wholesome, stone-ground ingredients.",
    category: "Bakery"
  }
];

export function getDietSpecificPredefinedItems(dietType: string): PredefinedFood[] {
  const diet = (dietType || "Normal").toLowerCase();

  if (diet === "vegetarian") {
    return [
      {
        name: "Organic Firm Tofu",
        ingredientsText: "Water, Organic Soybeans, Calcium Sulfate.",
        description: "Excellent plant protein source, minimal processing.",
        category: "Plant Protein"
      },
      {
        name: "Organic Baby Spinach",
        ingredientsText: "Organic Baby Spinach.",
        description: "Fresh, 100% organic baby spinach with no added preservatives or sodium.",
        category: "Fresh Produce"
      },
      {
        name: "Greek Yogurt (Strawberry)",
        ingredientsText: "Cultured Grade A Non Fat Milk, Strawberries, Water, Fructose, Less than 1% of Modified Food Starch, Black Carrot Juice, Sucralose, Carrageenan.",
        description: "Probiotic rich snack containing strawberries and thickeners.",
        category: "Dairy & Eggs"
      },
      {
        name: "Organic Eggs (Dozen)",
        ingredientsText: "Free Range Chicken Eggs.",
        description: "High quality vegetarian whole protein with zero additives.",
        category: "Dairy & Eggs"
      },
      {
        name: "Whole Wheat Sourdough Bread",
        ingredientsText: "Whole Wheat Flour, Water, Sourdough Starter, Sea Salt.",
        description: "Traditional fermented bakery loaf.",
        category: "Bakery"
      },
      {
        name: "Unsalted Almonds Pack",
        ingredientsText: "Raw Almonds.",
        description: "Heart-healthy vegetarian monounsaturated fats.",
        category: "Snacks & Cereals"
      },
      {
        name: "Red Lentil Penne Pasta",
        ingredientsText: "Organic Red Lentil Flour.",
        description: "High-fiber and high-protein gluten-free pasta.",
        category: "Pantry"
      },
      {
        name: "Feta Cheese Block",
        ingredientsText: "Pasteurized Sheep Milk, Goat Milk, Salt, Cheese Culture, Enzymes.",
        description: "Traditional Mediterranean feta curd.",
        category: "Dairy & Eggs"
      },
      {
        name: "Mixed Berries Medley",
        ingredientsText: "Fresh Strawberries, Blueberries, Raspberries.",
        description: "Rich in antioxidants and natural micronutrients.",
        category: "Fresh Produce"
      },
      {
        name: "Flamin' Hot Veggie Puffs",
        ingredientsText: "Corn Meal, Vegetable Oil, Spicy seasoning (Monosodium Glutamate, Yeast Extract, Citric Acid, Red 40, Yellow 6, Sodium Diacetate).",
        description: "Spicy snack option containing food dyes and MSG for additive evaluation.",
        category: "Snacks & Cereals"
      }
    ];
  }

  if (diet === "vegan") {
    return [
      {
        name: "Organic Firm Tofu",
        ingredientsText: "Water, Organic Soybeans, Calcium Sulfate.",
        description: "Excellent plant protein source, minimal processing.",
        category: "Plant Protein"
      },
      {
        name: "Organic Baby Spinach",
        ingredientsText: "Organic Baby Spinach.",
        description: "Fresh, 100% organic baby spinach with no added preservatives or sodium.",
        category: "Fresh Produce"
      },
      {
        name: "Almond Milk (Unsweetened)",
        ingredientsText: "Filtered Water, Almonds, Calcium Carbonate, Sea Salt, Potassium Citrate, Sunflower Lecithin, Gellan Gum.",
        description: "Low-calorie milk alternative with added thickeners and stabilizers.",
        category: "Beverages"
      },
      {
        name: "Unsalted Almonds Pack",
        ingredientsText: "Raw Almonds.",
        description: "Heart-healthy plant fats and protein.",
        category: "Snacks & Cereals"
      },
      {
        name: "Red Lentil Penne Pasta",
        ingredientsText: "Organic Red Lentil Flour.",
        description: "High-fiber and high-protein plant-based pasta.",
        category: "Pantry"
      },
      {
        name: "Hummus Dip Classic",
        ingredientsText: "Cooked Chickpeas, Sesame Tahini, Canola Oil, Salt, Garlic, Citric Acid.",
        description: "Rich and creamy Mediterranean chickpea paste.",
        category: "Pantry"
      },
      {
        name: "Organic Tempeh Strips",
        ingredientsText: "Organic Soybeans, Water, Organic Brown Rice, Rhizopus Oligosporus.",
        description: "Traditional cultured and fermented whole soybean cake.",
        category: "Plant Protein"
      },
      {
        name: "Whole Wheat Sourdough Bread",
        ingredientsText: "Whole Wheat Flour, Water, Sourdough Starter, Sea Salt.",
        description: "Traditional fermented vegan bakery loaf.",
        category: "Bakery"
      },
      {
        name: "Mixed Berries Medley",
        ingredientsText: "Fresh Strawberries, Blueberries, Raspberries.",
        description: "Rich in antioxidants and natural micronutrients.",
        category: "Fresh Produce"
      },
      {
        name: "Vegan Cheddar Cheese Shreds",
        ingredientsText: "Filtered Water, Coconut Oil, Modified Potato Starch, Sea Salt, Olive Extract, Beta Carotene, Natural Yeast Flavors.",
        description: "Starch-based vegan substitute containing coconut fats and coloring.",
        category: "Pantry"
      }
    ];
  }

  if (diet === "keto") {
    return [
      {
        name: "Fresh Atlantic Salmon Fillet",
        ingredientsText: "Raw Atlantic Salmon.",
        description: "Omega-3 rich fatty fish, zero carbs.",
        category: "Proteins"
      },
      {
        name: "Free Range Chicken Breast",
        ingredientsText: "Raw Chicken Breast.",
        description: "Lean whole protein, excellent for keto macros.",
        category: "Proteins"
      },
      {
        name: "Unsalted Almonds Pack",
        ingredientsText: "Raw Almonds.",
        description: "Low-carb fat-dense nut packet.",
        category: "Snacks & Cereals"
      },
      {
        name: "Grass-Fed Butter Block",
        ingredientsText: "Pasteurized Cream, Sea Salt.",
        description: "High-quality fat block for ketogenic coffee or frying.",
        category: "Dairy & Eggs"
      },
      {
        name: "Avocado Oil Mayo",
        ingredientsText: "Avocado Oil, Egg Yolks, Water, Distilled Vinegar, Salt, Mustard Flour, Rosemary Extract.",
        description: "Sugar-free condiment featuring healthy avocado fats.",
        category: "Pantry"
      },
      {
        name: "Aged Cheddar Cheese",
        ingredientsText: "Pasteurized Milk, Cheese Cultures, Salt, Enzymes.",
        description: "Zero carb aged block cheese.",
        category: "Dairy & Eggs"
      },
      {
        name: "Organic Baby Spinach",
        ingredientsText: "Organic Baby Spinach.",
        description: "Low-glycemic leafy green rich in potassium.",
        category: "Fresh Produce"
      },
      {
        name: "Smoked Bacon Strips",
        ingredientsText: "Pork, Water, Salt, Sodium Phosphate, Sodium Erythorbate, Sodium Nitrite.",
        description: "Processed keto fuel with nitrites and preservatives.",
        category: "Proteins"
      },
      {
        name: "Roasted Macadamia Nuts",
        ingredientsText: "Macadamia Nuts, Sea Salt.",
        description: "High-fat, ultra-low carb luxury nuts.",
        category: "Snacks & Cereals"
      },
      {
        name: "Sugar-Free Pork Rinds",
        ingredientsText: "Fried Pork Rinds, Salt, Monosodium Glutamate, Artificial Hickory Smoke Flavor.",
        description: "Crispy zero-carb snack containing MSG and artificial smoke.",
        category: "Snacks & Cereals"
      }
    ];
  }

  if (diet === "paleo") {
    return [
      {
        name: "Fresh Atlantic Salmon Fillet",
        ingredientsText: "Raw Atlantic Salmon.",
        description: "Omega-3 rich fatty wild-caught fish.",
        category: "Proteins"
      },
      {
        name: "Free Range Chicken Breast",
        ingredientsText: "Raw Chicken Breast.",
        description: "Unprocessed pure poultry protein.",
        category: "Proteins"
      },
      {
        name: "Unsalted Almonds Pack",
        ingredientsText: "Raw Almonds.",
        description: "Simple organic nuts, seed of ancestral health.",
        category: "Snacks & Cereals"
      },
      {
        name: "Extra Virgin Olive Oil",
        ingredientsText: "100% Extra Virgin Olive Oil.",
        description: "Unrefined cold-pressed fruit oil.",
        category: "Pantry"
      },
      {
        name: "Grass-Fed Beef Ribeye",
        ingredientsText: "Raw Grass-Fed Beef.",
        description: "Ancestral unprocessed red meat cut.",
        category: "Proteins"
      },
      {
        name: "Organic Baby Spinach",
        ingredientsText: "Organic Baby Spinach.",
        description: "Pure dark green leafy foliage.",
        category: "Fresh Produce"
      },
      {
        name: "Mixed Berries Medley",
        ingredientsText: "Fresh Strawberries, Blueberries, Raspberries.",
        description: "Wild-type low-glycemic fruits.",
        category: "Fresh Produce"
      },
      {
        name: "Avocado Oil Mayo",
        ingredientsText: "Avocado Oil, Egg Yolks, Water, Distilled Vinegar, Salt, Mustard Flour, Rosemary Extract.",
        description: "Clean egg-and-oil spread with zero refined seed oils.",
        category: "Pantry"
      },
      {
        name: "Organic Sweet Potatoes",
        ingredientsText: "100% Sweet Potatoes.",
        description: "Clean whole-food complex tuber carbs.",
        category: "Fresh Produce"
      },
      {
        name: "Paleo Beef Jerky Strips",
        ingredientsText: "Grass-Fed Beef, Water, Apple Cider Vinegar, Honey, Sea Salt, Onion Powder, Garlic Powder.",
        description: "Wholesome dried beef cured with real honey and cider.",
        category: "Snacks & Cereals"
      }
    ];
  }

  if (diet === "mediterranean") {
    return [
      {
        name: "Fresh Atlantic Salmon Fillet",
        ingredientsText: "Raw Atlantic Salmon.",
        description: "Rich source of Omega-3 polyunsaturated fatty acids.",
        category: "Proteins"
      },
      {
        name: "Extra Virgin Olive Oil",
        ingredientsText: "100% Extra Virgin Olive Oil.",
        description: "The gold standard of Mediterranean fats.",
        category: "Pantry"
      },
      {
        name: "Unsalted Almonds Pack",
        ingredientsText: "Raw Almonds.",
        description: "Simple, heart-healthy nut source.",
        category: "Snacks & Cereals"
      },
      {
        name: "Canned Garbanzo Beans",
        ingredientsText: "Chickpeas, Water, Salt.",
        description: "Wholesome fiber-filled legumes.",
        category: "Pantry"
      },
      {
        name: "Whole Wheat Sourdough Bread",
        ingredientsText: "Whole Wheat Flour, Water, Sourdough Starter, Sea Salt.",
        description: "Fermented artisan cereal grain loaf.",
        category: "Bakery"
      },
      {
        name: "Greek Yogurt (Strawberry)",
        ingredientsText: "Cultured Grade A Non Fat Milk, Strawberries, Water, Fructose, Less than 1% of Modified Food Starch, Black Carrot Juice, Sucralose, Carrageenan.",
        description: "Cultured dairy with active cultures.",
        category: "Dairy & Eggs"
      },
      {
        name: "Organic Baby Spinach",
        ingredientsText: "Organic Baby Spinach.",
        description: "Iron-dense leafy raw greens.",
        category: "Fresh Produce"
      },
      {
        name: "Feta Cheese Block",
        ingredientsText: "Pasteurized Sheep Milk, Goat Milk, Salt, Cheese Culture, Enzymes.",
        description: "Aged tangy white curd block.",
        category: "Dairy & Eggs"
      },
      {
        name: "Mixed Berries Medley",
        ingredientsText: "Fresh Strawberries, Blueberries, Raspberries.",
        description: "Fructose and antioxidant rich fruit basket.",
        category: "Fresh Produce"
      },
      {
        name: "Canned Sardines in Olive Oil",
        ingredientsText: "Sardines, Extra Virgin Olive Oil, Sea Salt.",
        description: "Traditional wild-caught small fish preserved in olive fat.",
        category: "Proteins"
      }
    ];
  }

  if (diet === "high protein") {
    return [
      {
        name: "Free Range Chicken Breast",
        ingredientsText: "Raw Chicken Breast.",
        description: "Super lean, ultimate muscle builder.",
        category: "Proteins"
      },
      {
        name: "Fresh Atlantic Salmon Fillet",
        ingredientsText: "Raw Atlantic Salmon.",
        description: "High-protein fish with dense essential fats.",
        category: "Proteins"
      },
      {
        name: "Greek Yogurt (Strawberry)",
        ingredientsText: "Cultured Grade A Non Fat Milk, Strawberries, Water, Fructose, Less than 1% of Modified Food Starch, Black Carrot Juice, Sucralose, Carrageenan.",
        description: "Convoluted high protein dairy snack.",
        category: "Dairy & Eggs"
      },
      {
        name: "Organic Firm Tofu",
        ingredientsText: "Water, Organic Soybeans, Calcium Sulfate.",
        description: "Excellent vegan protein alternative.",
        category: "Plant Protein"
      },
      {
        name: "Organic Eggs (Dozen)",
        ingredientsText: "Free Range Chicken Eggs.",
        description: "Nature's perfect bioavailable protein.",
        category: "Dairy & Eggs"
      },
      {
        name: "Grass-Fed Beef Ribeye",
        ingredientsText: "Raw Grass-Fed Beef.",
        description: "High-density amino acid beef slice.",
        category: "Proteins"
      },
      {
        name: "Whey Protein Isolate Powder",
        ingredientsText: "Whey Protein Isolate, Natural Flavors, Sunflower Lecithin, Sea Salt, Sucralose, Acesulfame Potassium.",
        description: "Highly processed, quick absorption protein supplement.",
        category: "Pantry"
      },
      {
        name: "Canned Tuna in Water",
        ingredientsText: "Chunk Light Tuna, Water, Salt.",
        description: "Zero carb fat-free canned fish protein.",
        category: "Proteins"
      },
      {
        name: "Unsalted Almonds Pack",
        ingredientsText: "Raw Almonds.",
        description: "Wholesome snack with balanced protein/fats.",
        category: "Snacks & Cereals"
      },
      {
        name: "High-Protein Beef Jerky",
        ingredientsText: "Beef, Brown Sugar, Salt, Soy Sauce, Yeast Extract, Garlic Powder, Sodium Nitrite.",
        description: "Dehydrated seasoned beef strips.",
        category: "Snacks & Cereals"
      }
    ];
  }

  if (diet === "low carb") {
    return [
      {
        name: "Fresh Atlantic Salmon Fillet",
        ingredientsText: "Raw Atlantic Salmon.",
        description: "Fatty high-protein salmon, zero carbs.",
        category: "Proteins"
      },
      {
        name: "Free Range Chicken Breast",
        ingredientsText: "Raw Chicken Breast.",
        description: "Lean muscle building protein.",
        category: "Proteins"
      },
      {
        name: "Unsalted Almonds Pack",
        ingredientsText: "Raw Almonds.",
        description: "Low-carb nut pouch for clean fat.",
        category: "Snacks & Cereals"
      },
      {
        name: "Grass-Fed Butter Block",
        ingredientsText: "Pasteurized Cream, Sea Salt.",
        description: "Creamy fat blocker source.",
        category: "Dairy & Eggs"
      },
      {
        name: "Avocado Oil Mayo",
        ingredientsText: "Avocado Oil, Egg Yolks, Water, Distilled Vinegar, Salt, Mustard Flour, Rosemary Extract.",
        description: "Egg spread made with avocado oil.",
        category: "Pantry"
      },
      {
        name: "Aged Cheddar Cheese",
        ingredientsText: "Pasteurized Milk, Cheese Cultures, Salt, Enzymes.",
        description: "Aged low-carb hard cheddar block.",
        category: "Dairy & Eggs"
      },
      {
        name: "Organic Baby Spinach",
        ingredientsText: "Organic Baby Spinach.",
        description: "Leafy raw low-carb roughage.",
        category: "Fresh Produce"
      },
      {
        name: "Mixed Berries Medley",
        ingredientsText: "Fresh Strawberries, Blueberries, Raspberries.",
        description: "Low-carb fruit alternative.",
        category: "Fresh Produce"
      },
      {
        name: "Canned Tuna in Water",
        ingredientsText: "Chunk Light Tuna, Water, Salt.",
        description: "Pure fish muscle canned in water.",
        category: "Proteins"
      },
      {
        name: "Low-Carb Protein Wrap",
        ingredientsText: "Water, Modified Wheat Starch, Wheat Gluten, Oat Fiber, Canola Oil, Salt, Potassium Sorbate, Fumaric Acid.",
        description: "Diet starch flatbread wrap with preservatives.",
        category: "Bakery"
      }
    ];
  }

  if (diet === "gluten free") {
    return [
      {
        name: "Fresh Atlantic Salmon Fillet",
        ingredientsText: "Raw Atlantic Salmon.",
        description: "Naturally gluten-free fresh seafood.",
        category: "Proteins"
      },
      {
        name: "Free Range Chicken Breast",
        ingredientsText: "Raw Chicken Breast.",
        description: "Unprocessed fresh poultry.",
        category: "Proteins"
      },
      {
        name: "Unsalted Almonds Pack",
        ingredientsText: "Raw Almonds.",
        description: "Simple raw almonds pack.",
        category: "Snacks & Cereals"
      },
      {
        name: "Extra Virgin Olive Oil",
        ingredientsText: "100% Extra Virgin Olive Oil.",
        description: "Pure gluten-free unrefined plant fat.",
        category: "Pantry"
      },
      {
        name: "Gluten-Free Oats",
        ingredientsText: "100% Whole Grain Gluten-Free Oats.",
        description: "Steel-cut non-contaminated oats.",
        category: "Snacks & Cereals"
      },
      {
        name: "Brown Rice & Quinoa Blend",
        ingredientsText: "Parboiled Brown Rice, Red Quinoa, Sea Salt.",
        description: "Nutritious grain complex naturally gluten-free.",
        category: "Pantry"
      },
      {
        name: "Organic Baby Spinach",
        ingredientsText: "Organic Baby Spinach.",
        description: "Leafy greens with no wheat exposure.",
        category: "Fresh Produce"
      },
      {
        name: "Greek Yogurt (Strawberry)",
        ingredientsText: "Cultured Grade A Non Fat Milk, Strawberries, Water, Fructose, Less than 1% of Modified Food Starch, Black Carrot Juice, Sucralose, Carrageenan.",
        description: "Cultured strawberry yogurt dessert.",
        category: "Dairy & Eggs"
      },
      {
        name: "Mixed Berries Medley",
        ingredientsText: "Fresh Strawberries, Blueberries, Raspberries.",
        description: "Fresh berries naturally grain-free.",
        category: "Fresh Produce"
      },
      {
        name: "Gluten-Free Rice Crackers",
        ingredientsText: "Rice Flour, Safflower Oil, Sea Salt, Sunflower Lecithin.",
        description: "Crunchy crisp snacks made from pure rice flour.",
        category: "Snacks & Cereals"
      }
    ];
  }

  // Fallback to Normal/Balanced Diet (10 items)
  return [
    {
      name: "Free Range Chicken Breast",
      ingredientsText: "Raw Chicken Breast.",
      description: "Lean whole protein, excellent BMR target calibration.",
      category: "Proteins"
    },
    {
      name: "Organic Baby Spinach",
      ingredientsText: "Organic Baby Spinach.",
      description: "Fresh, 100% organic baby spinach with no added preservatives or sodium.",
      category: "Fresh Produce"
    },
    {
      name: "Whole Wheat Sourdough Bread",
      ingredientsText: "Whole Wheat Flour, Water, Sourdough Starter, Sea Salt.",
      description: "Artisanal fermented grain bakery slice.",
      category: "Bakery"
    },
    {
      name: "Fresh Atlantic Salmon Fillet",
      ingredientsText: "Raw Atlantic Salmon.",
      description: "Fatty fish rich in polyunsaturated DHA.",
      category: "Proteins"
    },
    {
      name: "Extra Virgin Olive Oil",
      ingredientsText: "100% Extra Virgin Olive Oil.",
      description: "Unprocessed unrefined cold-pressed fruit oil.",
      category: "Pantry"
    },
    {
      name: "Greek Yogurt (Strawberry)",
      ingredientsText: "Cultured Grade A Non Fat Milk, Strawberries, Water, Fructose, Less than 1% of Modified Food Starch, Black Carrot Juice, Sucralose, Carrageenan.",
      description: "Probiotic strawberry snack containing sweeteners.",
      category: "Dairy & Eggs"
    },
    {
      name: "Unsalted Almonds Pack",
      ingredientsText: "Raw Almonds.",
      description: "Simple heart-healthy monounsaturated nut pouch.",
      category: "Snacks & Cereals"
    },
    {
      name: "Brown Rice & Quinoa Blend",
      ingredientsText: "Parboiled Brown Rice, Red Quinoa, Sea Salt.",
      description: "Sustained fiber slow release carbohydrate grains.",
      category: "Pantry"
    },
    {
      name: "Mixed Berries Medley",
      ingredientsText: "Fresh Strawberries, Blueberries, Raspberries.",
      description: "Micronutrient-dense fresh berries.",
      category: "Fresh Produce"
    },
    {
      name: "Spiced Flamin' Hot Chips",
      ingredientsText: "Potatoes, Vegetable Oil, Flamin' Hot Seasoning (Maltodextrin, Salt, MSG, Citric Acid, Red 40 Lake, Yellow 6, Sodium Diacetate).",
      description: "Ultra processed test case for additive warnings and colorants.",
      category: "Snacks & Cereals"
    }
  ];
}
