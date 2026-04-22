import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingScreen from './LoadingScreen';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const BG = 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&q=90';

const MEAL_CATEGORIES = [
  'Chicken', 'Seafood', 'Vegetarian', 'Vegan', 'Beef',
  'Pasta', 'Breakfast', 'Dessert', 'Salad', 'Soup',
];



export default function RecipeSuggestions() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [groceryList, setGroceryList] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Chicken');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [likedFoods, setLikedFoods] = useState('');
  const [dislikedFoods, setDislikedFoods] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [verdicts, setVerdicts] = useState({});
  const [listSaved, setListSaved] = useState(false);
  const [savingList, setSavingList] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/'); return; }
    const parsed = JSON.parse(stored);
    if (!parsed?.token) { navigate('/'); return; }
    setUser(parsed);
    fetchRecipes('Chicken');
  }, [navigate]);

  const fetchRecipes = async (category) => {
    setLoading(true);
    setRecipes([]);
    setSelected(null);
    setGroceryList([]);
    try {
      const res = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
      );
      const meals = (res.data.meals || []).slice(0, 12);
      setRecipes(meals);
    } catch (err) {
      console.error('Recipe fetch error:', err);
    }
    setLoading(false);
  };

  const searchRecipes = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setRecipes([]);
    setSelected(null);
    try {
      const res = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`
      );
      setRecipes((res.data.meals || []).slice(0, 12));
    } catch (err) {
      console.error('Search error:', err);
    }
    setLoading(false);
  };

  const selectRecipe = async (meal) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
      );
      const detail = res.data.meals?.[0];
      if (!detail) return;
      setSelected(detail);

      // Build grocery list from ingredients
      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        const ing = detail[`strIngredient${i}`];
        const measure = detail[`strMeasure${i}`];
        if (ing && ing.trim()) {
          ingredients.push({
            id: i,
            ingredient: ing.trim(),
            measure: measure?.trim() || '',
          });
        }
      }
      setGroceryList(ingredients);
      setCheckedItems({});

      // Check safety of each ingredient
      if (user) {
        const ingText = ingredients.map(i => i.ingredient).join(', ');
        try {
          const safetyRes = await axios.post(`${API}/menu`, {
            itemName: detail.strMeal,
            ingredients: ingText,
            sodiumLevel: 0,
            restaurantName: 'Recipe',
            dietCategory: 'Recipe',
          }, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setVerdicts(safetyRes.data);
        } catch (err) {
          console.error('Safety check error:', err);
        }
      }
    } catch (err) {
      console.error('Recipe detail error:', err);
    }
    setLoading(false);
  };

  const toggleCheck = (id) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const saveGroceryList = async () => {
    if (!selected || groceryList.length === 0 || !user) return;
    setSavingList(true);
    try {
      const items = groceryList.map(item => ({
        id: item.id,
        name: item.ingredient,
        measure: item.measure,
        checked: false,
      }));
      await axios.post(`${API}/grocery-lists`, {
        listName: selected.strMeal,
        recipeName: selected.strMeal,
        items: JSON.stringify(items),
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setListSaved(true);
      setTimeout(() => setListSaved(false), 3000);
    } catch (err) {
      console.error('Save list error:', err);
    }
    setSavingList(false);
  };

  const verdictColor = (v) => {
    if (v === 'Safe') return '#7dd97f';
    if (v === 'Caution') return '#f0c040';
    if (v === 'Unsafe') return '#ff6b6b';
    return '#ffffff';
  };

  const sectionStyle = {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '4px', padding: '28px 32px',
    marginBottom: '20px',
  };

  const chipStyle = (active) => ({
    padding: '6px 16px',
    background: active ? 'rgba(232,196,154,0.25)' : 'rgba(255,255,255,0.05)',
    border: active ? '1px solid rgba(232,196,154,0.6)' : '1px solid rgba(255,255,255,0.12)',
    borderRadius: '2px',
    color: active ? '#e8c49a' : 'rgba(255,255,255,0.5)',
    cursor: 'pointer', fontFamily: 'Georgia, serif',
    fontSize: '11px', letterSpacing: '1px',
    transition: 'all 0.2s', whiteSpace: 'nowrap',
  });

  return (
    <div className="page-enter" style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.65) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '6px' }}>INGREDISURE</div>
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '400', color: '#ffffff', letterSpacing: '1px' }}>Recipe Suggestions</h1>
          </div>
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

        {/* Search + preferences */}
        <div style={sectionStyle}>
          <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
            FIND RECIPES
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
            Discover healthy recipes that work with your health profile
          </p>

          {/* Search bar */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Search recipes e.g. salmon, quinoa, chicken stir fry..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchRecipes()}
              style={{ flex: 1, padding: '14px 18px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: '#ffffff', fontFamily: 'Georgia, serif', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
            />
            <button
              onClick={searchRecipes}
              style={{ padding: '14px 28px', background: 'rgba(93,187,99,0.3)', border: '1px solid rgba(93,187,99,0.5)', color: '#7dd97f', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '1px', whiteSpace: 'nowrap' }}
            >
              SEARCH
            </button>
          </div>

          {/* Categories */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '10px' }}>MEAL TYPE</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {MEAL_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  style={chipStyle(activeCategory === cat)}
                  onClick={() => { setActiveCategory(cat); fetchRecipes(cat); }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Food preferences toggle */}
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '2px', color: 'rgba(255,255,255,0.5)', padding: '8px 16px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px' }}
          >
            {showPreferences ? '▲ HIDE' : '▼ SHOW'} FOOD PREFERENCES
          </button>

          {showPreferences && (
            <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '8px' }}>FOODS YOU LIKE</div>
                <input
                  type="text"
                  placeholder="e.g. salmon, avocado, quinoa, berries..."
                  value={likedFoods}
                  onChange={e => setLikedFoods(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#ffffff', fontFamily: 'Georgia, serif', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '8px' }}>FOODS TO AVOID</div>
                <input
                  type="text"
                  placeholder="e.g. shellfish, peanuts, dairy, spicy food..."
                  value={dislikedFoods}
                  onChange={e => setDislikedFoods(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', color: '#ffffff', fontFamily: 'Georgia, serif', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Recipe grid */}
        {!selected && (
          <div style={sectionStyle}>
            <h2 style={{ margin: '0 0 20px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
              {loading ? 'LOADING RECIPES...' : `${activeCategory.toUpperCase()} RECIPES — ${recipes.length} FOUND`}
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {recipes.map(meal => (
                <div
                  key={meal.idMeal}
                  onClick={() => selectRecipe(meal)}
                  style={{ cursor: 'pointer', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <img
                    src={meal.strMealThumb}
                    alt={meal.strMeal}
                    style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ padding: '12px', background: 'rgba(255,255,255,0.06)' }}>
                    <div style={{ color: '#ffffff', fontSize: '13px', lineHeight: '1.4' }}>{meal.strMeal}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected recipe detail */}
        {selected && (
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: '0 0 8px', fontSize: '26px', fontWeight: '400', color: '#ffffff' }}>{selected.strMeal}</h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {selected.strCategory && <span style={{ color: '#e8c49a', fontSize: '12px', letterSpacing: '1px' }}>{selected.strCategory}</span>}
                  {selected.strArea && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', letterSpacing: '1px' }}>{selected.strArea} cuisine</span>}
                </div>
              </div>
              <button
                onClick={() => { setSelected(null); setGroceryList([]); setVerdicts({}); }}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', padding: '6px 16px', borderRadius: '2px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px', flexShrink: 0 }}
              >
                ← BACK
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* Recipe image */}
              <img
                src={selected.strMealThumb}
                alt={selected.strMeal}
                style={{ width: '100%', borderRadius: '4px', objectFit: 'cover', maxHeight: '280px' }}
              />

              {/* Safety verdict */}
              <div>
                {verdicts.safetyVerdict && (
                  <div style={{ padding: '16px 20px', background: verdicts.safetyVerdict === 'Safe' ? 'rgba(93,187,99,0.15)' : verdicts.safetyVerdict === 'Caution' ? 'rgba(240,192,64,0.15)' : 'rgba(255,107,107,0.15)', border: `1px solid ${verdictColor(verdicts.safetyVerdict)}40`, borderRadius: '4px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '24px', color: verdictColor(verdicts.safetyVerdict) }}>
                        {verdicts.safetyVerdict === 'Safe' ? '✓' : verdicts.safetyVerdict === 'Caution' ? '⚠' : '✗'}
                      </span>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: verdictColor(verdicts.safetyVerdict), letterSpacing: '1px' }}>
                          {verdicts.safetyVerdict?.toUpperCase()}
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                          For your health profile
                        </div>
                      </div>
                    </div>
                    {verdicts.flaggedIngredients?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {verdicts.flaggedIngredients.map((ing, i) => (
                          <span key={i} style={{ padding: '3px 10px', background: 'rgba(255,107,107,0.2)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '2px', color: '#ff9999', fontSize: '11px' }}>
                            {ing}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Instructions preview */}
                {selected.strInstructions && (
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '8px' }}>INSTRUCTIONS</div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', lineHeight: '1.8', fontStyle: 'italic', margin: 0, maxHeight: '160px', overflow: 'hidden' }}>
                      {selected.strInstructions.substring(0, 400)}...
                    </p>
                    {selected.strYoutube && (
                      <a href={selected.strYoutube} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '10px', color: '#e8c49a', fontSize: '12px', letterSpacing: '1px', textDecoration: 'none' }}>
                        ▶ Watch on YouTube
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Grocery list */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
                  GROCERY LIST — {groceryList.length} INGREDIENTS
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={saveGroceryList}
                    disabled={savingList || listSaved}
                    style={{ background: listSaved ? 'rgba(93,187,99,0.3)' : 'rgba(232,196,154,0.2)', border: listSaved ? '1px solid rgba(93,187,99,0.5)' : '1px solid rgba(232,196,154,0.4)', borderRadius: '2px', color: listSaved ? '#7dd97f' : '#e8c49a', padding: '6px 16px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px' }}
                  >
                    {listSaved ? '✓ SAVED!' : savingList ? 'SAVING...' : '+ SAVE LIST'}
                  </button>
                  <button
                    onClick={() => setCheckedItems({})}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '2px', color: 'rgba(255,255,255,0.4)', padding: '6px 14px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px' }}
                  >
                    CLEAR CHECKS
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {groceryList.map(item => {
                  const isFlagged = verdicts.flaggedIngredients?.some(f =>
                    item.ingredient.toLowerCase().includes(f.toLowerCase())
                  );
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 14px',
                        background: checkedItems[item.id] ? 'rgba(93,187,99,0.1)' : isFlagged ? 'rgba(255,107,107,0.1)' : 'rgba(255,255,255,0.04)',
                        border: isFlagged ? '1px solid rgba(255,107,107,0.3)' : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '4px', cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '2px',
                        border: `1px solid ${checkedItems[item.id] ? '#7dd97f' : 'rgba(255,255,255,0.3)'}`,
                        background: checkedItems[item.id] ? 'rgba(93,187,99,0.4)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, fontSize: '12px', color: '#7dd97f',
                      }}>
                        {checkedItems[item.id] ? '✓' : ''}
                      </div>
                      <div style={{ flex: 1 }}>
                        <span style={{
                          color: checkedItems[item.id] ? 'rgba(255,255,255,0.3)' : isFlagged ? '#ff9999' : '#ffffff',
                          fontSize: '13px',
                          textDecoration: checkedItems[item.id] ? 'line-through' : 'none',
                        }}>
                          {item.ingredient}
                        </span>
                        {item.measure && (
                          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', marginLeft: '8px', fontStyle: 'italic' }}>
                            {item.measure}
                          </span>
                        )}
                      </div>
                      {isFlagged && <span style={{ fontSize: '12px' }}>⚠</span>}
                    </div>
                  );
                })}
              </div>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontStyle: 'italic', marginTop: '12px' }}>
                Click items to check them off as you shop. Red items are flagged by your health profile.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}