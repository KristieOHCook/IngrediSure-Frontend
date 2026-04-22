import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const API = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const BG = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=90';

const LIKE_OPTIONS = [
  { id: 'easy_use', label: 'Easy to use', category: 'usability' },
  { id: 'design', label: 'Beautiful design', category: 'design' },
  { id: 'accurate', label: 'Accurate safety verdicts', category: 'accuracy' },
  { id: 'ingredient_flag', label: 'Ingredient flagging', category: 'accuracy' },
  { id: 'restaurant', label: 'Restaurant finder', category: 'features' },
  { id: 'grocery', label: 'Grocery scanner', category: 'features' },
  { id: 'health_profile', label: 'Health profile setup', category: 'features' },
  { id: 'recipes', label: 'Recipe suggestions', category: 'features' },
  { id: 'meal_planner', label: 'Meal planner', category: 'features' },
  { id: 'nutrition', label: 'Nutrition tracker', category: 'features' },
  { id: 'medications', label: 'Medication warnings', category: 'features' },
  { id: 'barcode', label: 'Barcode scanner', category: 'features' },
  { id: 'meal_prep', label: 'Meal prep services', category: 'features' },
  { id: 'fast', label: 'Fast performance', category: 'usability' },
  { id: 'personalized', label: 'Feels personalized', category: 'personalization' },
];

const DISLIKE_OPTIONS = [
  { id: 'more_restaurants', label: 'Needs more restaurants', category: 'content' },
  { id: 'more_products', label: 'Needs more products', category: 'content' },
  { id: 'loading', label: 'Loading times', category: 'performance' },
  { id: 'mobile', label: 'Needs better mobile experience', category: 'usability' },
  { id: 'more_conditions', label: 'Needs more health conditions', category: 'content' },
  { id: 'more_recipes', label: 'Needs more recipes', category: 'content' },
  { id: 'ui', label: 'UI improvements needed', category: 'design' },
  { id: 'nutrition_auto', label: 'Better nutrition auto-fill', category: 'features' },
  { id: 'more_meds', label: 'More medication interactions', category: 'features' },
  { id: 'grocery_lists', label: 'Better grocery list tools', category: 'features' },
];

const USE_CASES = [
  'Managing a chronic condition', 'Helping a family member',
  'Weight management', 'Food allergies', 'General healthy eating',
  'Post-surgery dietary needs', 'Diabetes management',
  'Heart health', 'Kidney disease', 'Other',
];

const HOW_OFTEN = [
  'This is my first time', 'A few times', 'Daily', 'Several times a week', 'Weekly',
];

const WOULD_RECOMMEND = [
  'Definitely yes', 'Probably yes', 'Not sure', 'Probably not', 'Definitely not',
];

