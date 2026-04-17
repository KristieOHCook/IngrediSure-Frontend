import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAccessibility } from '../AccessibilityContext';
import LoadingScreen from './LoadingScreen';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const BG = 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=90';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const DEFAULT_GOALS = {
  calories: 2000, protein: 50, carbs: 250,
  fat: 65, sodium: 2300, fiber: 28,
};

// Nutrition per 100g/100ml for common foods
const FOOD_DATABASE = {
  'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6, sodium: 74, fiber: 0 },
  'chicken': { calories: 165, protein: 31, carbs: 0, fat: 3.6, sodium: 74, fiber: 0 },
  'salmon': { calories: 208, protein: 20, carbs: 0, fat: 13, sodium: 59, fiber: 0 },
  'tuna': { calories: 144, protein: 30, carbs: 0, fat: 1, sodium: 320, fiber: 0 },
  'beef': { calories: 250, protein: 26, carbs: 0, fat: 17, sodium: 72, fiber: 0 },
  'ground beef': { calories: 254, protein: 26, carbs: 0, fat: 17, sodium: 75, fiber: 0 },
  'turkey': { calories: 135, protein: 30, carbs: 0, fat: 1, sodium: 70, fiber: 0 },
  'shrimp': { calories: 99, protein: 24, carbs: 0, fat: 0.3, sodium: 111, fiber: 0 },
  'eggs': { calories: 155, protein: 13, carbs: 1.1, fat: 11, sodium: 124, fiber: 0 },
  'egg': { calories: 155, protein: 13, carbs: 1.1, fat: 11, sodium: 124, fiber: 0 },
  'brown rice': { calories: 216, protein: 5, carbs: 45, fat: 1.8, sodium: 10, fiber: 3.5 },
  'white rice': { calories: 206, protein: 4.3, carbs: 45, fat: 0.4, sodium: 1, fiber: 0.6 },
  'quinoa': { calories: 222, protein: 8, carbs: 39, fat: 3.6, sodium: 13, fiber: 5 },
  'oats': { calories: 389, protein: 17, carbs: 66, fat: 7, sodium: 2, fiber: 11 },
  'oatmeal': { calories: 389, protein: 17, carbs: 66, fat: 7, sodium: 2, fiber: 11 },
  'pasta': { calories: 371, protein: 13, carbs: 75, fat: 1.5, sodium: 6, fiber: 3 },
  'bread': { calories: 265, protein: 9, carbs: 51, fat: 3.2, sodium: 477, fiber: 2.7 },
  'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, sodium: 1, fiber: 2.6 },
  'apple': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, sodium: 1, fiber: 2.4 },
  'orange': { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, sodium: 0, fiber: 2.4 },
  'blueberries': { calories: 57, protein: 0.7, carbs: 14, fat: 0.3, sodium: 1, fiber: 2.4 },
  'strawberries': { calories: 33, protein: 0.7, carbs: 8, fat: 0.3, sodium: 1, fiber: 2 },
  'avocado': { calories: 160, protein: 2, carbs: 9, fat: 15, sodium: 7, fiber: 7 },
  'broccoli': { calories: 55, protein: 3.7, carbs: 11, fat: 0.6, sodium: 33, fiber: 5.1 },
  'spinach': { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, sodium: 79, fiber: 2.2 },
  'kale': { calories: 49, protein: 4.3, carbs: 9, fat: 0.9, sodium: 38, fiber: 2 },
  'sweet potato': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, sodium: 55, fiber: 3 },
  'potato': { calories: 77, protein: 2, carbs: 17, fat: 0.1, sodium: 6, fiber: 2.2 },
  'almonds': { calories: 579, protein: 21, carbs: 22, fat: 50, sodium: 1, fiber: 12.5 },
  'walnuts': { calories: 654, protein: 15, carbs: 14, fat: 65, sodium: 2, fiber: 6.7 },
  'greek yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, sodium: 36, fiber: 0 },
  'yogurt': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, sodium: 36, fiber: 0 },
  'milk': { calories: 42, protein: 3.4, carbs: 5, fat: 1, sodium: 44, fiber: 0 },
  'cheese': { calories: 402, protein: 25, carbs: 1.3, fat: 33, sodium: 621, fiber: 0 },
  'olive oil': { calories: 884, protein: 0, carbs: 0, fat: 100, sodium: 2, fiber: 0 },
  'butter': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, sodium: 643, fiber: 0 },
  'chickpeas': { calories: 364, protein: 19, carbs: 61, fat: 6, sodium: 24, fiber: 17 },
  'lentils': { calories: 353, protein: 25, carbs: 60, fat: 1, sodium: 6, fiber: 31 },
  'black beans': { calories: 341, protein: 21, carbs: 63, fat: 1.4, sodium: 5, fiber: 16 },
  'tofu': { calories: 76, protein: 8, carbs: 1.9, fat: 4.8, sodium: 7, fiber: 0.3 },
  'almond milk': { calories: 17, protein: 0.6, carbs: 0.6, fat: 1.5, sodium: 72, fiber: 0.2 },
  'peanut butter': { calories: 588, protein: 25, carbs: 20, fat: 50, sodium: 426, fiber: 6 },
  'granola': { calories: 471, protein: 10, carbs: 64, fat: 20, sodium: 62, fiber: 5 },
  'coffee': { calories: 2, protein: 0.3, carbs: 0, fat: 0, sodium: 5, fiber: 0 },
  'orange juice': { calories: 45, protein: 0.7, carbs: 10, fat: 0.2, sodium: 1, fiber: 0.2 },
};

