import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from './Toast';
import { useAccessibility } from '../AccessibilityContext';
import LoadingScreen from './LoadingScreen';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const BG = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=90';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MEAL_TEMPLATES = {
  breakfast: [
    { name: 'Greek Yogurt Parfait', ingredients: 'greek yogurt, granola, berries, honey', category: 'Breakfast' },
    { name: 'Avocado Toast', ingredients: 'whole wheat bread, avocado, eggs, lemon, salt', category: 'Breakfast' },
    { name: 'Oatmeal with Berries', ingredients: 'oats, blueberries, banana, almond milk, honey', category: 'Breakfast' },
    { name: 'Veggie Omelette', ingredients: 'eggs, spinach, tomato, bell pepper, onion, olive oil', category: 'Breakfast' },
    { name: 'Smoothie Bowl', ingredients: 'acai, banana, mango, coconut milk, granola, seeds', category: 'Breakfast' },
    { name: 'Whole Grain Pancakes', ingredients: 'whole wheat flour, eggs, almond milk, banana, maple syrup', category: 'Breakfast' },
    { name: 'Chia Seed Pudding', ingredients: 'chia seeds, almond milk, vanilla, berries, honey', category: 'Breakfast' },
  ],
  lunch: [
    { name: 'Quinoa Buddha Bowl', ingredients: 'quinoa, chickpeas, avocado, kale, tahini, lemon', category: 'Lunch' },
    { name: 'Grilled Chicken Salad', ingredients: 'chicken breast, mixed greens, tomato, cucumber, olive oil', category: 'Lunch' },
    { name: 'Lentil Soup', ingredients: 'red lentils, tomatoes, cumin, turmeric, vegetable broth, garlic', category: 'Lunch' },
    { name: 'Turkey Wrap', ingredients: 'whole wheat tortilla, turkey, lettuce, tomato, mustard, avocado', category: 'Lunch' },
    { name: 'Mediterranean Salad', ingredients: 'cucumber, tomato, olives, feta, red onion, olive oil, oregano', category: 'Lunch' },
    { name: 'Tuna Salad Bowl', ingredients: 'tuna, brown rice, cucumber, avocado, soy sauce, sesame seeds', category: 'Lunch' },
    { name: 'Black Bean Tacos', ingredients: 'black beans, corn tortilla, cabbage, salsa, lime, cilantro', category: 'Lunch' },
  ],
  dinner: [
    { name: 'Baked Salmon', ingredients: 'salmon, lemon, dill, olive oil, garlic, asparagus', category: 'Dinner' },
    { name: 'Chicken Stir Fry', ingredients: 'chicken, broccoli, bell pepper, soy sauce, ginger, garlic, brown rice', category: 'Dinner' },
    { name: 'Vegetable Curry', ingredients: 'chickpeas, sweet potato, spinach, coconut milk, turmeric, cumin', category: 'Dinner' },
    { name: 'Grilled Tilapia', ingredients: 'tilapia, lemon, herbs, olive oil, green beans, garlic', category: 'Dinner' },
    { name: 'Turkey Meatballs', ingredients: 'ground turkey, whole wheat pasta, marinara, garlic, basil, parmesan', category: 'Dinner' },
    { name: 'Stuffed Bell Peppers', ingredients: 'bell peppers, quinoa, black beans, tomato, corn, cumin, cheese', category: 'Dinner' },
    { name: 'Shrimp Stir Fry', ingredients: 'shrimp, bok choy, snap peas, soy sauce, sesame oil, brown rice', category: 'Dinner' },
  ],
};

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

