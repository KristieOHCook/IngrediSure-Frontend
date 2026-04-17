import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingScreen from './LoadingScreen';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const BG = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=90';

const SERVICES = [
  {
    id: 1, name: 'Green Chef', tagline: 'USDA Certified Organic Meal Kits',
    description: 'Specializes in organic, non-GMO ingredients with plans for keto, paleo, and plant-based diets.',
   website: 'https://www.greenchef.com', orderUrl: 'https://www.greenchef.com/plans', affiliateNote: 'Up to $250 off + free shipping on first box', priceRange: '$11-13/serving', rating: 4.7,
    dietaryOptions: ['Keto', 'Paleo', 'Vegan', 'Gluten Free', 'Mediterranean'],
    badge: 'ORGANIC', badgeColor: '#7dd97f',
    menu: [
      { name: 'Lemon Herb Salmon', ingredients: 'salmon, lemon, dill, olive oil, asparagus, garlic, herbs' },
      { name: 'Keto Beef Bowl', ingredients: 'grass-fed beef, cauliflower rice, avocado, cheese, sour cream' },
      { name: 'Vegan Buddha Bowl', ingredients: 'chickpeas, quinoa, kale, tahini, roasted vegetables, seeds' },
      { name: 'Paleo Chicken Thighs', ingredients: 'chicken, sweet potato, brussels sprouts, olive oil, herbs' },
    ]
  },
  {
    id: 2, name: 'Sun Basket', tagline: 'Clean Ingredients, Chef-Crafted Recipes',
    description: 'Focuses on clean eating with organic produce and antibiotic-free proteins. Great for medical dietary needs.',
    website: 'https://www.sunbasket.com', orderUrl: 'https://www.sunbasket.com/menu', affiliateNote: 'Get $80 off your first 4 boxes', priceRange: '$10-15/serving', rating: 4.6,
    dietaryOptions: ['Diabetes-Friendly', 'Heart Healthy', 'Low Calorie', 'Gluten Free', 'Paleo'],
    badge: 'CLEAN EATING', badgeColor: '#e8c49a',
    menu: [
      { name: 'Mediterranean Cod', ingredients: 'cod, tomatoes, olives, capers, olive oil, herbs, lemon' },
      { name: 'Turkey Taco Bowls', ingredients: 'ground turkey, black beans, corn, salsa, avocado, lime' },
      { name: 'Veggie Stir Fry', ingredients: 'tofu, broccoli, snap peas, soy sauce, ginger, sesame oil, rice' },
      { name: 'Chicken Marsala', ingredients: 'chicken breast, mushrooms, marsala wine, garlic, thyme, pasta' },
    ]
  },
  {
    id: 3, name: 'Factor', tagline: 'Chef-Prepared, Ready to Eat',
    description: 'Fresh, never frozen chef-prepared meals delivered weekly. Ideal for people managing chronic conditions.',
    website: 'https://www.factor75.com', orderUrl: 'https://www.factor75.com/plans', affiliateNote: '50% off your first box', priceRange: '$11-15/meal', rating: 4.8,
    dietaryOptions: ['Keto', 'Calorie Smart', 'Vegan', 'Protein Plus', 'Flexitarian'],
    badge: 'READY TO EAT', badgeColor: '#74b9ff',
    menu: [
      { name: 'Balsamic Glazed Chicken', ingredients: 'chicken breast, balsamic, roasted vegetables, olive oil, herbs' },
      { name: 'Salmon with Pesto', ingredients: 'salmon, pesto, zucchini noodles, cherry tomatoes, pine nuts' },
      { name: 'Turkey Meatloaf', ingredients: 'ground turkey, onion, garlic, egg, tomato sauce, herbs' },
      { name: 'Shrimp Scampi', ingredients: 'shrimp, garlic, white wine, lemon, butter, zucchini noodles' },
    ]
  },
  {
    id: 4, name: 'Trifecta Nutrition', tagline: 'USDA Organic Meal Prep for Health Goals',
    description: 'Macro-balanced meals designed by nutritionists. Perfect for diabetes, heart disease, and weight management.',
    website: 'https://www.trifectanutrition.com', orderUrl: 'https://www.trifectanutrition.com/meal-prep', affiliateNote: '40% off your first week', priceRange: '$13-18/meal', rating: 4.5,
    dietaryOptions: ['Paleo', 'Keto', 'Clean', 'Vegan', 'High Protein', 'Low Carb'],
    badge: 'NUTRITIONIST DESIGNED', badgeColor: '#ff6b6b',
    menu: [
      { name: 'Grass-Fed Beef & Rice', ingredients: 'grass-fed beef, brown rice, broccoli, olive oil, sea salt' },
      { name: 'Wild Salmon & Quinoa', ingredients: 'wild salmon, quinoa, asparagus, lemon, dill, olive oil' },
      { name: 'Chicken & Sweet Potato', ingredients: 'chicken breast, sweet potato, green beans, olive oil, herbs' },
      { name: 'Vegan Lentil Bowl', ingredients: 'lentils, brown rice, kale, turmeric, cumin, vegetable broth' },
    ]
  },
  {
    id: 5, name: 'Snap Kitchen', tagline: 'Real Food, Real Fast',
    description: 'Dietitian-approved meals with clear nutrition labels. Specializes in managing diabetes and heart conditions.',
    website: 'https://www.snapkitchen.com', priceRange: '$9-13/meal', rating: 4.4,
    dietaryOptions: ['Balanced', 'High Protein', 'Low Carb', 'Diabetes Friendly', 'Heart Healthy'],
    badge: 'DIETITIAN APPROVED', badgeColor: '#a29bfe',
    menu: [
      { name: 'Turkey & Veggie Bowl', ingredients: 'turkey, brown rice, roasted vegetables, olive oil, herbs' },
      { name: 'Egg White Frittata', ingredients: 'egg whites, spinach, mushrooms, bell pepper, feta, herbs' },
      { name: 'Chicken Tikka Masala', ingredients: 'chicken, tomato sauce, coconut milk, turmeric, cumin, brown rice' },
      { name: 'Beef & Broccoli', ingredients: 'lean beef, broccoli, soy sauce, ginger, garlic, sesame seeds' },
    ]
  },
  {
    id: 6, name: 'Purple Carrot', tagline: 'Plant-Based Meal Kits',
    description: '100% plant-based meal kits with creative recipes. Ideal for vegan, vegetarian and heart-healthy diets.',
    website: 'https://www.purplecarrot.com', priceRange: '$9-11/serving', rating: 4.5,
    dietaryOptions: ['Vegan', 'Vegetarian', 'High Protein', 'Heart Healthy', 'Low Calorie'],
    badge: 'PLANT BASED', badgeColor: '#7dd97f',
    menu: [
      { name: 'Mushroom Risotto', ingredients: 'arborio rice, mushrooms, vegetable broth, nutritional yeast, herbs' },
      { name: 'Lentil Tacos', ingredients: 'lentils, corn tortilla, cabbage, salsa, avocado, lime, cilantro' },
      { name: 'Cauliflower Curry', ingredients: 'cauliflower, chickpeas, coconut milk, turmeric, cumin, rice' },
      { name: 'Black Bean Burgers', ingredients: 'black beans, quinoa, onion, garlic, cumin, whole wheat bun' },
    ]
  },
];