// Portion size multipliers (grams)
const PORTION_SIZES = {
  'small': 75, 'medium': 150, 'large': 250, 'extra large': 350,
  '1 cup': 240, '1/2 cup': 120, '1/4 cup': 60,
  '1 oz': 28, '2 oz': 56, '3 oz': 85, '4 oz': 113, '6 oz': 170, '8 oz': 227,
  '1 tbsp': 15, '2 tbsp': 30, '1 tsp': 5,
  '1 slice': 30, '2 slices': 60,
  '1 piece': 100, '2 pieces': 200,
  '1 egg': 50, '2 eggs': 100, '3 eggs': 150,
  '1 serving': 100, '2 servings': 200,
};

const MEDICAL_PORTALS = [
  {
    name: 'MyChart',
    desc: 'Epic-based portal used by most major hospitals and health systems',
    url: 'https://mychart.com',
    color: '#0066cc',
    icon: '🏥',
    systems: 'Used by Cleveland Clinic, Ohio State, Kaiser, Mayo Clinic and thousands more',
  },
  {
    name: 'FollowMyHealth',
    desc: 'Allscripts patient portal for accessing medical records and lab results',
    url: 'https://www.followmyhealth.com',
    color: '#00897b',
    icon: '📋',
    systems: 'Used by many independent physician practices and community hospitals',
  },
  {
    name: 'Apple Health',
    desc: 'Connect your iPhone Health app to view records, labs and medications',
    url: 'https://www.apple.com/ios/health/',
    color: '#555555',
    icon: '🍎',
    systems: 'Compatible with hundreds of hospitals via Health Records on iPhone',
  },
  {
    name: 'CommonHealth',
    desc: 'Android health records app — access your medical data on any Android device',
    url: 'https://www.commonhealth.us',
    color: '#34a853',
    icon: '📱',
    systems: 'Android equivalent of Apple Health for medical record access',
  },
  {
    name: 'MyHealthEData / BlueButton',
    desc: 'CMS Medicare patient data access — view claims, medications and conditions',
    url: 'https://www.cms.gov/myhealthdata',
    color: '#1565c0',
    icon: '🔵',
    systems: 'For Medicare and Medicaid patients across the United States',
  },
  {
    name: 'One Record',
    desc: 'Aggregates health records from multiple providers into one place',
    url: 'https://www.onerecord.com',
    color: '#7b1fa2',
    icon: '🔗',
    systems: 'Connects to thousands of health systems nationwide',
  },
  {
    name: 'VA My HealtheVet',
    desc: 'Veterans Affairs patient portal for military veterans',
    url: 'https://www.myhealth.va.gov',
    color: '#b71c1c',
    icon: '🎖',
    systems: 'For US military veterans receiving VA healthcare',
  },
  {
    name: 'Cerner Health',
    desc: 'Patient portal for Cerner-based hospital systems',
    url: 'https://www.cerner.com/patients',
    color: '#e65100',
    icon: '⚕️',
    systems: 'Used by Mercy Health, Ascension, Baptist Health and others',
  },
  {
    name: 'Patient Gateway',
    desc: 'Mass General Brigham patient portal',
    url: 'https://www.patientgateway.org',
    color: '#1a237e',
    icon: '🏨',
    systems: 'Mass General Hospital, Brigham and Women\'s and affiliated providers',
  },
  {
    name: 'MyUChicagoMedicine',
    desc: 'University of Chicago Medicine patient portal',
    url: 'https://www.uchicagomedicine.org/mychart',
    color: '#800000',
    icon: '🎓',
    systems: 'University of Chicago Medicine and affiliated practices',
  },
];

const DRUG_FOOD_INTERACTIONS = {
  'warfarin': { foods: ['spinach', 'kale', 'broccoli', 'vitamin k', 'grapefruit'], warning: 'Vitamin K-rich foods can reduce effectiveness. Avoid large amounts of leafy greens and grapefruit.' },
  'coumadin': { foods: ['spinach', 'kale', 'broccoli', 'vitamin k', 'grapefruit'], warning: 'Vitamin K-rich foods can reduce effectiveness. Avoid large amounts of leafy greens.' },
  'lisinopril': { foods: ['potassium', 'banana', 'salt substitute', 'orange juice'], warning: 'High potassium foods may increase potassium levels to dangerous amounts.' },
  'metformin': { foods: ['alcohol', 'refined sugar', 'white bread', 'white rice'], warning: 'Alcohol and high-sugar foods can increase risk of lactic acidosis.' },
  'atorvastatin': { foods: ['grapefruit', 'grapefruit juice'], warning: 'Grapefruit increases medication levels in blood, raising risk of serious side effects.' },
  'lipitor': { foods: ['grapefruit', 'grapefruit juice'], warning: 'Grapefruit increases medication levels in blood, raising risk of serious side effects.' },
  'levothyroxine': { foods: ['soy', 'calcium', 'iron', 'walnuts', 'high fiber'], warning: 'Many foods interfere with absorption. Take on empty stomach 30-60 min before eating.' },
  'synthroid': { foods: ['soy', 'calcium', 'iron', 'walnuts', 'high fiber'], warning: 'Many foods interfere with absorption. Take on empty stomach 30-60 min before eating.' },
  'spironolactone': { foods: ['potassium', 'banana', 'avocado', 'salt substitute'], warning: 'High potassium foods can cause dangerous potassium buildup in the blood.' },
  'digoxin': { foods: ['licorice', 'high fiber', 'oatmeal', 'bran'], warning: 'High fiber foods can reduce absorption. Licorice can cause dangerous heart rhythm.' },
  'cipro': { foods: ['dairy', 'calcium', 'antacids', 'iron'], warning: 'Dairy and calcium-rich foods reduce antibiotic absorption. Take 2 hours apart from food.' },
  'ciprofloxacin': { foods: ['dairy', 'calcium', 'antacids', 'iron'], warning: 'Dairy and calcium-rich foods reduce antibiotic absorption. Take 2 hours apart.' },
  'maoi': { foods: ['tyramine', 'aged cheese', 'wine', 'cured meat', 'fermented foods'], warning: 'Tyramine-rich foods can cause DANGEROUS blood pressure spikes. Avoid completely.' },
  'prozac': { foods: ['alcohol', 'caffeine', 'grapefruit'], warning: 'Alcohol worsens depression symptoms. Grapefruit may dangerously increase medication levels.' },
  'metoprolol': { foods: ['alcohol', 'caffeine', 'orange juice'], warning: 'Alcohol and caffeine may affect heart rate control. Avoid excessive consumption.' },
  'amlodipine': { foods: ['grapefruit', 'grapefruit juice'], warning: 'Grapefruit can dangerously increase medication levels causing severe low blood pressure.' },
  'prednisone': { foods: ['sodium', 'salt', 'potassium', 'calcium'], warning: 'Avoid high sodium foods. Increase potassium and calcium intake to prevent deficiency.' },
  'ibuprofen': { foods: ['alcohol', 'aspirin', 'sodium'], warning: 'Alcohol significantly increases risk of stomach bleeding. Never take on empty stomach.' },
};