export default function MealPlanner() {
  const navigate = useNavigate();
  const { t } = useAccessibility();
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };
  const [plan, setPlan] = useState(null);
  const [verdicts, setVerdicts] = useState({});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [savedPlans, setSavedPlans] = useState([]);
  const [activeDay, setActiveDay] = useState('Monday');
  const [planName, setPlanName] = useState('');
  const [message, setMessage] = useState('');
  const [view, setView] = useState('planner');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/'); return; }
    const parsed = JSON.parse(stored);
    if (!parsed?.token) { navigate('/'); return; }
    setUser(parsed);

    const savedPlan = localStorage.getItem('mealPlan');
    if (savedPlan) {
      try {
        setPlan(JSON.parse(savedPlan));
      } catch (e) {}
    }
  }, [navigate]);

  const generatePlan = async () => {
    setGenerating(true);
    setVerdicts({});

    const breakfasts = shuffle(MEAL_TEMPLATES.breakfast);
    const lunches = shuffle(MEAL_TEMPLATES.lunch);
    const dinners = shuffle(MEAL_TEMPLATES.dinner);

    const newPlan = {};
    DAYS.forEach((day, i) => {
      newPlan[day] = {
        breakfast: breakfasts[i % breakfasts.length],
        lunch: lunches[i % lunches.length],
        dinner: dinners[i % dinners.length],
      };
    });

    setPlan(newPlan);
    localStorage.setItem('mealPlan', JSON.stringify(newPlan));
    setGenerating(false);

    // Check safety for all meals
    checkAllVerdicts(newPlan);
  };

  const checkAllVerdicts = async (planData) => {
    if (!user) return;
    const headers = { Authorization: `Bearer ${user.token}` };
    const newVerdicts = {};

    for (const day of DAYS) {
      for (const mealType of ['breakfast', 'lunch', 'dinner']) {
        const meal = planData[day][mealType];
        const key = `${day}-${mealType}`;
        try {
          const res = await axios.post(`${API}/menu`, {
            itemName: meal.name,
            ingredients: meal.ingredients,
            sodiumLevel: 0,
            restaurantName: 'Meal Plan',
            dietCategory: meal.category,
          }, { headers });
          newVerdicts[key] = res.data.safetyVerdict;
        } catch (err) {
          newVerdicts[key] = 'Unknown';
        }
      }
    }
    setVerdicts(newVerdicts);
  };

  const swapMeal = (day, mealType) => {
    const templates = MEAL_TEMPLATES[mealType];
    const current = plan[day][mealType];
    const others = templates.filter(m => m.name !== current.name);
    const newMeal = others[Math.floor(Math.random() * others.length)];

    const updated = {
      ...plan,
      [day]: { ...plan[day], [mealType]: newMeal }
    };
    setPlan(updated);
    localStorage.setItem('mealPlan', JSON.stringify(updated));

    // Re-check this meal
    if (user) {
      const headers = { Authorization: `Bearer ${user.token}` };
      const key = `${day}-${mealType}`;
      axios.post(`${API}/menu`, {
        itemName: newMeal.name,
        ingredients: newMeal.ingredients,
        sodiumLevel: 0,
        restaurantName: 'Meal Plan',
        dietCategory: newMeal.category,
      }, { headers }).then(res => {
        setVerdicts(prev => ({ ...prev, [key]: res.data.safetyVerdict }));
      }).catch(() => {});
    }
  };

  const saveToGroceryList = async (day) => {
    if (!user || !plan) return;
    const dayMeals = plan[day];
    const allIngredients = [
      ...dayMeals.breakfast.ingredients.split(', '),
      ...dayMeals.lunch.ingredients.split(', '),
      ...dayMeals.dinner.ingredients.split(', '),
    ];
    const uniqueIngredients = [...new Set(allIngredients)];
    const items = uniqueIngredients.map((ing, i) => ({
      id: i + 1, name: ing.trim(), checked: false, measure: '',
    }));

    try {
      await axios.post(`${API}/grocery-lists`, {
        listName: `${day} Meal Plan`,
        recipeName: `${dayMeals.breakfast.name}, ${dayMeals.lunch.name}, ${dayMeals.dinner.name}`,
        items: JSON.stringify(items),
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      showToast(`${day}'s grocery list saved! ✓`, 'success');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const exportToCalendar = () => {
    if (!plan) return;

    const today = new Date();
    const monday = new Date(today);
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(today.getDate() + daysToMonday);

    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const formatDateLocal = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}${m}${d}`;
    };

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//IngrediSure//Meal Planner//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:IngrediSure Meal Plan',
      'X-WR-CALDESC:Your personalized weekly meal plan from IngrediSure',
    ].join('\r\n');

    DAYS.forEach((day, dayIndex) => {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + dayIndex);
      const dateStr = formatDateLocal(dayDate);

      const meals = plan[day];
      if (!meals) return;

      const mealSchedule = [
        { type: 'BREAKFAST', meal: meals.breakfast, hour: '080000', endHour: '083000' },
        { type: 'LUNCH', meal: meals.lunch, hour: '120000', endHour: '123000' },
        { type: 'DINNER', meal: meals.dinner, hour: '180000', endHour: '183000' },
      ];

      mealSchedule.forEach(({ type, meal, hour, endHour }) => {
        if (!meal) return;
        const uid = `${dateStr}-${type.toLowerCase()}-${Math.random().toString(36).substr(2, 9)}@ingredisure`;
        const verdict = verdicts[`${day}-${type.toLowerCase()}`] || 'Unknown';
        const safetyNote = verdict === 'Safe' ? '✓ SAFE for your health profile' :
                           verdict === 'Caution' ? '⚠ CAUTION - review ingredients' :
                           verdict === 'Unsafe' ? '✗ UNSAFE - check alternatives' :
                           'Safety not yet checked';

        icsContent += '\r\n' + [
          'BEGIN:VEVENT',
          `UID:${uid}`,
          `DTSTART;TZID=America/New_York:${dateStr}T${hour}`,
          `DTEND;TZID=America/New_York:${dateStr}T${endHour}`,
          `SUMMARY:${type}: ${meal.name}`,
          `DESCRIPTION:${meal.name}\\n\\nIngredients: ${meal.ingredients}\\n\\nSafety: ${safetyNote}\\n\\nGenerated by IngrediSure - Eat Well. Choose Wisely.`,
          `CATEGORIES:MEAL PLAN,${type}`,
          `STATUS:CONFIRMED`,
          `TRANSP:TRANSPARENT`,
          'END:VEVENT',
        ].join('\r\n');
      });
    });

    icsContent += '\r\nEND:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'IngrediSure-MealPlan.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setMessage('Meal plan exported! Open the downloaded file to add to your calendar.');
    setTimeout(() => setMessage(''), 4000);
  };

  const exportToGoogleCalendar = (day, mealType) => {
    if (!plan || !plan[day]) return;
    const meal = plan[day][mealType];
    if (!meal) return;

    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + daysToMonday);

    const dayIndex = DAYS.indexOf(day);
    const mealDate = new Date(monday);
    mealDate.setDate(monday.getDate() + dayIndex);

    const hours = mealType === 'breakfast' ? 8 : mealType === 'lunch' ? 12 : 18;
    const start = new Date(mealDate);
    start.setHours(hours, 0, 0, 0);
    const end = new Date(start);
    end.setMinutes(30);

    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const verdict = verdicts[`${day}-${mealType}`] || '';
    const details = `Ingredients: ${meal.ingredients}\n\nSafety: ${verdict}\n\nFrom IngrediSure`;

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(mealType.toUpperCase() + ': ' + meal.name)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(details)}`;
    window.open(url, '_blank');
  };

  const saveFullWeekToGroceryList = async () => {
    if (!user || !plan) return;
    const allIngredients = [];
    DAYS.forEach(day => {
      const meals = plan[day];
      ['breakfast', 'lunch', 'dinner'].forEach(type => {
        meals[type].ingredients.split(', ').forEach(ing => {
          if (!allIngredients.includes(ing.trim())) {
            allIngredients.push(ing.trim());
          }
        });
      });
    });

    const items = allIngredients.map((ing, i) => ({
      id: i + 1, name: ing, checked: false, measure: '',
    }));

    try {
      await axios.post(`${API}/grocery-lists`, {
        listName: 'Full Week Meal Plan',
        recipeName: '7-Day Meal Plan',
        items: JSON.stringify(items),
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      setMessage('Full week grocery list saved!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const verdictColor = (v) => {
    if (v === 'Safe') return '#7dd97f';
    if (v === 'Caution') return '#f0c040';
    if (v === 'Unsafe') return '#ff6b6b';
    return 'rgba(255,255,255,0.3)';
  };

  const verdictIcon = (v) => {
    if (v === 'Safe') return '✓';
    if (v === 'Caution') return '⚠';
    if (v === 'Unsafe') return '✗';
    return '·';
  };

  const sectionStyle = {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '4px', padding: '20px 24px',
    marginBottom: '16px',
  };

  const mealCardStyle = (verdict) => ({
    padding: '12px 14px',
    background: verdict === 'Safe' ? 'rgba(93,187,99,0.1)' :
                verdict === 'Caution' ? 'rgba(240,192,64,0.1)' :
                verdict === 'Unsafe' ? 'rgba(255,107,107,0.1)' :
                'rgba(255,255,255,0.04)',
    border: `1px solid ${verdictColor(verdict)}30`,
    borderRadius: '4px',
    marginBottom: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  });

  return (
    <div className="page-enter" style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.65) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '6px' }}>INGREDISURE</div>
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '400', color: '#ffffff', letterSpacing: '1px' }}>Weekly Meal Planner</h1>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.5)', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px', fontWeight: '600' }}
            >
              ← DASHBOARD
            </button>
            <button
              onClick={() => navigate('/my-profile')}
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.5)', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px', fontWeight: '600' }}
            >
              MY PROFILE
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div style={{ background: 'rgba(93,187,99,0.2)', border: '1px solid rgba(93,187,99,0.4)', borderRadius: '4px', padding: '12px 20px', marginBottom: '20px', color: '#7dd97f', fontSize: '13px', letterSpacing: '1px' }}>
            {message}
          </div>
        )}

        {/* Generate button */}
        {!plan ? (
          <div style={{ ...sectionStyle, textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '3px', marginBottom: '16px' }}>GET STARTED</div>
            <h2 style={{ color: '#ffffff', fontSize: '24px', fontWeight: '400', margin: '0 0 12px' }}>Generate Your 7-Day Meal Plan</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontStyle: 'italic', margin: '0 0 32px', lineHeight: '1.8' }}>
              We'll create a personalized weekly meal plan with breakfast, lunch, and dinner.<br/>
              Each meal is checked against your health profile for safety.
            </p>
            <button
              onClick={generatePlan}
              disabled={generating}
              style={{ padding: '18px 48px', background: 'rgba(232,196,154,0.2)', border: '1px solid rgba(232,196,154,0.5)', borderRadius: '4px', color: '#e8c49a', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '13px', letterSpacing: '3px' }}
            >
              {generating ? 'GENERATING...' : 'GENERATE MEAL PLAN'}
            </button>
          </div>
        ) : (
          <>
            {/* Calendar export instructions */}
            <div style={{ padding: '14px 20px', background: 'rgba(116,185,255,0.1)', border: '1px solid rgba(116,185,255,0.25)', borderRadius: '4px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>📅</span>
              <div>
                <div style={{ fontSize: '11px', color: '#74b9ff', letterSpacing: '2px', marginBottom: '4px' }}>SAVE TO YOUR CALENDAR</div>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', margin: 0, lineHeight: '1.7', fontStyle: 'italic' }}>
                  Click <strong style={{ color: '#74b9ff' }}>EXPORT TO CALENDAR</strong> to download your full week as a .ics file — works with Google Calendar, Apple Calendar, Outlook, Yahoo Mail and all major calendar apps. Or click <strong style={{ color: '#74b9ff' }}>📅 CAL</strong> on any meal to add it directly to Google Calendar.
                </p>
              </div>
            </div>

            {/* Action bar */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <button
                onClick={generatePlan}
                style={{ padding: '10px 20px', background: 'rgba(232,196,154,0.15)', border: '1px solid rgba(232,196,154,0.4)', borderRadius: '2px', color: '#e8c49a', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '2px' }}
              >
                ↻ REGENERATE
              </button>
              <button
                onClick={saveFullWeekToGroceryList}
                style={{ padding: '10px 20px', background: 'rgba(93,187,99,0.15)', border: '1px solid rgba(93,187,99,0.4)', borderRadius: '2px', color: '#7dd97f', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '2px' }}
              >
                🛒 SAVE FULL WEEK GROCERY LIST
              </button>
              <button
                onClick={exportToCalendar}
                style={{ padding: '10px 20px', background: 'rgba(116,185,255,0.15)', border: '1px solid rgba(116,185,255,0.4)', borderRadius: '2px', color: '#74b9ff', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '2px' }}
              >
                📅 EXPORT TO CALENDAR
              </button>
              <button
                onClick={() => navigate('/grocery-lists')}
                style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '2px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '2px' }}
              >
                VIEW MY LISTS
              </button>
            </div>

            {/* Day tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
              {DAYS.map(day => {
                const dayVerdicts = ['breakfast', 'lunch', 'dinner'].map(t => verdicts[`${day}-${t}`]);
                const hasUnsafe = dayVerdicts.includes('Unsafe');
                const hasCaution = dayVerdicts.includes('Caution');
                return (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    style={{
                      padding: '8px 16px', flexShrink: 0,
                      background: activeDay === day ? 'rgba(232,196,154,0.2)' : 'rgba(255,255,255,0.05)',
                      border: activeDay === day ? '1px solid rgba(232,196,154,0.5)' : '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '2px',
                      color: activeDay === day ? '#e8c49a' : 'rgba(255,255,255,0.5)',
                      cursor: 'pointer', fontFamily: 'Georgia, serif',
                      fontSize: '11px', letterSpacing: '1px',
                      position: 'relative',
                    }}
                  >
                    {day.substring(0, 3).toUpperCase()}
                    {(hasUnsafe || hasCaution) && (
                      <span style={{ marginLeft: '4px', fontSize: '10px', color: hasUnsafe ? '#ff6b6b' : '#f0c040' }}>
                        {hasUnsafe ? '✗' : '⚠'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Day view */}
            {plan[activeDay] && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                {['breakfast', 'lunch', 'dinner'].map(mealType => {
                  const meal = plan[activeDay][mealType];
                  const key = `${activeDay}-${mealType}`;
                  const verdict = verdicts[key];
                  return (
                    <div key={mealType} style={sectionStyle}>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '12px' }}>
                        {mealType.toUpperCase()}
                      </div>

                      <div style={mealCardStyle(verdict)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: '400', flex: 1, lineHeight: '1.4' }}>
                            {meal.name}
                          </div>
                          {verdict && (
                            <span style={{ fontSize: '14px', color: verdictColor(verdict), marginLeft: '8px', flexShrink: 0 }}>
                              {verdictIcon(verdict)}
                            </span>
                          )}
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontStyle: 'italic', lineHeight: '1.5' }}>
                          {meal.ingredients}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button
                          onClick={() => swapMeal(activeDay, mealType)}
                          style={{ flex: 1, padding: '6px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '2px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '10px', letterSpacing: '1px' }}
                        >
                          ↻ SWAP
                        </button>
                        <button
                          onClick={() => navigate('/recipes')}
                          style={{ flex: 1, padding: '6px', background: 'transparent', border: '1px solid rgba(232,196,154,0.2)', borderRadius: '2px', color: 'rgba(232,196,154,0.6)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '10px', letterSpacing: '1px' }}
                        >
                          RECIPE
                        </button>
                        <button
                          onClick={() => exportToGoogleCalendar(activeDay, mealType)}
                          style={{ flex: 1, padding: '6px', background: 'transparent', border: '1px solid rgba(116,185,255,0.25)', borderRadius: '2px', color: 'rgba(116,185,255,0.7)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '10px', letterSpacing: '1px' }}
                          title="Add to Google Calendar"
                        >
                          📅 CAL
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Day grocery list button */}
            <button
              onClick={() => saveToGroceryList(activeDay)}
              style={{ width: '100%', padding: '14px', background: 'rgba(116,185,255,0.1)', border: '1px solid rgba(116,185,255,0.3)', borderRadius: '4px', color: 'rgba(116,185,255,0.9)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px', marginTop: '4px' }}
            >
              🛒 SAVE {activeDay.toUpperCase()} GROCERY LIST
            </button>

            {/* Weekly overview */}
            <div style={{ ...sectionStyle, marginTop: '20px' }}>
              <h2 style={{ margin: '0 0 20px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
                WEEKLY OVERVIEW
              </h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '400', letterSpacing: '2px', padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>DAY</th>
                      <th style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '400', letterSpacing: '2px', padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>BREAKFAST</th>
                      <th style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '400', letterSpacing: '2px', padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>LUNCH</th>
                      <th style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '400', letterSpacing: '2px', padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>DINNER</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map(day => (
                      <tr
                        key={day}
                        onClick={() => setActiveDay(day)}
                        style={{ cursor: 'pointer', background: activeDay === day ? 'rgba(232,196,154,0.05)' : 'transparent' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                        onMouseLeave={e => e.currentTarget.style.background = activeDay === day ? 'rgba(232,196,154,0.05)' : 'transparent'}
                      >
                        <td style={{ padding: '10px 12px', color: activeDay === day ? '#e8c49a' : 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.04)', fontWeight: activeDay === day ? '600' : '400' }}>
                          {day}
                        </td>
                        {['breakfast', 'lunch', 'dinner'].map(type => {
                          const v = verdicts[`${day}-${type}`];
                          return (
                            <td key={type} style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '11px', color: verdictColor(v) }}>{verdictIcon(v)}</span>
                                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{plan[day]?.[type]?.name}</span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}