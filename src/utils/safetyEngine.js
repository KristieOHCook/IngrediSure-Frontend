// ============================================================
// INGREDISURE — Ingredient Safety Analysis Engine
// utils/safetyEngine.js — The Brain of IngrediSure
//
// HIGHLIGHT: This file solves the most critical code duplication
// problem in the original IngrediSure codebase
//
// BEFORE: The safety analysis logic was copy-pasted into 4 files
//   - GroceryScanner.jsx had its own version
//   - BarcodeScanner.jsx had its own version
//   - RestaurantFinder.jsx had its own version
//   - RecipeSuggestions.jsx had its own version
//   - A bug in the logic required fixing it in 4 places
//   - Missing one fix would cause inconsistent safety verdicts
//
// AFTER: One single safety algorithm used by all 4 scanners
//   - Fix a bug once — fixed everywhere automatically
//   - Add a new condition trigger once — works in all scanners
//   - Guaranteed consistent verdicts across the entire platform
//
// PRINCIPLE: DRY — Do Not Repeat Yourself
// One of the most fundamental software engineering principles
// ============================================================

// ============================================================
// HIGHLIGHT: CONDITION_TRIGGERS — The Medical Knowledge Base
//
// This object maps 30+ medical conditions to the specific
// ingredients that are dangerous for people with those conditions
//
// This data was researched and curated specifically for IngrediSure
// A medical professional or dietitian could update this object
// without touching any UI code — separation of concerns
//
// Example: A user with Celiac Disease will get flagged for
// wheat, gluten, barley, rye, malt and brewer's yeast
// automatically across ALL scanners without any extra code
// ============================================================
export const CONDITION_TRIGGERS = {

  // HIGHLIGHT: Diabetes triggers — sugars and refined carbohydrates
  'Diabetes': ['sugar', 'high fructose corn syrup', 'corn syrup', 'glucose', 'sucrose', 'dextrose', 'maltose', 'white flour', 'refined flour'],
  'Type 2 Diabetes': ['sugar', 'high fructose corn syrup', 'corn syrup', 'glucose', 'sucrose', 'dextrose', 'maltose', 'white flour', 'refined flour'],
  'Type 1 Diabetes': ['sugar', 'high fructose corn syrup', 'corn syrup', 'glucose', 'sucrose', 'dextrose'],

  // HIGHLIGHT: Hypertension triggers — sodium and preservatives
  'Hypertension': ['sodium', 'salt', 'monosodium glutamate', 'msg', 'baking soda', 'sodium benzoate', 'sodium nitrate'],
  'High Blood Pressure': ['sodium', 'salt', 'monosodium glutamate', 'msg', 'sodium benzoate', 'sodium nitrate'],

  // HIGHLIGHT: Celiac triggers — all gluten-containing grains
  'Celiac Disease': ['wheat', 'gluten', 'barley', 'rye', 'malt', "brewer's yeast", 'oats'],
  'Gluten Intolerance': ['wheat', 'gluten', 'barley', 'rye', 'malt'],

  // HIGHLIGHT: Lactose triggers — all dairy derivatives
  'Lactose Intolerance': ['milk', 'lactose', 'dairy', 'cheese', 'butter', 'cream', 'whey', 'casein'],

  // HIGHLIGHT: Kidney Disease triggers — minerals that stress kidneys
  'Kidney Disease': ['potassium', 'phosphorus', 'sodium', 'salt', 'potassium chloride'],

  // HIGHLIGHT: Heart Disease triggers — fats and sodium
  'Heart Disease': ['saturated fat', 'trans fat', 'hydrogenated oil', 'partially hydrogenated', 'cholesterol', 'sodium', 'salt'],
  'High Cholesterol': ['saturated fat', 'trans fat', 'hydrogenated oil', 'partially hydrogenated', 'cholesterol'],

  // HIGHLIGHT: Gout triggers — purines and fructose
  'Gout': ['purine', 'fructose', 'high fructose corn syrup', 'alcohol', 'anchovies', 'sardines', 'organ meat'],

  // HIGHLIGHT: Digestive condition triggers
  "Crohn's Disease": ['lactose', 'dairy', 'gluten', 'wheat', 'artificial sweetener', 'sorbitol', 'mannitol'],
  'IBS': ['lactose', 'fructose', 'sorbitol', 'mannitol', 'xylitol', 'gluten', 'caffeine'],

  // HIGHLIGHT: Organ condition triggers
  'Liver Disease': ['alcohol', 'high fructose corn syrup', 'trans fat', 'hydrogenated oil'],
  'Thyroid Disease': ['soy', 'soybean', 'iodine', 'fluoride'],

  // HIGHLIGHT: Hormonal and inflammatory condition triggers
  'PCOS': ['sugar', 'refined carbohydrates', 'high fructose corn syrup', 'white flour'],
  'Arthritis': ['sugar', 'refined flour', 'saturated fat', 'trans fat', 'omega-6'],
  'Osteoporosis': ['sodium', 'caffeine', 'alcohol', 'phosphoric acid'],
  'Anemia': ['calcium', 'tannins', 'phytic acid'],

  // HIGHLIGHT: Food Allergy triggers — the 8 major allergens
  // These are FDA-mandated disclosure allergens
  'Food Allergy — Peanuts': ['peanut', 'peanuts', 'groundnut', 'arachis oil'],
  'Food Allergy — Tree Nuts': ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'hazelnut', 'macadamia', 'brazil nut'],
  'Food Allergy — Shellfish': ['shrimp', 'crab', 'lobster', 'crayfish', 'shellfish', 'prawn'],
  'Food Allergy — Fish': ['fish', 'salmon', 'tuna', 'cod', 'tilapia', 'anchovy', 'sardine'],
  'Food Allergy — Milk/Dairy': ['milk', 'dairy', 'lactose', 'whey', 'casein', 'cheese', 'butter', 'cream'],
  'Food Allergy — Eggs': ['egg', 'eggs', 'albumin', 'globulin', 'lysozyme', 'mayonnaise'],
  'Food Allergy — Wheat/Gluten': ['wheat', 'gluten', 'flour', 'bread crumbs', 'semolina', 'spelt'],
  'Food Allergy — Soy': ['soy', 'soya', 'soybean', 'tofu', 'tempeh', 'miso', 'edamame'],

  // HIGHLIGHT: Autoimmune and chronic condition triggers
  'Lupus': ['alfalfa', 'garlic', 'saturated fat', 'trans fat'],
  'Asthma': ['sulfites', 'sulfur dioxide', 'sodium metabisulfite', 'artificial dyes', 'tartrazine'],

  // HIGHLIGHT: Mental health condition triggers
  'Depression': ['alcohol', 'caffeine', 'refined sugar', 'trans fat'],
  'Anxiety': ['caffeine', 'alcohol', 'refined sugar', 'artificial sweeteners'],
};

