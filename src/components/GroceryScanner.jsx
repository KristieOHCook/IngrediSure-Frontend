import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from './Toast';
import LoadingScreen from './LoadingScreen';
import ReadAloudButton from './ReadAloudButton';
import { useAccessibility } from '../AccessibilityContext';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const BG = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=90';

const getAlternatives = (productName, flaggedIngredients) => {
  const name = (productName || '').toLowerCase();
  const flags = (flaggedIngredients || []).map(f => f.toLowerCase());
  const alternatives = [];

  if (name.includes('cookie') || name.includes('oreo') || name.includes('biscuit')) {
    alternatives.push('gluten free cookies', 'oat cookies no sugar', 'almond flour cookies');
  } else if (name.includes('milk') || name.includes('dairy')) {
    alternatives.push('oat milk', 'almond milk unsweetened', 'coconut milk');
  } else if (name.includes('bread')) {
    alternatives.push('whole grain bread', 'gluten free bread', 'sourdough bread');
  } else if (name.includes('chip') || name.includes('snack') || name.includes('crisp')) {
    alternatives.push('baked chips low sodium', 'rice cakes unsalted', 'veggie chips');
  } else if (name.includes('yogurt') || name.includes('yoghurt')) {
    alternatives.push('plain greek yogurt', 'dairy free yogurt', 'low sugar yogurt');
  } else if (name.includes('juice') || name.includes('drink') || name.includes('soda')) {
    alternatives.push('sparkling water no sugar', 'unsweetened green tea', 'coconut water');
  } else if (name.includes('cereal')) {
    alternatives.push('oatmeal no sugar added', 'granola low sugar', 'bran flakes');
  } else if (name.includes('cheese')) {
    alternatives.push('low fat cheese', 'dairy free cheese', 'cottage cheese low sodium');
  } else if (name.includes('soup') || name.includes('broth')) {
    alternatives.push('low sodium soup', 'homemade broth', 'unsalted vegetable broth');
  } else if (name.includes('cola') || name.includes('soda') || name.includes('coke')) {
    alternatives.push('sparkling water', 'unsweetened tea', 'flavored water no sugar');
  } else {
    if (flags.some(f => f.includes('sugar') || f.includes('syrup'))) {
      alternatives.push('no sugar added version');
    }
    if (flags.some(f => f.includes('sodium') || f.includes('salt'))) {
      alternatives.push('low sodium version');
    }
    if (flags.some(f => f.includes('gluten') || f.includes('wheat'))) {
      alternatives.push('gluten free version');
    }
    if (alternatives.length === 0) {
      alternatives.push('organic alternative', 'low sodium alternative', 'sugar free alternative');
    }
  }
  return alternatives.slice(0, 3);
};