export default function MealPrepServices() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState(null);
  const [menuVerdicts, setMenuVerdicts] = useState({});
  const [loadingVerdicts, setLoadingVerdicts] = useState(false);
  const [filterDiet, setFilterDiet] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [searched, setSearched] = useState(false);

  const ALL_DIETS = [...new Set(SERVICES.flatMap(s => s.dietaryOptions))].sort();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/'); return; }
    const parsed = JSON.parse(stored);
    if (!parsed?.token) { navigate('/'); return; }
    setUser(parsed);
  }, [navigate]);

  const handleSearch = () => {
    if (!zipCode.trim()) return;
    setSearched(true);
    setSelected(null);
    setMenuVerdicts({});
  };

  const selectService = async (service) => {
    setSelected(service);
    setMenuVerdicts({});
    setLoadingVerdicts(true);
    const headers = { Authorization: `Bearer ${user.token}` };
    const verdicts = {};
    for (const item of service.menu) {
      try {
        const res = await axios.post(`${API}/menu`, {
          itemName: item.name,
          ingredients: item.ingredients,
          sodiumLevel: 0,
          restaurantName: service.name,
          dietCategory: 'Meal Prep',
        }, { headers });
        verdicts[item.name] = res.data;
      } catch (err) {
        verdicts[item.name] = { safetyVerdict: 'Unknown', flaggedIngredients: [] };
      }
    }
    setMenuVerdicts(verdicts);
    setLoadingVerdicts(false);
  };

  const filteredServices = SERVICES.filter(s =>
    !filterDiet || s.dietaryOptions.includes(filterDiet)
  );

  const verdictColor = (v) => {
    if (v === 'Safe') return '#7dd97f';
    if (v === 'Caution') return '#f0c040';
    if (v === 'Unsafe') return '#ff6b6b';
    return 'rgba(255,255,255,0.4)';
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
    borderRadius: '4px', padding: '28px 32px',
    marginBottom: '20px',
  };

  const inputStyle = {
    width: '100%', padding: '14px 18px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '4px', color: '#ffffff',
    fontFamily: 'Georgia, serif', fontSize: '15px',
    outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div className="page-enter" style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.65) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '6px' }}>INGREDISURE</div>
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '400', color: '#ffffff', letterSpacing: '1px' }}>Meal Prep Services</h1>
            <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontStyle: 'italic' }}>
              Health-focused delivery services catering to your dietary restrictions
            </p>
          </div>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 24px', borderRadius: '2px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px' }}>
            ← DASHBOARD
          </button>
        </div>

        {/* Search + Filter */}
        <div style={sectionStyle}>
          <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>FIND SERVICES</h2>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
            Enter your ZIP code to see meal prep delivery services in your area
          </p>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Enter your ZIP code..."
              value={zipCode}
              onChange={e => setZipCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button onClick={handleSearch} style={{ padding: '14px 28px', background: 'rgba(74,159,212,0.3)', border: '1px solid rgba(74,159,212,0.5)', color: 'rgba(120,180,240,1)', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
              SEARCH
            </button>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '10px' }}>FILTER BY DIETARY NEED</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button onClick={() => setFilterDiet('')} style={{ padding: '6px 14px', background: !filterDiet ? 'rgba(232,196,154,0.2)' : 'rgba(255,255,255,0.04)', border: !filterDiet ? '1px solid rgba(232,196,154,0.5)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '2px', color: !filterDiet ? '#e8c49a' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px' }}>ALL</button>
              {ALL_DIETS.map(diet => (
                <button key={diet} onClick={() => setFilterDiet(diet)} style={{ padding: '6px 14px', background: filterDiet === diet ? 'rgba(232,196,154,0.2)' : 'rgba(255,255,255,0.04)', border: filterDiet === diet ? '1px solid rgba(232,196,154,0.5)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '2px', color: filterDiet === diet ? '#e8c49a' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px' }}>
                  {diet}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured services grid */}
        {!selected && !searched && !filterDiet && (
          <div style={sectionStyle}>
            <h2 style={{ margin: '0 0 20px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
              FEATURED SERVICES — {SERVICES.length} AVAILABLE
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {SERVICES.map(service => (
                <div key={service.id} onClick={() => selectService(service)}
                  style={{ padding: '20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '400', color: '#ffffff' }}>{service.name}</h3>
                    <span style={{ fontSize: '9px', padding: '2px 8px', border: `1px solid ${service.badgeColor}60`, color: service.badgeColor, borderRadius: '2px', letterSpacing: '1px', flexShrink: 0, marginLeft: '8px' }}>{service.badge}</span>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '12px', fontStyle: 'italic', marginBottom: '8px' }}>{service.tagline}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: '#e8c49a', fontSize: '12px' }}>{service.priceRange}</div>
                    <div style={{ color: '#7dd97f', fontSize: '13px' }}>★ {service.rating}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filtered/searched services list */}
        {!selected && (searched || filterDiet) && (
          <div style={sectionStyle}>
            <h2 style={{ margin: '0 0 20px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
              {searched ? `SERVICES DELIVERING TO ${zipCode}` : 'FILTERED SERVICES'} — {filteredServices.length} FOUND
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {filteredServices.map(service => (
                <div key={service.id} onClick={() => selectService(service)}
                  style={{ padding: '24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '400', color: '#ffffff' }}>{service.name}</h3>
                        <span style={{ fontSize: '10px', padding: '3px 10px', border: `1px solid ${service.badgeColor}60`, color: service.badgeColor, borderRadius: '2px', letterSpacing: '1px' }}>{service.badge}</span>
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontStyle: 'italic', marginBottom: '10px' }}>{service.tagline}</div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', marginBottom: '12px', lineHeight: '1.6' }}>{service.description}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {service.dietaryOptions.map(opt => (
                          <span key={opt} style={{ fontSize: '11px', padding: '3px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '2px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' }}>{opt}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', marginLeft: '20px', flexShrink: 0 }}>
                      <div style={{ color: '#7dd97f', fontSize: '16px', marginBottom: '4px' }}>★ {service.rating}</div>
                      <div style={{ color: '#e8c49a', fontSize: '13px', marginBottom: '12px' }}>{service.priceRange}</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>VIEW MENU ›</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected service */}
        {selected && (
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                  <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '400', color: '#ffffff' }}>{selected.name}</h2>
                  <span style={{ fontSize: '10px', padding: '3px 10px', border: `1px solid ${selected.badgeColor}60`, color: selected.badgeColor, borderRadius: '2px', letterSpacing: '1px' }}>{selected.badge}</span>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontStyle: 'italic', marginBottom: '8px' }}>{selected.tagline}</div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span style={{ color: '#e8c49a', fontSize: '13px' }}>{selected.priceRange}</span>
                  <span style={{ color: '#7dd97f', fontSize: '13px' }}>★ {selected.rating}</span>
                  {selected.affiliateNote && (
                    <span style={{ padding: '3px 10px', background: 'rgba(93,187,99,0.2)', border: '1px solid rgba(93,187,99,0.4)', borderRadius: '2px', color: '#7dd97f', fontSize: '11px', letterSpacing: '0.5px' }}>
                      🎁 {selected.affiliateNote}
                    </span>
                  )}
                  <span
                    onClick={() => window.open(selected.website, '_blank')}
                    style={{ color: '#74b9ff', fontSize: '13px', cursor: 'pointer', letterSpacing: '1px' }}
                  >
                    VISIT WEBSITE ›
                  </span>
                </div>
              </div>
              <button onClick={() => { setSelected(null); setMenuVerdicts({}); }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', padding: '6px 16px', borderRadius: '2px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px' }}>
                ← BACK
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {selected.dietaryOptions.map(opt => (
                <span key={opt} style={{ fontSize: '11px', padding: '4px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '2px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.5px' }}>{opt}</span>
              ))}
            </div>

            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '3px', marginBottom: '8px' }}>SAMPLE MENU — SAFETY ANALYSIS</div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', marginBottom: '16px' }}>Each meal is checked against your personal health profile</p>

            {loadingVerdicts && (
              <div style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.6)', letterSpacing: '2px', fontSize: '13px' }}>ANALYZING MENU...</div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selected.menu.map((item, i) => {
                const v = menuVerdicts[item.name];
                const verdict = v?.safetyVerdict;
                return (
                  <div key={i} style={{ padding: '20px 24px', background: verdict === 'Safe' ? 'rgba(93,187,99,0.1)' : verdict === 'Caution' ? 'rgba(240,192,64,0.1)' : verdict === 'Unsafe' ? 'rgba(255,107,107,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${verdict ? verdictColor(verdict) + '30' : 'rgba(255,255,255,0.06)'}`, borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ color: '#ffffff', fontSize: '16px' }}>{item.name}</div>
                      {verdict && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '18px', color: verdictColor(verdict) }}>{verdictIcon(verdict)}</span>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: verdictColor(verdict), letterSpacing: '1px' }}>{verdict?.toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontStyle: 'italic', marginBottom: v?.flaggedIngredients?.length > 0 ? '10px' : '0' }}>{item.ingredients}</div>
                    {v?.flaggedIngredients?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {v.flaggedIngredients.map((ing, j) => (
                          <span key={j} style={{ padding: '3px 10px', background: 'rgba(255,107,107,0.2)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '2px', color: '#ff9999', fontSize: '11px' }}>{ing}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!loadingVerdicts && Object.keys(menuVerdicts).length > 0 && (
              <div style={{ display: 'flex', gap: '20px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ color: '#7dd97f', fontSize: '12px', letterSpacing: '1px' }}>✓ SAFE</span>
                <span style={{ color: '#f0c040', fontSize: '12px', letterSpacing: '1px' }}>⚠ CAUTION</span>
                <span style={{ color: '#ff6b6b', fontSize: '12px', letterSpacing: '1px' }}>✗ UNSAFE</span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontStyle: 'italic', marginLeft: 'auto' }}>Based on your health profile</span>
                <span
                  onClick={() => window.open(selected.website, '_blank')}
                  style={{ padding: '10px 20px', background: 'rgba(232,196,154,0.15)', border: '1px solid rgba(232,196,154,0.4)', borderRadius: '2px', color: '#e8c49a', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px', cursor: 'pointer' }}
                >
                  ORDER NOW ›
                </span>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}