// ============================================================
// HIGHLIGHT: analyzeIngredients — The Core Safety Algorithm
//
// This single function replaces 4 copies of the same logic
// that previously existed across 4 different component files
//
// HOW IT WORKS:
// 1. Takes the product ingredient list as a string
// 2. Takes the user's conditions array from UserContext
// 3. Takes the user's avoidances array from UserContext
// 4. Checks every ingredient against condition triggers
// 5. Checks every ingredient against personal avoidances
// 6. Calculates Safe, Caution or Unsafe verdict
// 7. Returns everything the UI needs to display results
//
// USED BY: GroceryScanner, BarcodeScanner, RestaurantFinder,
//          RecipeSuggestions — all 4 scanners use this one function
// ============================================================
export function analyzeIngredients(ingredientsList, conditions = [], avoidances = []) {
  if (!ingredientsList) return {
    verdict: 'Unknown',
    flaggedIngredients: [],
    flaggedAvoidances: [],
    safeCount: 0,
    totalCount: 0
  };

  // HIGHLIGHT: Split ingredient string into individual ingredients
  // Handles comma-separated lists from product labels
  const ingredients = ingredientsList.toLowerCase().split(/,\s*/);
  const flaggedIngredients = [];
  const flaggedAvoidances = [];

  // HIGHLIGHT: Check every ingredient against every condition trigger
  // This is where the medical knowledge base gets applied
  // A user with Celiac Disease automatically gets wheat flagged
  conditions.forEach(condition => {
    const conditionName = condition.conditionName || condition;
    const triggers = CONDITION_TRIGGERS[conditionName] || [];
    triggers.forEach(trigger => {
      ingredients.forEach(ingredient => {
        if (ingredient.includes(trigger.toLowerCase()) && !flaggedIngredients.includes(trigger)) {
          flaggedIngredients.push(trigger);
        }
      });
    });
  });

  // HIGHLIGHT: Check every ingredient against personal avoidances
  // These are ingredients the user added manually to avoid
  // regardless of their medical conditions
  avoidances.forEach(avoidance => {
    const avoidanceName = (avoidance.ingredientName || avoidance).toLowerCase();
    ingredients.forEach(ingredient => {
      if (ingredient.includes(avoidanceName) || avoidanceName.includes(ingredient.trim())) {
        if (!flaggedAvoidances.includes(avoidance.ingredientName || avoidance)) {
          flaggedAvoidances.push(avoidance.ingredientName || avoidance);
        }
      }
    });
  });

  const allFlagged = [...new Set([...flaggedIngredients, ...flaggedAvoidances])];
  const totalCount = ingredients.length;
  const safeCount = totalCount - allFlagged.length;

  // HIGHLIGHT: Verdict calculation
  // Safe — no flagged ingredients found
  // Caution — 1 or 2 flagged ingredients found
  // Unsafe — 3 or more flagged ingredients found
  let verdict = 'Safe';
  if (allFlagged.length > 0) {
    verdict = allFlagged.length >= 3 ? 'Unsafe' : 'Caution';
  }

  // HIGHLIGHT: Return all data the UI needs
  // verdict — for the color coded badge
  // flaggedIngredients — for the highlighted ingredient chips
  // flaggedByCondition — for showing which condition caused the flag
  // flaggedByAvoidance — for showing which personal avoidance triggered
  // safeCount and totalCount — for the ingredient ratio display
  return {
    verdict,
    flaggedIngredients: allFlagged,
    flaggedByCondition: flaggedIngredients,
    flaggedByAvoidance: flaggedAvoidances,
    safeCount,
    totalCount,
  };
}