export default function NutritionTracker() {
  const navigate = useNavigate();
  const { t } = useAccessibility();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('calories');
  const [todayLogs, setTodayLogs] = useState([]);
  const [medications, setMedications] = useState([]);
  const [message, setMessage] = useState('');
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showAddMed, setShowAddMed] = useState(false);
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [interactions, setInteractions] = useState([]);
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('nutritionGoals');
    return saved ? JSON.parse(saved) : DEFAULT_GOALS;
  });
  const [tempGoals, setTempGoals] = useState(goals);

  // Meal form
  const [mealName, setMealName] = useState('');
  const [mealType, setMealType] = useState('Breakfast');
  const [portionSize, setPortionSize] = useState('1 serving');
  const [customAmount, setCustomAmount] = useState('100');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [sodium, setSodium] = useState('');
  const [fiber, setFiber] = useState('');
  const [autoCalculated, setAutoCalculated] = useState(false);

  // Med form
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/'); return; }
    const parsed = JSON.parse(stored);
    if (!parsed?.token) { navigate('/'); return; }
    setUser(parsed);
    loadData(parsed);
  }, [navigate]);

  const loadData = async (u) => {
    const headers = { Authorization: `Bearer ${u.token}` };
    try {
      const [logsRes, medsRes] = await Promise.all([
        axios.get(`${API}/nutrition/today/${u.userId}`, { headers }),
        axios.get(`${API}/medications/user/${u.userId}`, { headers }),
      ]);
      setTodayLogs(logsRes.data || []);
      setMedications(medsRes.data || []);
      checkInteractions(medsRes.data || [], logsRes.data || []);
    } catch (err) {
      console.error('Load error:', err);
    }
    setLoading(false);
  };

  const checkInteractions = (meds, logs) => {
    const found = [];
    meds.forEach(med => {
      const medKey = med.medicationName.toLowerCase();
      const interaction = Object.entries(DRUG_FOOD_INTERACTIONS).find(
        ([key]) => medKey.includes(key)
      );
      if (interaction) {
        const [, data] = interaction;
        const loggedFoods = logs.map(l => l.mealName.toLowerCase()).join(' ');
        const hasConflict = data.foods.some(food =>
          loggedFoods.includes(food.toLowerCase())
        );
        found.push({
          medication: med.medicationName,
          warning: data.warning,
          foods: data.foods,
          conflict: hasConflict,
        });
      }
    });
    setInteractions(found);
  };

  // Auto-calculate nutrition from food name + portion
  const autoCalculateNutrition = (foodName, portion) => {
    const key = Object.keys(FOOD_DATABASE).find(k =>
      foodName.toLowerCase().includes(k)
    );
    if (!key) return;

    const foodData = FOOD_DATABASE[key];
    const portionGrams = PORTION_SIZES[portion] || parseInt(customAmount) || 100;
    const multiplier = portionGrams / 100;

    setCalories(Math.round(foodData.calories * multiplier).toString());
    setProtein((foodData.protein * multiplier).toFixed(1));
    setCarbs((foodData.carbs * multiplier).toFixed(1));
    setFat((foodData.fat * multiplier).toFixed(1));
    setSodium(Math.round(foodData.sodium * multiplier).toString());
    setFiber((foodData.fiber * multiplier).toFixed(1));
    setAutoCalculated(true);
  };

  const handleMealNameChange = (value) => {
    setMealName(value);
    setAutoCalculated(false);
    if (value.length > 2) {
      autoCalculateNutrition(value, portionSize);
    }
  };

  const handlePortionChange = (value) => {
    setPortionSize(value);
    if (mealName.length > 2) {
      autoCalculateNutrition(mealName, value);
    }
  };

  const saveGoals = () => {
    setGoals(tempGoals);
    localStorage.setItem('nutritionGoals', JSON.stringify(tempGoals));
    setShowGoalEditor(false);
    setMessage('Goals updated!');
    setTimeout(() => setMessage(''), 3000);
  };

  const logMeal = async () => {
    if (!mealName.trim() || !calories) return;
    try {
      await axios.post(`${API}/nutrition`, {
        mealName, mealType,
        calories: parseInt(calories) || 0,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        sodium: parseFloat(sodium) || 0,
        fiber: parseFloat(fiber) || 0,
      }, { headers: { Authorization: `Bearer ${user.token}` } });

      setMealName(''); setMealType('Breakfast'); setPortionSize('1 serving');
      setCalories(''); setProtein(''); setCarbs('');
      setFat(''); setSodium(''); setFiber('');
      setAutoCalculated(false);
      setShowAddMeal(false);
      setMessage('Meal logged!');
      setTimeout(() => setMessage(''), 3000);
      loadData(user);
    } catch (err) { console.error('Log error:', err); }
  };

  const deleteMeal = async (id) => {
    try {
      await axios.delete(`${API}/nutrition/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setTodayLogs(prev => prev.filter(l => l.id !== id));
    } catch (err) { console.error(err); }
  };

  const addMedication = async () => {
    if (!medName.trim()) return;
    try {
      await axios.post(`${API}/medications`, {
        medicationName: medName, dosage: medDosage,
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      setMedName(''); setMedDosage('');
      setShowAddMed(false);
      setMessage('Medication added!');
      setTimeout(() => setMessage(''), 3000);
      loadData(user);
    } catch (err) { console.error(err); }
  };

  const removeMedication = async (id) => {
    try {
      await axios.delete(`${API}/medications/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setMedications(prev => prev.filter(m => m.id !== id));
    } catch (err) { console.error(err); }
  };

  const totals = todayLogs.reduce((acc, log) => ({
    calories: acc.calories + (log.calories || 0),
    protein: acc.protein + (log.protein || 0),
    carbs: acc.carbs + (log.carbs || 0),
    fat: acc.fat + (log.fat || 0),
    sodium: acc.sodium + (log.sodium || 0),
    fiber: acc.fiber + (log.fiber || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0, fiber: 0 });

  const MacroBar = ({ label, value, goal, color, unit = 'g' }) => {
    const pct = Math.min((value / goal) * 100, 100);
    const over = value > goal;
    return (
      <div style={{ marginBottom: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ color: '#ffffff', fontSize: '13px', letterSpacing: '1px', fontFamily: 'Georgia, serif' }}>{label}</span>
          <span style={{ color: over ? '#ff2222' : color, fontSize: '13px', fontWeight: '700' }}>
            {Math.round(value * 10) / 10}{unit} / {goal}{unit}
            {over && (
              <span style={{ marginLeft: '8px', color: '#ff2222', fontWeight: '900', fontSize: '12px', letterSpacing: '1px' }}>
                ⚠ OVER LIMIT
              </span>
            )}
          </span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '2px', height: '10px' }}>
          <div style={{ width: `${pct}%`, background: over ? '#ff2222' : color, height: '100%', borderRadius: '2px', transition: 'width 0.5s ease', boxShadow: over ? '0 0 8px rgba(255,34,34,0.6)' : 'none' }} />
        </div>
      </div>
    );
  };

  const sectionStyle = {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '4px', padding: '24px 28px',
    marginBottom: '20px',
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '4px', color: '#ffffff',
    fontFamily: 'Georgia, serif', fontSize: '13px',
    outline: 'none', boxSizing: 'border-box',
  };

  const [showImportTips, setShowImportTips] = useState(false);
  const [importedNotes, setImportedNotes] = useState(() => {
    return localStorage.getItem('importedMedicalNotes') || '';
  });

  const saveImportedNotes = (notes) => {
    setImportedNotes(notes);
    localStorage.setItem('importedMedicalNotes', notes);
    setMessage('Medical notes saved!');
    setTimeout(() => setMessage(''), 3000);
  };

  const tabStyle = (active) => ({
    padding: '9px 20px',
    background: active ? 'rgba(232,196,154,0.2)' : 'transparent',
    border: active ? '1px solid rgba(232,196,154,0.5)' : '1px solid rgba(255,255,255,0.15)',
    borderRadius: '2px', color: active ? '#e8c49a' : 'rgba(255,255,255,0.8)',
    cursor: 'pointer', fontFamily: 'Georgia, serif',
    fontSize: '11px', letterSpacing: '2px', transition: 'all 0.2s',
  });

  if (loading) return <LoadingScreen bg={BG} />;

  return (
    <div className="page-enter" style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.65) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', letterSpacing: '3px', marginBottom: '6px' }}>INGREDISURE</div>
            <h1 style={{ margin: 0, fontSize: '34px', fontWeight: '400', color: '#ffffff', letterSpacing: '1px' }}>Nutrition & Medications</h1>
          </div>
          <button onClick={() => navigate('/dashboard')}
            style={{ background: 'transparent', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 24px', borderRadius: '2px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px' }}>
            ← DASHBOARD
          </button>
        </div>

        {/* Interaction alert banner */}
        {interactions.filter(i => i.conflict).length > 0 && (
          <div style={{ padding: '16px 20px', background: 'rgba(220,0,0,0.25)', border: '3px solid #ff0000', borderRadius: '4px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 0 20px rgba(255,0,0,0.4)' }}>
            <div style={{ fontSize: '32px', lineHeight: 1 }}>🚨</div>
            <div>
              <div style={{ fontSize: '14px', color: '#ff2222', fontWeight: '900', letterSpacing: '2px', marginBottom: '4px' }}>
                ⚠️ FOOD-DRUG INTERACTION WARNING ⚠️
              </div>
              <div style={{ color: '#ffffff', fontSize: '13px', lineHeight: '1.6' }}>
                Foods you logged today may dangerously interact with your medications. Check the FOOD INTERACTIONS tab immediately.
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button style={tabStyle(activeTab === 'tracker')} onClick={() => setActiveTab('tracker')}>CALORIE TRACKER</button>
          <button style={tabStyle(activeTab === 'medications')} onClick={() => setActiveTab('medications')}>MY MEDICATIONS</button>
          <button
            style={{ ...tabStyle(activeTab === 'interactions'), ...(interactions.filter(i => i.conflict).length > 0 ? { border: '2px solid #ff2222', color: '#ff2222', background: 'rgba(255,34,34,0.15)', fontWeight: '900' } : {}) }}
            onClick={() => setActiveTab('interactions')}
          >
            ⚠ FOOD INTERACTIONS
            {interactions.filter(i => i.conflict).length > 0 && (
              <span style={{ marginLeft: '6px', background: '#ff0000', color: '#ffffff', fontSize: '10px', padding: '2px 7px', borderRadius: '10px', fontWeight: '900', boxShadow: '0 0 8px rgba(255,0,0,0.6)' }}>
                {interactions.filter(i => i.conflict).length} ALERT{interactions.filter(i => i.conflict).length > 1 ? 'S' : ''}
              </span>
            )}
          </button>
          <button style={tabStyle(activeTab === 'records')} onClick={() => setActiveTab('records')}>
            🏥 MY HEALTH RECORDS
          </button>
        </div>

        {/* Message */}
        {message && (
          <div style={{ background: 'rgba(93,187,99,0.2)', border: '1px solid rgba(93,187,99,0.4)', borderRadius: '4px', padding: '12px 20px', marginBottom: '20px', color: '#7dd97f', fontSize: '13px' }}>
            {message}
          </div>
        )}

        {/* CALORIE TRACKER TAB */}
        {activeTab === 'tracker' && (
          <>
            {/* Daily summary */}
            <div style={sectionStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', letterSpacing: '3px', marginBottom: '4px' }}>TODAY'S NUTRITION</div>
                  <div style={{ fontSize: '42px', fontWeight: '300', color: totals.calories > goals.calories ? '#ff2222' : '#ffffff', lineHeight: 1 }}>
                    {totals.calories}
                    <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', marginLeft: '8px' }}>/ {goals.calories} cal</span>
                  </div>
                  {totals.calories > goals.calories && (
                    <div style={{ color: '#ff2222', fontSize: '12px', fontWeight: '900', marginTop: '4px', letterSpacing: '1px' }}>
                      ⚠ {totals.calories - goals.calories} CAL OVER YOUR DAILY GOAL
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginBottom: '2px' }}>REMAINING</div>
                    <div style={{ fontSize: '28px', fontWeight: '300', color: '#e8c49a' }}>
                      {Math.max(goals.calories - totals.calories, 0)} cal
                    </div>
                  </div>
                  <button onClick={() => { setTempGoals(goals); setShowGoalEditor(!showGoalEditor); }}
                    style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '2px', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '10px', letterSpacing: '2px' }}>
                    ⚙ SET GOALS
                  </button>
                </div>
              </div>

              <MacroBar label="PROTEIN" value={totals.protein} goal={goals.protein} color="#74b9ff" />
              <MacroBar label="CARBOHYDRATES" value={totals.carbs} goal={goals.carbs} color="#e8c49a" />
              <MacroBar label="FAT" value={totals.fat} goal={goals.fat} color="#fd79a8" />
              <MacroBar label="SODIUM" value={totals.sodium} goal={goals.sodium} color="#a29bfe" unit="mg" />
              <MacroBar label="FIBER" value={totals.fiber} goal={goals.fiber} color="#55efc4" />
            </div>

            {/* Goal editor */}
            {showGoalEditor && (
              <div style={{ ...sectionStyle, border: '1px solid rgba(232,196,154,0.4)' }}>
                <div style={{ fontSize: '11px', color: '#e8c49a', letterSpacing: '3px', marginBottom: '20px' }}>SET YOUR DAILY GOALS</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  {[
                    { key: 'calories', label: 'CALORIES', unit: 'cal' },
                    { key: 'protein', label: 'PROTEIN', unit: 'g' },
                    { key: 'carbs', label: 'CARBS', unit: 'g' },
                    { key: 'fat', label: 'FAT', unit: 'g' },
                    { key: 'sodium', label: 'SODIUM', unit: 'mg' },
                    { key: 'fiber', label: 'FIBER', unit: 'g' },
                  ].map(item => (
                    <div key={item.key}>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', letterSpacing: '2px', marginBottom: '6px' }}>
                        {item.label} ({item.unit})
                      </div>
                      <input
                        type="number"
                        value={tempGoals[item.key]}
                        onChange={e => setTempGoals(prev => ({ ...prev, [item.key]: parseInt(e.target.value) || 0 }))}
                        style={inputStyle}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={saveGoals}
                    style={{ flex: 1, padding: '12px', background: 'rgba(93,187,99,0.2)', border: '1px solid rgba(93,187,99,0.4)', borderRadius: '4px', color: '#7dd97f', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px' }}>
                    SAVE GOALS
                  </button>
                  <button onClick={() => setTempGoals(DEFAULT_GOALS)}
                    style={{ padding: '12px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px' }}>
                    RESET DEFAULTS
                  </button>
                </div>
              </div>
            )}

            {/* Log meal button */}
            <button onClick={() => setShowAddMeal(!showAddMeal)}
              style={{ width: '100%', padding: '14px', background: 'rgba(232,196,154,0.15)', border: '1px solid rgba(232,196,154,0.4)', borderRadius: '4px', color: '#e8c49a', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px', marginBottom: '16px' }}>
              {showAddMeal ? '✕ CANCEL' : '+ LOG A MEAL'}
            </button>

            {/* Add meal form */}
            {showAddMeal && (
              <div style={{ ...sectionStyle, border: '1px solid rgba(232,196,154,0.3)' }}>
                <div style={{ fontSize: '11px', color: '#e8c49a', letterSpacing: '3px', marginBottom: '20px' }}>LOG NEW MEAL</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', letterSpacing: '2px', marginBottom: '6px' }}>MEAL NAME *</div>
                    <input type="text" placeholder="e.g. Grilled Chicken, Salmon, Oatmeal..." value={mealName} onChange={e => handleMealNameChange(e.target.value)} style={inputStyle} />
                    {autoCalculated && (
                      <div style={{ fontSize: '10px', color: '#7dd97f', marginTop: '4px', fontStyle: 'italic' }}>
                        ✓ Nutrition auto-calculated — adjust if needed
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', letterSpacing: '2px', marginBottom: '6px' }}>MEAL TYPE</div>
                    <select value={mealType} onChange={e => setMealType(e.target.value)} style={inputStyle}>
                      {MEAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Portion size */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', letterSpacing: '2px', marginBottom: '8px' }}>PORTION SIZE</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {Object.keys(PORTION_SIZES).slice(0, 12).map(size => (
                      <button key={size} onClick={() => handlePortionChange(size)}
                        style={{ padding: '5px 12px', background: portionSize === size ? 'rgba(232,196,154,0.25)' : 'rgba(255,255,255,0.06)', border: portionSize === size ? '1px solid rgba(232,196,154,0.6)' : '1px solid rgba(255,255,255,0.12)', borderRadius: '2px', color: portionSize === size ? '#e8c49a' : 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '10px', letterSpacing: '0.5px' }}>
                        {size}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px', alignItems: 'center' }}>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px', whiteSpace: 'nowrap' }}>CUSTOM (g/ml):</div>
                    <input type="number" placeholder="100" value={customAmount}
                      onChange={e => { setCustomAmount(e.target.value); setPortionSize('custom'); if (mealName) autoCalculateNutrition(mealName, 'custom'); }}
                      style={{ ...inputStyle, width: '100px' }} />
                  </div>
                </div>

                {/* Nutrition fields */}
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', letterSpacing: '2px', marginBottom: '10px' }}>
                  NUTRITION DETAILS — Edit if auto-calculation needs adjustment
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                  {[
                    { label: 'CALORIES *', value: calories, set: setCalories, unit: 'kcal' },
                    { label: 'PROTEIN', value: protein, set: setProtein, unit: 'g' },
                    { label: 'CARBS', value: carbs, set: setCarbs, unit: 'g' },
                    { label: 'FAT', value: fat, set: setFat, unit: 'g' },
                    { label: 'SODIUM', value: sodium, set: setSodium, unit: 'mg' },
                    { label: 'FIBER', value: fiber, set: setFiber, unit: 'g' },
                  ].map(field => (
                    <div key={field.label}>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', letterSpacing: '1px', marginBottom: '5px' }}>
                        {field.label} <span style={{ color: 'rgba(255,255,255,0.4)' }}>({field.unit})</span>
                      </div>
                      <input type="number" placeholder="0" value={field.value}
                        onChange={e => { field.set(e.target.value); setAutoCalculated(false); }}
                        style={inputStyle} />
                    </div>
                  ))}
                </div>

                <button onClick={logMeal}
                  style={{ width: '100%', padding: '14px', background: 'rgba(93,187,99,0.2)', border: '1px solid rgba(93,187,99,0.4)', borderRadius: '4px', color: '#7dd97f', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px' }}>
                  LOG MEAL
                </button>
              </div>
            )}

            {/* Today's logged meals */}
            <div style={sectionStyle}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', letterSpacing: '3px', marginBottom: '16px' }}>
                TODAY'S MEALS — {todayLogs.length} LOGGED
              </div>
              {todayLogs.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', fontSize: '14px' }}>
                  No meals logged today. Click "+ LOG A MEAL" to get started.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {MEAL_TYPES.map(type => {
                    const typeLogs = todayLogs.filter(l => l.mealType === type);
                    if (typeLogs.length === 0) return null;
                    return (
                      <div key={type}>
                        <div style={{ fontSize: '10px', color: '#e8c49a', letterSpacing: '2px', marginBottom: '8px', marginTop: '8px' }}>{type.toUpperCase()}</div>
                        {typeLogs.map(log => (
                          <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '6px' }}>
                            <div>
                              <div style={{ color: '#ffffff', fontSize: '14px', marginBottom: '3px' }}>{log.mealName}</div>
                              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontStyle: 'italic' }}>
                                {log.calories} cal · P: {log.protein}g · C: {log.carbs}g · F: {log.fat}g · Na: {log.sodium}mg
                              </div>
                            </div>
                            <button onClick={() => deleteMeal(log.id)}
                              style={{ background: 'none', border: 'none', color: 'rgba(255,80,80,0.8)', cursor: 'pointer', fontSize: '20px', padding: '0 0 0 12px', fontWeight: 'bold' }}>
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* MEDICATIONS TAB */}
        {activeTab === 'medications' && (
          <>
            <div style={sectionStyle}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', letterSpacing: '3px', marginBottom: '8px' }}>MY MEDICATIONS</div>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontStyle: 'italic', marginBottom: '20px', lineHeight: '1.7' }}>
                Add your medications below. IngrediSure will automatically warn you about dangerous food interactions when you log meals or scan products.
              </p>

              <button onClick={() => setShowAddMed(!showAddMed)}
                style={{ width: '100%', padding: '12px', background: 'rgba(232,196,154,0.15)', border: '1px solid rgba(232,196,154,0.4)', borderRadius: '4px', color: '#e8c49a', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px', marginBottom: '16px' }}>
                {showAddMed ? '✕ CANCEL' : '+ ADD MEDICATION'}
              </button>

              {showAddMed && (
                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', letterSpacing: '2px', marginBottom: '6px' }}>MEDICATION NAME *</div>
                      <input type="text" placeholder="e.g. Metformin, Lisinopril, Warfarin..." value={medName} onChange={e => setMedName(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', letterSpacing: '2px', marginBottom: '6px' }}>DOSAGE</div>
                      <input type="text" placeholder="e.g. 500mg daily" value={medDosage} onChange={e => setMedDosage(e.target.value)} style={inputStyle} />
                    </div>
                  </div>
                  <button onClick={addMedication}
                    style={{ width: '100%', padding: '12px', background: 'rgba(93,187,99,0.2)', border: '1px solid rgba(93,187,99,0.4)', borderRadius: '4px', color: '#7dd97f', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px' }}>
                    ADD MEDICATION
                  </button>
                </div>
              )}

              {medications.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', fontSize: '14px' }}>No medications added yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {medications.map(med => {
                    const medKey = med.medicationName.toLowerCase();
                    const hasInteraction = Object.keys(DRUG_FOOD_INTERACTIONS).some(key => medKey.includes(key));
                    return (
                      <div key={med.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: hasInteraction ? 'rgba(255,50,50,0.1)' : 'rgba(255,255,255,0.05)', border: hasInteraction ? '1px solid rgba(255,50,50,0.5)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                        <div>
                          <div style={{ color: '#ffffff', fontSize: '15px', marginBottom: '3px' }}>{med.medicationName}</div>
                          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>
                            {med.dosage && <span style={{ marginRight: '12px', fontStyle: 'italic' }}>{med.dosage}</span>}
                            {hasInteraction && (
                              <span style={{ color: '#ff2222', fontSize: '11px', letterSpacing: '1px', fontWeight: '900' }}>
                                🚨 FOOD INTERACTIONS EXIST — CHECK INTERACTIONS TAB
                              </span>
                            )}
                          </div>
                        </div>
                        <button onClick={() => removeMedication(med.id)}
                          style={{ background: 'none', border: 'none', color: 'rgba(255,80,80,0.8)', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' }}>
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={{ padding: '16px 20px', background: 'rgba(255,34,34,0.1)', border: '2px solid rgba(255,34,34,0.4)', borderRadius: '4px' }}>
              <div style={{ fontSize: '11px', color: '#ff2222', letterSpacing: '2px', marginBottom: '6px', fontWeight: '900' }}>⚠️ MEDICAL DISCLAIMER</div>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', lineHeight: '1.7', margin: 0, fontStyle: 'italic' }}>
                IngrediSure provides general food-drug interaction information for awareness only. Always consult your physician or pharmacist before making changes to your diet. This is NOT medical advice.
              </p>
            </div>
          </>
        )}

        {/* MEDICAL RECORDS TAB */}
        {activeTab === 'records' && (
          <>
            {/* Intro */}
            <div style={{ ...sectionStyle, background: 'rgba(116,185,255,0.08)', border: '1px solid rgba(116,185,255,0.2)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ fontSize: '28px', flexShrink: 0 }}>🏥</div>
                <div>
                  <div style={{ fontSize: '11px', color: '#74b9ff', letterSpacing: '2px', marginBottom: '8px' }}>CONNECT YOUR MEDICAL RECORDS</div>
                  <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', lineHeight: '1.9', margin: '0 0 10px' }}>
                    Access your health records, lab results, medications and diagnoses directly from your healthcare provider's patient portal. Use the information from your records to keep your IngrediSure health profile up to date with your current conditions and medications.
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', lineHeight: '1.8', margin: 0, fontStyle: 'italic' }}>
                    Click any portal below to open it in a new tab. Once logged in, you can view your current medications and conditions — then add them to your IngrediSure profile for personalized safety checks.
                  </p>
                </div>
              </div>
            </div>

            {/* Portal grid */}
            <div style={sectionStyle}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', letterSpacing: '3px', marginBottom: '20px' }}>
                MAJOR PATIENT PORTALS — CLICK TO OPEN
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {MEDICAL_PORTALS.map(portal => (
                  <div
                    key={portal.name}
                    onClick={() => window.open(portal.url, '_blank')}
                    style={{ padding: '18px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s', borderLeft: `3px solid ${portal.color}` }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateX(3px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '20px' }}>{portal.icon}</span>
                      <div style={{ color: '#ffffff', fontSize: '15px', fontWeight: '600' }}>{portal.name}</div>
                      <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>↗</span>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', margin: '0 0 6px', lineHeight: '1.5' }}>
                      {portal.desc}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0, fontStyle: 'italic' }}>
                      {portal.systems}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* How to use records with IngrediSure */}
            <div style={sectionStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', letterSpacing: '3px' }}>
                  HOW TO USE YOUR RECORDS WITH INGREDISURE
                </div>
                <button onClick={() => setShowImportTips(!showImportTips)}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '2px', color: 'rgba(255,255,255,0.6)', padding: '5px 12px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '10px', letterSpacing: '1px' }}>
                  {showImportTips ? 'HIDE' : 'SHOW TIPS'}
                </button>
              </div>

              {showImportTips && (
                <div style={{ marginBottom: '20px' }}>
                  {[
                    { step: '01', title: 'Log into your patient portal', desc: 'Click any portal above to open it. Log in with your existing account credentials.' },
                    { step: '02', title: 'Find your active medications', desc: 'Look for "Medications", "Prescriptions" or "Medication List" in your portal. Note all current medications and dosages.' },
                    { step: '03', title: 'Find your diagnoses and conditions', desc: 'Look for "Problem List", "Conditions", "Diagnoses" or "Health Issues". These are your current medical conditions.' },
                    { step: '04', title: 'Add to IngrediSure', desc: 'Go to the MY MEDICATIONS tab to add your medications, and go to your Health Profile to add conditions. IngrediSure will immediately start checking food interactions.' },
                    { step: '05', title: 'Check food interactions', desc: 'Once your medications are added, click the FOOD INTERACTIONS tab to see which foods to avoid or limit based on your prescriptions.' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '16px', paddingBottom: '16px', borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                      <div style={{ fontSize: '18px', fontWeight: '300', color: 'rgba(116,185,255,0.5)', fontFamily: 'Georgia, serif', flexShrink: 0, width: '28px' }}>{item.step}</div>
                      <div>
                        <div style={{ color: '#ffffff', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>{item.title}</div>
                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: '1.6', fontStyle: 'italic' }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Personal medical notes */}
              <div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '2px', marginBottom: '10px' }}>
                  MY MEDICAL NOTES — Personal Reference
                </div>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', fontStyle: 'italic', marginBottom: '12px', lineHeight: '1.7' }}>
                  Use this space to paste or type key information from your health records — current medications, recent lab values, diagnoses or anything else you want to reference. This is stored only on your device.
                </p>
                <textarea
                  value={importedNotes}
                  onChange={e => setImportedNotes(e.target.value)}
                  placeholder="Paste or type your medical notes here...&#10;&#10;Examples:&#10;- Current A1C: 7.2&#10;- Blood pressure: 138/88&#10;- Active medications: Metformin 500mg, Lisinopril 10mg&#10;- Conditions: Type 2 Diabetes, Hypertension&#10;- Allergies: Penicillin&#10;- Last lab date: March 2026"
                  rows={8}
                  style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#ffffff', fontFamily: 'Georgia, serif', fontSize: '13px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', lineHeight: '1.7' }}
                />
                <button
                  onClick={() => saveImportedNotes(importedNotes)}
                  style={{ marginTop: '10px', padding: '10px 24px', background: 'rgba(116,185,255,0.2)', border: '1px solid rgba(116,185,255,0.4)', borderRadius: '4px', color: '#74b9ff', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '2px' }}>
                  SAVE NOTES
                </button>
              </div>
            </div>

            {/* Quick action buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button onClick={() => setActiveTab('medications')}
                style={{ padding: '16px', background: 'rgba(232,196,154,0.12)', border: '1px solid rgba(232,196,154,0.3)', borderRadius: '4px', color: '#e8c49a', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px', textAlign: 'center' }}>
                💊 ADD MEDICATIONS FROM RECORDS
              </button>
              <button onClick={() => navigate('/profile')}
                style={{ padding: '16px', background: 'rgba(93,187,99,0.12)', border: '1px solid rgba(93,187,99,0.3)', borderRadius: '4px', color: '#7dd97f', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px', textAlign: 'center' }}>
                🏥 UPDATE HEALTH PROFILE
              </button>
            </div>

            {/* Privacy note */}
            <div style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', marginTop: '16px' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '6px' }}>🔒 PRIVACY NOTE</div>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', lineHeight: '1.7', margin: 0, fontStyle: 'italic' }}>
                IngrediSure does not directly access or store your medical records. All patient portal links open in a separate tab and your login credentials are never shared with IngrediSure. Any notes you save here are stored only on your device. Always consult your healthcare provider before making changes based on this information.
              </p>
            </div>
          </>
        )}

        {/* FOOD INTERACTIONS TAB */}
        {activeTab === 'interactions' && (
          <>
            {interactions.length === 0 ? (
              <div style={sectionStyle}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', letterSpacing: '3px', marginBottom: '12px' }}>FOOD-DRUG INTERACTIONS</div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontStyle: 'italic' }}>
                  {medications.length === 0
                    ? 'Add your medications on the My Medications tab to see food interaction warnings.'
                    : 'No known food interactions found for your current medications.'}
                </p>
              </div>
            ) : (
              <>
                {interactions.filter(i => i.conflict).length > 0 && (
                  <div style={{ padding: '20px 24px', background: 'rgba(200,0,0,0.3)', border: '3px solid #ff0000', borderRadius: '4px', marginBottom: '24px', boxShadow: '0 0 24px rgba(255,0,0,0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div style={{ fontSize: '36px' }}>🚨</div>
                      <div style={{ fontSize: '16px', color: '#ff0000', fontWeight: '900', letterSpacing: '2px', textShadow: '0 0 8px rgba(255,0,0,0.8)' }}>
                        ⚠️ DANGEROUS FOOD-DRUG INTERACTIONS DETECTED ⚠️
                      </div>
                    </div>
                    <p style={{ color: '#ffffff', fontSize: '14px', margin: 0, lineHeight: '1.7', fontWeight: '600' }}>
                      Foods logged today may dangerously interact with your medications. Review each warning below and consult your doctor or pharmacist immediately.
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {interactions.map((interaction, i) => (
                    <div key={i} style={{ ...sectionStyle, border: interaction.conflict ? '2px solid #ff0000' : '1px solid rgba(255,165,0,0.5)', background: interaction.conflict ? 'rgba(180,0,0,0.2)' : 'rgba(255,165,0,0.08)', boxShadow: interaction.conflict ? '0 0 16px rgba(255,0,0,0.3)' : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                        <span style={{ fontSize: '28px' }}>{interaction.conflict ? '🚨' : '⚠️'}</span>
                        <div>
                          <div style={{ color: '#ffffff', fontSize: '18px', fontWeight: '700', marginBottom: '2px' }}>{interaction.medication}</div>
                          <div style={{ fontSize: '11px', color: interaction.conflict ? '#ff2222' : '#ffaa00', letterSpacing: '2px', fontWeight: '900' }}>
                            {interaction.conflict ? '🔴 ACTIVE CONFLICT WITH TODAY\'S MEALS' : '🟡 FOODS TO BE AWARE OF'}
                          </div>
                        </div>
                      </div>
                      <p style={{ color: '#ffffff', fontSize: '14px', lineHeight: '1.8', margin: '0 0 16px', fontWeight: interaction.conflict ? '600' : '400' }}>
                        {interaction.warning}
                      </p>
                      <div>
                        <div style={{ fontSize: '11px', color: '#ff2222', letterSpacing: '2px', marginBottom: '10px', fontWeight: '900' }}>
                          🚫 AVOID OR LIMIT THESE FOODS
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {interaction.foods.map((food, j) => (
                            <span key={j} style={{ padding: '5px 14px', background: 'rgba(220,0,0,0.3)', border: '2px solid #ff2222', borderRadius: '2px', color: '#ff4444', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px' }}>
                              ✗ {food.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '16px 20px', background: 'rgba(255,34,34,0.1)', border: '2px solid rgba(255,34,34,0.4)', borderRadius: '4px', marginTop: '8px' }}>
                  <div style={{ fontSize: '11px', color: '#ff2222', letterSpacing: '2px', marginBottom: '6px', fontWeight: '900' }}>⚠️ MEDICAL DISCLAIMER</div>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', lineHeight: '1.7', margin: 0, fontStyle: 'italic' }}>
                    Always consult your physician or pharmacist before making dietary changes. This information is for awareness only and is NOT medical advice.
                  </p>
                </div>
              </>
            )}
          </>
        )}

      </div>
    </div>
  );
}