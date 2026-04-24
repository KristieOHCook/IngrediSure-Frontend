/**
 * IngrediSure Safety Engine
 * Centralized ingredient safety analysis logic
 * Used across GroceryScanner, BarcodeScanner, RestaurantFinder and RecipeSuggestions
 */

// Condition to ingredient trigger mappings
export const CONDITION_TRIGGERS = {
  'Diabetes': ['sugar', 'high fructose corn syrup', 'corn syrup', 'glucose', 'sucrose', 'dextrose', 'maltose', 'white flour', 'refined flour'],
  'Type 2 Diabetes': ['sugar', 'high fructose corn syrup', 'corn syrup', 'glucose', 'sucrose', 'dextrose', 'maltose', 'white flour', 'refined flour'],
  'Type 1 Diabetes': ['sugar', 'high fructose corn syrup', 'corn syrup', 'glucose', 'sucrose', 'dextrose'],
  'Hypertension': ['sodium', 'salt', 'monosodium glutamate', 'msg', 'baking soda', 'sodium benzoate', 'sodium nitrate'],
  'High Blood Pressure': ['sodium', 'salt', 'monosodium glutamate', 'msg', 'sodium benzoate', 'sodium nitrate'],
  'Celiac Disease': ['wheat', 'gluten', 'barley', 'rye', 'malt', 'brewer\'s yeast', 'oats'],
  'Gluten Intolerance': ['wheat', 'gluten', 'barley', 'rye', 'malt'],
  'Lactose Intolerance': ['milk', 'lactose', 'dairy', 'cheese', 'butter', 'cream', 'whey', 'casein'],
  'Kidney Disease': ['potassium', 'phosphorus', 'sodium', 'salt', 'potassium chloride'],
  'Heart Disease': ['saturated fat', 'trans fat', 'hydrogenated oil', 'partially hydrogenated', 'cholesterol', 'sodium', 'salt'],
  'High Cholesterol': ['saturated fat', 'trans fat', 'hydrogenated oil', 'partially hydrogenated', 'cholesterol'],
  'Gout': ['purine', 'fructose', 'high fructose corn syrup', 'alcohol', 'anchovies', 'sardines', 'organ meat'],
  'Crohn\'s Disease': ['lactose', 'dairy', 'gluten', 'wheat', 'artificial sweetener', 'sorbitol', 'mannitol'],
  'IBS': ['lactose', 'fructose', 'sorbitol', 'mannitol', 'xylitol', 'gluten', 'caffeine'],
  'Liver Disease': ['alcohol', 'high fructose corn syrup', 'trans fat', 'hydrogenated oil'],
  'Thyroid Disease': ['soy', 'soybean', 'iodine', 'fluoride'],
  'PCOS': ['sugar', 'refined carbohydrates', 'high fructose corn syrup', 'white flour'],
  'Arthritis': ['sugar', 'refined flour', 'saturated fat', 'trans fat', 'omega-6'],
  'Osteoporosis': ['sodium', 'caffeine', 'alcohol', 'phosphoric acid'],
  'Anemia': ['calcium', 'tannins', 'phytic acid'],
  'Food Allergy — Peanuts': ['peanut', 'peanuts', 'groundnut', 'arachis oil'],
  'Food Allergy — Tree Nuts': ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'hazelnut', 'macadamia', 'brazil nut'],
  'Food Allergy — Shellfish': ['shrimp', 'crab', 'lobster', 'crayfish', 'shellfish', 'prawn'],
  'Food Allergy — Fish': ['fish', 'salmon', 'tuna', 'cod', 'tilapia', 'anchovy', 'sardine'],
  'Food Allergy — Milk/Dairy': ['milk', 'dairy', 'lactose', 'whey', 'casein', 'cheese', 'butter', 'cream'],
  'Food Allergy — Eggs': ['egg', 'eggs', 'albumin', 'globulin', 'lysozyme', 'mayonnaise'],
  'Food Allergy — Wheat/Gluten': ['wheat', 'gluten', 'flour', 'bread crumbs', 'semolina', 'spelt'],
  'Food Allergy — Soy': ['soy', 'soya', 'soybean', 'tofu', 'tempeh', 'miso', 'edamame'],
  'Lupus': ['alfalfa', 'garlic', 'saturated fat', 'trans fat'],
  'Asthma': ['sulfites', 'sulfur dioxide', 'sodium metabisulfite', 'artificial dyes', 'tartrazine'],
  'Depression': ['alcohol', 'caffeine', 'refined sugar', 'trans fat'],
  'Anxiety': ['caffeine', 'alcohol', 'refined sugar', 'artificial sweeteners'],
};

/**
 * Analyzes ingredients against user conditions and avoidances
 * @param {string} ingredientsList - comma separated ingredients string
 * @param {Array} conditions - user conditions array from context
 * @param {Array} avoidances - user avoidances array from context
 * @returns {Object} - { verdict, flaggedIngredients, flaggedAvoidances, safeCount, totalCount }
 */
export function analyzeIngredients(ingredientsList, conditions = [], avoidances = []) {
  if (!ingredientsList) return { verdict: 'Unknown', flaggedIngredients: [], flaggedAvoidances: [], safeCount: 0, totalCount: 0 };

  const ingredients = ingredientsList.toLowerCase().split(/,\s*/);
  const flaggedIngredients = [];
  const flaggedAvoidances = [];

  // Check against condition triggers
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

  // Check against personal avoidances
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

  let verdict = 'Safe';
  if (allFlagged.length > 0) {
    verdict = allFlagged.length >= 3 ? 'Unsafe' : 'Caution';
  }

  return {
    verdict,
    flaggedIngredients: allFlagged,
    flaggedByCondition: flaggedIngredients,
    flaggedByAvoidance: flaggedAvoidances,
    safeCount,
    totalCount,
  };
}

/**
 * Returns the color for a safety verdict
 * @param {string} verdict - Safe, Caution, or Unsafe
 * @returns {string} - hex or rgba color
 */
export function verdictColor(verdict) {
  if (verdict === 'Safe') return '#7dd97f';
  if (verdict === 'Caution') return '#f0c040';
  if (verdict === 'Unsafe') return '#ff6b6b';
  return 'rgba(255,255,255,0.6)';
}

/**
 * Returns the background color for a safety verdict
 * @param {string} verdict - Safe, Caution, or Unsafe
 * @returns {string} - rgba color
 */
export function verdictBackground(verdict) {
  if (verdict === 'Safe') return 'rgba(93,187,99,0.15)';
  if (verdict === 'Caution') return 'rgba(240,192,64,0.15)';
  if (verdict === 'Unsafe') return 'rgba(255,107,107,0.15)';
  return 'rgba(255,255,255,0.05)';
}

/**
 * Returns the icon for a safety verdict
 * @param {string} verdict - Safe, Caution, or Unsafe
 * @returns {string} - symbol character
 */
export function verdictIcon(verdict) {
  if (verdict === 'Safe') return '✓';
  if (verdict === 'Caution') return '⚠';
  if (verdict === 'Unsafe') return '✗';
  return '·';
}