// ============================================================
// HIGHLIGHT: Helper functions for consistent UI rendering
// These replace local functions that were defined separately
// in each of the 4 scanner components
// Now changed in one place — updates all scanners automatically
// ============================================================

// HIGHLIGHT: Returns the correct color for each verdict
// Green for Safe, Yellow for Caution, Red for Unsafe
export function verdictColor(verdict) {
  if (verdict === 'Safe') return '#7dd97f';
  if (verdict === 'Caution') return '#f0c040';
  if (verdict === 'Unsafe') return '#ff6b6b';
  return 'rgba(255,255,255,0.6)';
}

// HIGHLIGHT: Returns the correct background for verdict cards
export function verdictBackground(verdict) {
  if (verdict === 'Safe') return 'rgba(93,187,99,0.15)';
  if (verdict === 'Caution') return 'rgba(240,192,64,0.15)';
  if (verdict === 'Unsafe') return 'rgba(255,107,107,0.15)';
  return 'rgba(255,255,255,0.05)';
}

// HIGHLIGHT: Returns the correct symbol for each verdict
// Checkmark for Safe, Warning for Caution, X for Unsafe
export function verdictIcon(verdict) {
  if (verdict === 'Safe') return '✓';
  if (verdict === 'Caution') return '⚠';
  if (verdict === 'Unsafe') return '✗';
  return '·';
}