export default function GroceryScanner() {
  const navigate = useNavigate();
  const { t, simpleMode, highContrast, fontSize } = useAccessibility();
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/'); return; }
    const parsed = JSON.parse(stored);
    if (!parsed?.token) { navigate('/'); return; }
    setUser(parsed);
  }, [navigate]);

  const searchProducts = async () => {
    const q = query.trim().toLowerCase();
    if (!q) return;
    setSearching(true);
    setResults([]);
    setSelected(null);
    setVerdict(null);
    setNoResults(false);
    try {
      const res = await axios.get(
        `${API}/food-search?query=${encodeURIComponent(q)}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const products = (res.data.products || []).filter(p => p.product_name);
      setResults(products);
      if (products.length === 0) setNoResults(true);
    } catch (err) {
      console.error('Search error:', err);
      setNoResults(true);
    }
    setSearching(false);
  };

  const checkProduct = async (product) => {
    setSelected(product);
    setVerdict(null);
    setLoading(true);
    const ingredients = (product.ingredients_text || product.ingredients_text_en || 'not available').substring(0, 2000);
    const productName = (product.product_name || 'Unknown Product').substring(0, 100);
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      const res = await axios.post(`${API}/menu`, {
        name: productName,
        ingredients: ingredients,
        calories: product.nutriments?.energy_kcal_100g || 0,
        sodium: product.nutriments?.sodium_100g
          ? product.nutriments.sodium_100g * 1000
          : 0,
        category: 'Grocery',
      }, { headers });
      setVerdict(res.data);
    } catch (err) {
      console.error('Check error:', err);
      setVerdict({ safetyVerdict: 'Error', flaggedIngredients: [] });
    }
    setLoading(false);
  };

  const verdictColor = (v) => {
    if (v === 'Safe') return '#7dd97f';
    if (v === 'Caution') return '#f0c040';
    if (v === 'Unsafe') return '#ff6b6b';
    return '#aaaaaa';
  };

  const verdictBg = (v) => {
    if (v === 'Safe') return 'rgba(93,187,99,0.2)';
    if (v === 'Caution') return 'rgba(240,192,64,0.2)';
    if (v === 'Unsafe') return 'rgba(255,107,107,0.2)';
    return 'rgba(255,255,255,0.08)';
  };

  const verdictIcon = (v) => {
    if (v === 'Safe') return '✓';
    if (v === 'Caution') return '⚠';
    if (v === 'Unsafe') return '✗';
    return '?';
  };

  const inputStyle = {
    width: '100%', padding: '14px 18px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '4px', color: '#ffffff',
    fontFamily: 'Georgia, serif', fontSize: '15px',
    outline: 'none', boxSizing: 'border-box',
  };

  const sectionStyle = {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '4px', padding: '28px 32px',
    marginBottom: '20px',
  };

  return (
    <div className="page-enter" style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.65) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '6px' }}>INGREDISURE</div>
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '400', color: '#ffffff', letterSpacing: '1px' }}>Grocery Scanner</h1>
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

        {/* Search */}
        <div style={sectionStyle}>
          <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
            SEARCH PRODUCTS
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
            Search any grocery product to check its ingredients against your health profile
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="e.g. Oreo cookies, Greek yogurt, Campbell soup..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchProducts()}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={searchProducts}
              disabled={searching}
              style={{ padding: '14px 28px', background: 'rgba(255,107,53,0.3)', border: '1px solid rgba(255,107,53,0.5)', color: 'rgba(255,150,100,1)', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '1px', whiteSpace: 'nowrap' }}
            >
              {searching ? 'SEARCHING...' : 'SEARCH'}
            </button>
          </div>
        </div>

        {/* Results list */}
        {results.length > 0 && !selected && (
          <div style={sectionStyle}>
            <h2 style={{ margin: '0 0 20px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
              RESULTS — {results.length} PRODUCTS FOUND
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {results.map((p, i) => (
                <div
                  key={i}
                  onClick={() => checkProduct(p)}
                  style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >
                  <div>
                    <div style={{ color: '#ffffff', fontSize: '15px', marginBottom: '4px' }}>{p.product_name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontStyle: 'italic' }}>
                      {p.brands || 'Unknown brand'} · {p.quantity || ''}
                    </div>
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '18px' }}>›</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No results */}
        {noResults && (
          <div style={{ ...sectionStyle, textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
            No products found for "{query}". Try a different search term.
          </div>
        )}

        {/* Selected product + verdict */}
        {selected && (
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '400', color: '#ffffff' }}>
                  {selected.product_name}
                </h2>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontStyle: 'italic' }}>
                  {selected.brands}
                </div>
              </div>
              <button
                onClick={() => { setSelected(null); setVerdict(null); }}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', padding: '6px 16px', borderRadius: '2px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px' }}
              >
                ← BACK
              </button>
            </div>

            {/* Ingredients */}
            {selected.ingredients_text && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '8px' }}>INGREDIENTS</div>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: '1.8', fontStyle: 'italic', margin: 0 }}>
                  {selected.ingredients_text}
                </p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.6)', letterSpacing: '2px', fontSize: '13px' }}>
                ANALYZING INGREDIENTS...
              </div>
            )}

            {/* Verdict */}
            {verdict && (
              <div style={{ background: verdictBg(verdict.safetyVerdict), border: `1px solid ${verdictColor(verdict.safetyVerdict)}60`, borderRadius: '4px', padding: '24px' }}>

                {/* Verdict header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '32px', color: verdictColor(verdict.safetyVerdict) }}>
                    {verdictIcon(verdict.safetyVerdict)}
                  </div>
                  <div>
                    <div style={{ fontSize: '22px', fontWeight: '900', color: verdictColor(verdict.safetyVerdict), letterSpacing: '2px', textShadow: '0 0 20px currentColor' }}>
                      {verdict.safetyVerdict?.toUpperCase()}
                    </div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '3px', fontStyle: 'italic' }}>
                      Based on your health profile
                    </div>
                  </div>
                </div>

                {/* Flagged ingredients */}
                {verdict.flaggedIngredients?.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '10px' }}>
                      FLAGGED INGREDIENTS
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {verdict.flaggedIngredients.map((ing, i) => (
                        <span key={i} style={{ padding: '5px 14px', background: 'rgba(255,107,107,0.2)', border: '1px solid rgba(255,107,107,0.4)', borderRadius: '2px', color: '#ff9999', fontSize: '12px', letterSpacing: '0.5px' }}>
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Substitution suggestion */}
                {/* Social share buttons */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', width: '100%', marginBottom: '4px' }}>SHARE THIS RESULT</div>
                {[
                  { label: 'Facebook', color: '#1877f2', url: `https://www.facebook.com/sharer/sharer.php?u=https://ingredisure.com&quote=I just checked ${selected?.product_name || 'a product'} on IngrediSure — ${verdict.safetyVerdict} for my health profile! Check your ingredients at ingredisure.com` },
                  { label: 'Twitter', color: '#1da1f2', url: `https://twitter.com/intent/tweet?text=Just checked ${selected?.product_name || 'a product'} on IngrediSure — ${verdict.safetyVerdict}! Know exactly what's safe for YOUR health conditions. Try it free at ingredisure.com %23IngrediSure %23HealthyEating` },
                  { label: 'Instagram', color: '#e1306c', action: 'copy' },
                ].map(btn => (
                  <span key={btn.label}
                    onClick={() => {
                      if (btn.action === 'copy') {
                        navigator.clipboard.writeText(`I just checked ${selected?.product_name || 'a product'} on IngrediSure — ${verdict.safetyVerdict} for my health profile! Know exactly what's safe for your health conditions. Try it free at ingredisure.com #IngrediSure #HealthyEating`);
                        alert('Caption copied! Paste it into your Instagram post.');
                      } else {
                        window.open(btn.url, '_blank');
                      }
                    }}
                    style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '2px', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: '11px', letterSpacing: '0.5px' }}>
                    {btn.label}
                  </span>
                ))}
              </div>

              {verdict.substitutionSuggestion && (
                  <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '8px' }}>
                      SUGGESTION
                    </div>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: '13px', fontStyle: 'italic', lineHeight: '1.7' }}>
                      {verdict.substitutionSuggestion}
                    </p>
                  </div>
                )}

                {/* Safer alternatives */}
                {(verdict.safetyVerdict === 'Unsafe' || verdict.safetyVerdict === 'Caution') && (
                  <div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '12px' }}>
                      SAFER ALTERNATIVES
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                      {getAlternatives(selected?.product_name, verdict.flaggedIngredients).map((alt, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setQuery(alt);
                            setSelected(null);
                            setVerdict(null);
                            setResults([]);
                            setNoResults(false);
                          }}
                          style={{ padding: '8px 18px', background: 'rgba(93,187,99,0.15)', border: '1px solid rgba(93,187,99,0.5)', borderRadius: '2px', color: '#7dd97f', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '0.5px', transition: 'all 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(93,187,99,0.3)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(93,187,99,0.15)'}
                        >
                          {alt}
                        </button>
                      ))}
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
                      Click any alternative to search for it
                    </p>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

      {/* Legal footer */}
        <div style={{ textAlign: 'center', padding: '20px 0 40px', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '20px' }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontStyle: 'italic', margin: '0 0 6px', lineHeight: '1.7' }}>
            <span style={{ color: '#ffffff', fontWeight: '600' }}>{t.safetyDisclaimer}</span>
          </p>
          <span onClick={() => navigate('/legal')}
            style={{ color: '#ffffff', fontSize: '11px', letterSpacing: '1px', cursor: 'pointer', textDecoration: 'underline', fontWeight: '600', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
            {t.notMedicalAdvice} View Legal Disclaimers
          </span>
        </div>
      </div>
    {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}