export default function Feedback() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [liked, setLiked] = useState([]);
  const [disliked, setDisliked] = useState([]);
  const [useCases, setUseCases] = useState([]);
  const [howOften, setHowOften] = useState([]);
  const [wouldRecommend, setWouldRecommend] = useState('');
  const [mostValuableFeature, setMostValuableFeature] = useState('');
  const [missingFeature, setMissingFeature] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/'); return; }
    const parsed = JSON.parse(stored);
    if (!parsed?.token) { navigate('/'); return; }
    setUser(parsed);
  }, [navigate]);

  const toggleLike = (id) => setLiked(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleDislike = (id) => setDisliked(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleUseCase = (uc) => setUseCases(prev => prev.includes(uc) ? prev.filter(i => i !== uc) : [...prev, uc]);
  const toggleHowOften = (h) => setHowOften(prev => prev.includes(h) ? prev.filter(i => i !== h) : [...prev, h]);

  const handleSubmit = async () => {
    if (rating === 0) { setError('Please select a star rating.'); return; }
    setLoading(true);
    setError('');
    try {
      const likedLabels = liked.map(id => LIKE_OPTIONS.find(o => o.id === id)?.label).join(', ');
      const dislikedLabels = disliked.map(id => DISLIKE_OPTIONS.find(o => o.id === id)?.label).join(', ');
      const fullSuggestion = [
        useCases.length > 0 && `Use case: ${useCases.join(', ')}`,
        howOften.length > 0 && `Usage frequency: ${howOften.join(', ')}`,
        wouldRecommend && `Would recommend: ${wouldRecommend}`,
        mostValuableFeature && `Most valuable feature: ${mostValuableFeature}`,
        missingFeature && `Missing feature: ${missingFeature}`,
        suggestion && `Comments: ${suggestion}`,
      ].filter(Boolean).join(' | ');

      await axios.post(`${API}/feedback`, {
        rating,
        liked: likedLabels,
        disliked: dislikedLabels,
        suggestion: fullSuggestion,
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      setSubmitted(true);
    } catch (err) {
      setError('Error submitting feedback. Please try again.');
    }
    setLoading(false);
  };

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const sectionStyle = {
    background: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.14)',
    borderRadius: '4px', padding: '28px 32px',
    marginBottom: '20px',
  };

  const goldChipStyle = (active) => ({
    padding: '8px 16px',
    background: active ? 'rgba(232,196,154,0.2)' : 'rgba(255,255,255,0.06)',
    border: active ? '1px solid rgba(232,196,154,0.6)' : '1px solid rgba(255,255,255,0.15)',
    borderRadius: '2px',
    color: active ? '#e8c49a' : 'rgba(255,255,255,0.75)',
    cursor: 'pointer', fontFamily: 'Georgia, serif',
    fontSize: '12px', letterSpacing: '0.5px',
    transition: 'all 0.2s',
  });

  const chipStyle = (active, color = 'green') => ({
    padding: '8px 16px',
    background: active
      ? color === 'green' ? 'rgba(93,187,99,0.3)' : 'rgba(255,107,107,0.2)'
      : 'rgba(255,255,255,0.06)',
    border: active
      ? color === 'green' ? '1px solid rgba(93,187,99,0.6)' : '1px solid rgba(255,107,107,0.5)'
      : '1px solid rgba(255,255,255,0.15)',
    borderRadius: '2px',
    color: active
      ? color === 'green' ? '#7dd97f' : '#ff9999'
      : 'rgba(255,255,255,0.75)',
    cursor: 'pointer', fontFamily: 'Georgia, serif',
    fontSize: '12px', letterSpacing: '0.5px',
    transition: 'all 0.2s',
  });

  if (submitted) return (
    <div style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.65) 100%)' }} />
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '48px 40px', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', maxWidth: '520px', margin: '0 24px' }}>
        <div style={{ fontSize: '56px', marginBottom: '20px' }}>💚</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '12px' }}>THANK YOU</div>
        <h2 style={{ color: '#ffffff', fontSize: '28px', fontWeight: '400', margin: '0 0 16px', letterSpacing: '1px' }}>Your Voice Matters</h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontStyle: 'italic', lineHeight: '1.9', marginBottom: '12px' }}>
          IngrediSure was born from a personal mission — to help people like you and families like ours navigate the complexity of eating safely with health conditions.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontStyle: 'italic', lineHeight: '1.8', marginBottom: '32px' }}>
          Your feedback directly shapes how we grow and improve. Every suggestion, every star, every comment helps us serve you better.
        </p>
        <button onClick={() => navigate('/dashboard')}
          style={{ padding: '14px 32px', background: 'rgba(232,196,154,0.2)', border: '1px solid rgba(232,196,154,0.5)', borderRadius: '4px', color: '#e8c49a', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '3px' }}>
          BACK TO DASHBOARD
        </button>
      </div>
    </div>
  );

  return (
    <div className="page-enter" style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.65) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '720px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '6px' }}>INGREDISURE</div>
            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '400', color: '#ffffff', letterSpacing: '1px' }}>Share Your Experience</h1>
          </div>
          <button onClick={() => navigate('/dashboard')}
            style={{ background: 'transparent', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 24px', borderRadius: '2px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px' }}>
            ← DASHBOARD
          </button>
          <button onClick={() => navigate('/my-profile')}
            style={{ background: 'transparent', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 24px', borderRadius: '2px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px' }}>
            MY PROFILE
          </button>
        </div>

        {/* Why your feedback matters */}
        <div style={{ ...sectionStyle, background: 'rgba(232,196,154,0.1)', border: '1px solid rgba(232,196,154,0.25)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '28px', flexShrink: 0 }}>💚</div>
            <div>
              <div style={{ fontSize: '12px', color: '#e8c49a', letterSpacing: '2px', marginBottom: '8px' }}>WHY YOUR FEEDBACK MATTERS</div>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', lineHeight: '1.9', margin: '0 0 10px', fontStyle: 'italic' }}>
                This app was inspired by a mother's daily struggle — spending hours reading ingredient labels, guessing what was safe to eat, and trying to manage multiple health conditions without a clear guide.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: '1.8', margin: 0 }}>
                Your honest feedback helps us build the tools that people with health conditions truly need. This survey takes about 3 minutes and directly influences our next update. <span style={{ color: '#e8c49a', fontWeight: '600' }}>Your voice shapes this platform.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '2px' }}>
              STEP {step} OF {totalSteps}
            </div>
            <div style={{ fontSize: '11px', color: '#e8c49a', letterSpacing: '1px' }}>
              {Math.round(progress)}% COMPLETE
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '2px', height: '4px' }}>
            <div style={{ width: `${progress}%`, background: '#e8c49a', height: '100%', borderRadius: '2px', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.4)', borderRadius: '4px', padding: '12px 20px', marginBottom: '20px', color: '#ff9999', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {/* STEP 1 — Overall rating + use case */}
        {step === 1 && (
          <div>
            <div style={sectionStyle}>
              <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.7)', letterSpacing: '3px' }}>OVERALL RATING</h2>
              <p style={{ margin: '0 0 24px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontStyle: 'italic' }}>
                How would you rate your overall experience with this app?
              </p>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '12px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <div key={star} onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    style={{ fontSize: '44px', cursor: 'pointer', color: star <= (hoveredRating || rating) ? '#e8c49a' : 'rgba(255,255,255,0.2)', transition: 'all 0.2s', transform: star <= (hoveredRating || rating) ? 'scale(1.2)' : 'scale(1)' }}>
                    ★
                  </div>
                ))}
                {rating > 0 && (
                  <div style={{ marginLeft: '12px', color: '#e8c49a', fontSize: '15px', fontStyle: 'italic' }}>
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'][rating]}
                  </div>
                )}
              </div>
            </div>

            <div style={sectionStyle}>
              <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.7)', letterSpacing: '3px' }}>WHY ARE YOU USING THIS APP?</h2>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontStyle: 'italic' }}>
                Select all that apply — helps us understand who we are serving
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {USE_CASES.map(uc => (
                  <button key={uc} onClick={() => toggleUseCase(uc)} style={goldChipStyle(useCases.includes(uc))}>
                    {useCases.includes(uc) ? '✓ ' : ''}{uc}
                  </button>
                ))}
              </div>
            </div>

            <div style={sectionStyle}>
              <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.7)', letterSpacing: '3px' }}>HOW OFTEN DO YOU USE THE APP?</h2>
              <p style={{ margin: '8px 0 16px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontStyle: 'italic' }}>Select all that apply</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {HOW_OFTEN.map(h => (
                  <button key={h} onClick={() => toggleHowOften(h)} style={goldChipStyle(howOften.includes(h))}>
                    {howOften.includes(h) ? '✓ ' : ''}{h}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — What you like */}
        {step === 2 && (
          <div>
            <div style={sectionStyle}>
              <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.7)', letterSpacing: '3px' }}>WHAT DO YOU LIKE MOST?</h2>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontStyle: 'italic' }}>
                Select everything that has been helpful or impressive
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {LIKE_OPTIONS.map(opt => (
                  <button key={opt.id} onClick={() => toggleLike(opt.id)} style={chipStyle(liked.includes(opt.id))}>
                    {liked.includes(opt.id) ? '✓ ' : ''}{opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={sectionStyle}>
              <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.7)', letterSpacing: '3px' }}>WHAT IS THE SINGLE MOST VALUABLE FEATURE TO YOU?</h2>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontStyle: 'italic' }}>
                This helps us know what to keep investing in
              </p>
              <textarea value={mostValuableFeature} onChange={e => setMostValuableFeature(e.target.value)}
                placeholder="e.g. The ingredient safety checker — it tells me exactly what I need to avoid for my diabetes..."
                rows={3}
                style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: '#ffffff', fontFamily: 'Georgia, serif', fontSize: '13px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontStyle: 'italic', lineHeight: '1.6' }}
              />
            </div>
          </div>
        )}

        {/* STEP 3 — What needs improvement */}
        {step === 3 && (
          <div>
            <div style={sectionStyle}>
              <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.7)', letterSpacing: '3px' }}>WHAT NEEDS IMPROVEMENT?</h2>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontStyle: 'italic' }}>
                Be honest — every piece of critical feedback makes us better
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {DISLIKE_OPTIONS.map(opt => (
                  <button key={opt.id} onClick={() => toggleDislike(opt.id)} style={chipStyle(disliked.includes(opt.id), 'red')}>
                    {disliked.includes(opt.id) ? '✗ ' : ''}{opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={sectionStyle}>
              <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.7)', letterSpacing: '3px' }}>WHAT FEATURE ARE WE MISSING?</h2>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontStyle: 'italic' }}>
                What would make this app indispensable to you?
              </p>
              <textarea value={missingFeature} onChange={e => setMissingFeature(e.target.value)}
                placeholder="e.g. I wish it could connect to my grocery store loyalty card to automatically flag unsafe products in my purchase history..."
                rows={3}
                style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: '#ffffff', fontFamily: 'Georgia, serif', fontSize: '13px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontStyle: 'italic', lineHeight: '1.6' }}
              />
            </div>
          </div>
        )}

        {/* STEP 4 — Recommendation + final comments */}
        {step === 4 && (
          <div>
            <div style={sectionStyle}>
              <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.7)', letterSpacing: '3px' }}>WOULD YOU RECOMMEND THIS APP?</h2>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontStyle: 'italic' }}>
                Would you recommend this app to a friend or family member with health conditions?
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {WOULD_RECOMMEND.map(r => (
                  <button key={r} onClick={() => setWouldRecommend(r)} style={chipStyle(wouldRecommend === r)}>
                    {wouldRecommend === r ? '✓ ' : ''}{r}
                  </button>
                ))}
              </div>
            </div>

            <div style={sectionStyle}>
              <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.7)', letterSpacing: '3px' }}>ANY FINAL THOUGHTS?</h2>
              <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontStyle: 'italic' }}>
                Tell us anything — your story, your experience, your hopes for this platform
              </p>
              <textarea value={suggestion} onChange={e => setSuggestion(e.target.value)}
                placeholder="Share your thoughts, your health journey, or any ideas you have for making IngrediSure better for everyone..."
                rows={5}
                style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: '#ffffff', fontFamily: 'Georgia, serif', fontSize: '13px', outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontStyle: 'italic', lineHeight: '1.6' }}
              />
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between' }}>
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)}
              style={{ padding: '14px 28px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px' }}>
              ← BACK
            </button>
          )}
          {step < totalSteps ? (
            <button onClick={() => { if (step === 1 && rating === 0) { setError('Please select a star rating to continue.'); return; } setError(''); setStep(s => s + 1); }}
              style={{ flex: 1, padding: '14px', background: 'rgba(232,196,154,0.2)', border: '1px solid rgba(232,196,154,0.5)', borderRadius: '4px', color: '#e8c49a', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '3px' }}>
              CONTINUE →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading}
              style={{ flex: 1, padding: '14px', background: loading ? 'rgba(255,255,255,0.05)' : 'rgba(93,187,99,0.25)', border: '1px solid rgba(93,187,99,0.5)', borderRadius: '4px', color: '#7dd97f', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '3px' }}>
              {loading ? 'SUBMITTING...' : '💚 SUBMIT FEEDBACK'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}