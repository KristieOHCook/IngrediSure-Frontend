import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingScreen from './LoadingScreen';

const API = 'http://localhost:8080/api';
const BG = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=90';

const SAMPLE_RESTAURANTS = [
  {
    id: 1, name: 'The Garden Table', cuisine: 'Farm-to-Table', rating: 4.8,
    address: 'Downtown', priceRange: '$$$',
    menu: [
      { name: 'Grilled Salmon', ingredients: 'salmon, lemon, olive oil, garlic, herbs, butter' },
      { name: 'Quinoa Bowl', ingredients: 'quinoa, kale, avocado, cherry tomatoes, tahini, lemon' },
      { name: 'Mushroom Risotto', ingredients: 'arborio rice, mushrooms, parmesan, butter, white wine, onion, garlic' },
      { name: 'Caesar Salad', ingredients: 'romaine lettuce, croutons, parmesan, caesar dressing, anchovies, egg' },
    ]
  },
  {
    id: 2, name: 'Sakura Japanese Bistro', cuisine: 'Japanese', rating: 4.6,
    address: 'Midtown', priceRange: '$$$',
    menu: [
      { name: 'Salmon Sashimi', ingredients: 'fresh salmon, soy sauce, wasabi, ginger, rice' },
      { name: 'Vegetable Tempura', ingredients: 'sweet potato, broccoli, zucchini, tempura batter, soy sauce, dashi' },
      { name: 'Miso Ramen', ingredients: 'ramen noodles, miso paste, tofu, nori, scallions, soy sauce, sodium' },
      { name: 'Chicken Teriyaki', ingredients: 'chicken, teriyaki sauce, soy sauce, sugar, mirin, sesame seeds, rice' },
    ]
  },
  {
    id: 3, name: 'Mediterranean House', cuisine: 'Mediterranean', rating: 4.7,
    address: 'Westside', priceRange: '$$',
    menu: [
      { name: 'Hummus Platter', ingredients: 'chickpeas, tahini, olive oil, lemon, garlic, paprika, pita bread' },
      { name: 'Grilled Lamb Chops', ingredients: 'lamb, olive oil, rosemary, garlic, lemon, herbs, salt' },
      { name: 'Greek Salad', ingredients: 'cucumber, tomato, olives, feta cheese, red onion, olive oil, oregano' },
      { name: 'Falafel Wrap', ingredients: 'chickpeas, herbs, flour, cumin, coriander, pita, tahini, vegetables' },
    ]
  },
  {
    id: 4, name: 'Burger Republic', cuisine: 'American', rating: 4.3,
    address: 'Eastside', priceRange: '$$',
    menu: [
      { name: 'Classic Cheeseburger', ingredients: 'beef patty, cheddar cheese, lettuce, tomato, onion, pickles, ketchup, mustard, brioche bun, sodium' },
      { name: 'Bacon BBQ Burger', ingredients: 'beef patty, bacon, bbq sauce, cheddar cheese, onion rings, high fructose corn syrup, sodium, saturated fat' },
      { name: 'Veggie Burger', ingredients: 'black bean patty, lettuce, tomato, avocado, whole wheat bun, mustard' },
      { name: 'Sweet Potato Fries', ingredients: 'sweet potato, vegetable oil, sea salt, paprika' },
    ]
  },
  {
    id: 5, name: 'Bella Italia', cuisine: 'Italian', rating: 4.5,
    address: 'Northside', priceRange: '$$$',
    menu: [
      { name: 'Margherita Pizza', ingredients: 'pizza dough, tomato sauce, fresh mozzarella, basil, olive oil' },
      { name: 'Pasta Carbonara', ingredients: 'spaghetti, eggs, pecorino romano, guanciale, black pepper, salt' },
      { name: 'Tiramisu', ingredients: 'mascarpone, espresso, ladyfingers, sugar, eggs, cocoa, marsala wine' },
      { name: 'Chicken Parmigiana', ingredients: 'chicken breast, breadcrumbs, marinara sauce, mozzarella, parmesan, wheat flour' },
    ]
  },
  {
    id: 6, name: 'Green Leaf Cafe', cuisine: 'Vegan', rating: 4.9,
    address: 'Uptown', priceRange: '$$',
    menu: [
      { name: 'Acai Bowl', ingredients: 'acai, banana, blueberries, granola, coconut, agave, almond milk' },
      { name: 'Buddha Bowl', ingredients: 'brown rice, chickpeas, roasted vegetables, tahini, kale, avocado, seeds' },
      { name: 'Lentil Soup', ingredients: 'red lentils, tomatoes, cumin, turmeric, onion, garlic, vegetable broth' },
      { name: 'Smoothie Bowl', ingredients: 'mango, pineapple, spinach, coconut milk, chia seeds, fresh fruit' },
    ]
  },
];

