/**
 * IngrediSure Medication Constants
 * Food-drug interaction database
 * Used across MyProfile and NutritionTracker
 */

export const FOOD_DRUG_INTERACTIONS = {
  'Warfarin': {
    flags: ['vitamin k', 'kale', 'spinach', 'broccoli', 'brussels sprouts', 'green tea', 'grapefruit', 'alcohol'],
    warning: 'Vitamin K rich foods and grapefruit can reduce effectiveness'
  },
  'Metformin': {
    flags: ['alcohol', 'refined sugar', 'white bread', 'white rice', 'soda', 'candy', 'high fructose corn syrup'],
    warning: 'High sugar and alcohol can worsen blood sugar control'
  },
  'Lisinopril': {
    flags: ['potassium', 'banana', 'orange', 'salt substitute', 'spinach', 'avocado'],
    warning: 'High potassium foods can cause dangerous potassium levels'
  },
  'Atorvastatin': {
    flags: ['grapefruit', 'grapefruit juice', 'alcohol'],
    warning: 'Grapefruit significantly increases medication levels in blood'
  },
  'Simvastatin': {
    flags: ['grapefruit', 'grapefruit juice', 'alcohol', 'large amounts of niacin'],
    warning: 'Grapefruit can cause serious muscle damage with this medication'
  },
  'Levothyroxine': {
    flags: ['soy', 'calcium', 'high fiber', 'walnuts', 'coffee', 'cottonseed meal'],
    warning: 'These foods can reduce absorption — take medication on empty stomach'
  },
  'Clopidogrel': {
    flags: ['grapefruit', 'alcohol', 'vitamin e', 'fish oil', 'garlic', 'ginger'],
    warning: 'These can increase bleeding risk'
  },
  'Amlodipine': {
    flags: ['grapefruit', 'grapefruit juice'],
    warning: 'Grapefruit can increase medication levels dangerously'
  },
  'Metoprolol': {
    flags: ['alcohol', 'caffeine'],
    warning: 'Alcohol and caffeine can interfere with heart rate control'
  },
  'Sertraline': {
    flags: ['alcohol', 'grapefruit', 'tyramine', 'aged cheese', 'cured meats', 'sauerkraut'],
    warning: 'Alcohol worsens depression and tyramine can cause dangerous blood pressure spikes'
  },
  'Fluoxetine': {
    flags: ['alcohol', 'grapefruit', 'tyramine'],
    warning: 'Alcohol and grapefruit can increase side effects'
  },
  'Alprazolam': {
    flags: ['alcohol', 'grapefruit', 'caffeine'],
    warning: 'Alcohol dramatically increases sedation risk'
  },
  'Gabapentin': {
    flags: ['alcohol', 'magnesium'],
    warning: 'Alcohol increases dizziness and sedation'
  },
  'Prednisone': {
    flags: ['sodium', 'salt', 'alcohol', 'calcium', 'potassium', 'sugar'],
    warning: 'Avoid high sodium as it increases fluid retention and take calcium supplements'
  },
  'Furosemide': {
    flags: ['licorice', 'alcohol', 'sodium', 'salt'],
    warning: 'Licorice can reduce effectiveness and watch sodium intake'
  },
  'Spironolactone': {
    flags: ['potassium', 'banana', 'orange', 'salt substitute', 'avocado', 'coconut water'],
    warning: 'High potassium foods can cause dangerous potassium levels'
  },
  'Ciprofloxacin': {
    flags: ['dairy', 'milk', 'yogurt', 'cheese', 'calcium', 'antacids', 'iron', 'caffeine'],
    warning: 'Dairy and calcium reduce absorption significantly'
  },
  'Doxycycline': {
    flags: ['dairy', 'milk', 'yogurt', 'cheese', 'calcium', 'iron', 'antacids'],
    warning: 'Dairy reduces absorption — take with water only'
  },
  'Amoxicillin': {
    flags: ['alcohol'],
    warning: 'Alcohol can reduce effectiveness and increase side effects'
  },
  'Ibuprofen': {
    flags: ['alcohol', 'sodium', 'salt'],
    warning: 'Alcohol increases stomach bleeding risk'
  },
  'Aspirin': {
    flags: ['alcohol', 'vitamin e', 'fish oil', 'garlic', 'ginger', 'grapefruit'],
    warning: 'Increases bleeding risk with alcohol and blood thinning supplements'
  },
  'Insulin': {
    flags: ['alcohol', 'refined sugar', 'high fructose corn syrup', 'white bread', 'white rice', 'soda', 'candy'],
    warning: 'Alcohol can cause dangerous blood sugar drops and high sugar spikes glucose'
  },
  'Glipizide': {
    flags: ['alcohol', 'refined sugar', 'high fructose corn syrup'],
    warning: 'Alcohol can cause dangerous low blood sugar'
  },
  'Hydrochlorothiazide': {
    flags: ['licorice', 'alcohol', 'sodium', 'potassium'],
    warning: 'Monitor potassium levels and avoid licorice'
  },
  'Digoxin': {
    flags: ['licorice', 'high fiber', 'bran', 'St Johns Wort', 'caffeine'],
    warning: 'Licorice and high fiber can reduce effectiveness dangerously'
  },
};

/**
 * Find food interactions for a medication
 * @param {string} medName - medication name
 * @returns {Object|null} - interaction object or null if not found
 */
export function getFoodInteractions(medName) {
  if (!medName) return null;
  const key = Object.keys(FOOD_DRUG_INTERACTIONS).find(k =>
    medName.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(medName.toLowerCase())
  );
  return key ? FOOD_DRUG_INTERACTIONS[key] : null;
}

/**
 * Check if any avoidances conflict with a medication
 * @param {string} medName - medication name
 * @param {Array} avoidances - user avoidances array
 * @returns {Array} - array of conflicting avoidances
 */
export function checkAvoidanceConflicts(medName, avoidances = []) {
  const interaction = getFoodInteractions(medName);
  if (!interaction) return [];
  return avoidances.filter(a => {
    const avoidanceName = (a.ingredientName || a).toLowerCase();
    return interaction.flags.some(flag =>
      avoidanceName.includes(flag.toLowerCase()) ||
      flag.toLowerCase().includes(avoidanceName)
    );
  });
}