export default function RestaurantFinder() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [zipCode, setZipCode] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [selected, setSelected] = useState(null);
  const [menuVerdicts, setMenuVerdicts] = useState({});
  const [loadingVerdicts, setLoadingVerdicts] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/'); return; }
    const parsed = JSON.parse(stored);
    if (!parsed?.token) { navigate('/'); return; }
    setUser(parsed);
  }, [navigate]);

  const searchRestaurants = () => {
    if (!zipCode.trim()) return;
    // Shuffle restaurants slightly based on zip for variety
    const shuffled = [...SAMPLE_RESTAURANTS].sort(() => Math.random() - 0.3);
    setRestaurants(shuffled);
    setSearched(true);
    setSelected(null);
    setMenuVerdicts({});
  };

  const selectRestaurant = async (restaurant) => {
    setSelected(restaurant);
    setMenuVerdicts({});
    setLoadingVerdicts(true);

    const headers = { Authorization: `Bearer ${user.token}` };
    const verdicts = {};

    for (const item of restaurant.menu) {
      try {
        const res = await axios.post(`${API}/menu`, {
          itemName: item.name,
          ingredients: item.ingredients,
          sodiumLevel: 0,
          potassiumLevel: 0,
          sugarLevel: 0,
          restaurantName: restaurant.name,
          dietCategory: restaurant.cuisine,
        }, { headers });
        verdicts[item.name] = res.data;
      } catch (err) {
        verdicts[item.name] = { safetyVerdict: 'Unknown', flaggedIngredients: [] };
      }
    }

    setMenuVerdicts(verdicts);
    setLoadingVerdicts(false);
  };

  const verdictColor = (v) => {
    if (v === 'Safe') return '#7dd97f';
    if (v === 'Caution') return '#f0c040';
    if (v === 'Unsafe') return '#ff6b6b';
    return 'rgba(255,255,255,0.4)';
  };

  const verdictBg = (v) => {
    if (v === 'Safe') return 'rgba(93,187,99,0.15)';
    if (v === 'Caution') return 'rgba(240,192,64,0.15)';
    if (v === 'Unsafe') return 'rgba(255,107,107,0.15)';
    return 'rgba(255,255,255,0.05)';
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

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', letterSpacing: '3px', marginBottom: '6px' }}>INGREDISURE</div>
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '400', color: '#ffffff', letterSpacing: '1px' }}>Restaurant Finder</h1>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 24px', borderRadius: '2px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px' }}
          >
            ← DASHBOARD
          </button>
        </div>

        {/* Search */}
        <div style={sectionStyle}>
          <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.9)', letterSpacing: '3px' }}>
            FIND RESTAURANTS
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.85)', fontStyle: 'italic' }}>
            Enter your ZIP code to discover safe dining options near you
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="Enter ZIP code..."
              value={zipCode}
              onChange={e => setZipCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchRestaurants()}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={searchRestaurants}
              style={{ padding: '14px 28px', background: 'rgba(74,159,212,0.3)', border: '1px solid rgba(74,159,212,0.5)', color: 'rgba(120,180,240,1)', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '1px', whiteSpace: 'nowrap' }}
            >
              SEARCH
            </button>
          </div>
        </div>

        {/* Restaurant list */}
        {searched && !selected && (
          <div style={sectionStyle}>
            <h2 style={{ margin: '0 0 20px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.9)', letterSpacing: '3px' }}>
              RESTAURANTS NEAR {zipCode}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {restaurants.map(r => (
                <div
                  key={r.id}
                  onClick={() => selectRestaurant(r)}
                  style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  <div>
                    <div style={{ color: '#ffffff', fontSize: '17px', marginBottom: '6px', fontWeight: '400' }}>{r.name}</div>
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px', fontStyle: 'italic' }}>{r.cuisine}</span>
                      <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>{r.address}</span>
                      <span style={{ color: '#e8c49a', fontSize: '12px' }}>{r.priceRange}</span>
                      <span style={{ color: '#7dd97f', fontSize: '12px' }}>★ {r.rating}</span>
                    </div>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px' }}>›</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected restaurant menu */}
        {selected && (
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: '24px', fontWeight: '400', color: '#ffffff' }}>{selected.name}</h2>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontStyle: 'italic' }}>{selected.cuisine}</span>
                  <span style={{ color: '#e8c49a', fontSize: '13px' }}>{selected.priceRange}</span>
                  <span style={{ color: '#7dd97f', fontSize: '13px' }}>★ {selected.rating}</span>
                </div>
              </div>
              <button
                onClick={() => { setSelected(null); setMenuVerdicts({}); }}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.9)', padding: '6px 16px', borderRadius: '2px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px' }}
              >
                ← BACK
              </button>
            </div>

            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', letterSpacing: '3px', marginBottom: '16px' }}>
              MENU — SAFETY ANALYSIS
            </div>

            {loadingVerdicts && (
              <div style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.9)', letterSpacing: '2px', fontSize: '13px' }}>
                ANALYZING MENU ITEMS...
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selected.menu.map((item, i) => {
                const v = menuVerdicts[item.name];
                return (
                  <div key={i} style={{ padding: '20px 24px', background: v ? verdictBg(v.safetyVerdict) : 'rgba(255,255,255,0.04)', border: `1px solid ${v ? verdictColor(v.safetyVerdict) + '40' : 'rgba(255,255,255,0.08)'}`, borderRadius: '4px', transition: 'all 0.3s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: v?.flaggedIngredients?.length > 0 ? '12px' : '0' }}>
                      <div>
                        <div style={{ color: '#ffffff', fontSize: '16px', marginBottom: '4px' }}>{item.name}</div>
                        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontStyle: 'italic' }}>{item.ingredients}</div>
                      </div>
                      {v && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '16px' }}>
                          <span style={{ fontSize: '20px', color: verdictColor(v.safetyVerdict) }}>{verdictIcon(v.safetyVerdict)}</span>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: verdictColor(v.safetyVerdict), letterSpacing: '1px' }}>{v.safetyVerdict?.toUpperCase()}</span>
                        </div>
                      )}
                      {!v && !loadingVerdicts && (
                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>—</div>
                      )}
                    </div>

                    {v?.flaggedIngredients?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                        {v.flaggedIngredients.map((ing, j) => (
                          <span key={j} style={{ padding: '3px 10px', background: 'rgba(255,107,107,0.2)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '2px', color: '#ff9999', fontSize: '11px' }}>
                            {ing}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            {!loadingVerdicts && Object.keys(menuVerdicts).length > 0 && (
              <div style={{ display: 'flex', gap: '20px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ color: '#7dd97f', fontSize: '12px', letterSpacing: '1px' }}>✓ SAFE</span>
                <span style={{ color: '#f0c040', fontSize: '12px', letterSpacing: '1px' }}>⚠ CAUTION</span>
                <span style={{ color: '#ff6b6b', fontSize: '12px', letterSpacing: '1px' }}>✗ UNSAFE</span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontStyle: 'italic', marginLeft: 'auto' }}>Based on your health profile</span>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}