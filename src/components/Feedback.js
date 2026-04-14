import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:8080/api';
const BG = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=90';

const LIKE_OPTIONS = [
  'Easy to use', 'Beautiful design', 'Accurate safety verdicts',
  'Helpful ingredient flagging', 'Restaurant finder', 'Grocery scanner',
  'Health profile customization', 'Recipe suggestions', 'Fast performance',
  'Meal planning feature',
];

const DISLIKE_OPTIONS = [
  'Needs more restaurants', 'Needs more products', 'Loading times',
  'Needs mobile app', 'Needs more conditions', 'Needs barcode scanner',
  'Needs more recipes', 'UI improvements needed', 'Needs offline mode',
  'Needs more dietary options',
];

export default function Feedback() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [liked, setLiked] = useState([]);
  const [disliked, setDisliked] = useState([]);
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

  const toggleLike = (item) => {
    setLiked(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleDislike = (item) => {
    setDisliked(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) { setError('Please select a star rating.'); return; }
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/feedback`, {
        rating,
        liked: liked.join(', '),
        disliked: disliked.join(', '),
        suggestion,
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSubmitted(true);
    } catch (err) {
      setError('Error submitting feedback. Please try again.');
    }
    setLoading(false);
  };

  const sectionStyle = {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '4px', padding: '28px 32px',
    marginBottom: '20px',
  };

  if (submitted) return (
    <div style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.65) 100%)' }} />
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '48px 40px', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', maxWidth: '480px', margin: '0 24px' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>✓</div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '3px', marginBottom: '12px' }}>THANK YOU</div>
        <h2 style={{ color: '#ffffff', fontSize: '28px', fontWeight: '400', margin: '0 0 16px', letterSpacing: '1px' }}>Feedback Received</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontStyle: 'italic', lineHeight: '1.8', marginBottom: '32px' }}>
          Your feedback helps us improve IngrediSure for everyone. We appreciate you taking the time to share your thoughts.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ padding: '14px 32px', background: 'rgba(232,196,154,0.2)', border: '1px solid rgba(232,196,154,0.5)', borderRadius: '4px', color: '#e8c49a', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '3px' }}
        >
          BACK TO DASHBOARD
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.65) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '700px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '6px' }}>INGREDISURE</div>
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '400', color: '#ffffff', letterSpacing: '1px' }}>Share Your Feedback</h1>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 24px', borderRadius: '2px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px' }}
          >
            ← DASHBOARD
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.4)', borderRadius: '4px', padding: '12px 20px', marginBottom: '20px', color: '#ff9999', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {/* Star Rating */}
        <div style={sectionStyle}>
          <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
            OVERALL RATING
          </h2>
          <p style={{ margin: '0 0 24px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
            How would you rate your experience with IngrediSure?
          </p>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <div
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                style={{
                  fontSize: '40px', cursor: 'pointer',
                  color: star <= (hoveredRating || rating) ? '#e8c49a' : 'rgba(255,255,255,0.2)',
                  transition: 'color 0.2s, transform 0.2s',
                  transform: star <= (hoveredRating || rating) ? 'scale(1.2)' : 'scale(1)',
                }}
              >
                ★
              </div>
            ))}
            {rating > 0 && (
              <div style={{ marginLeft: '16px', color: '#e8c49a', fontSize: '14px', fontStyle: 'italic' }}>
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </div>
            )}
          </div>
        </div>

        {/* What did you like */}
        <div style={sectionStyle}>
          <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
            WHAT DID YOU LIKE?
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
            Select all that apply
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {LIKE_OPTIONS.map(option => (
              <button
                key={option}
                onClick={() => toggleLike(option)}
                style={{
                  padding: '8px 16px',
                  background: liked.includes(option) ? 'rgba(93,187,99,0.3)' : 'rgba(255,255,255,0.05)',
                  border: liked.includes(option) ? '1px solid rgba(93,187,99,0.6)' : '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '2px',
                  color: liked.includes(option) ? '#7dd97f' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer', fontFamily: 'Georgia, serif',
                  fontSize: '12px', letterSpacing: '0.5px',
                  transition: 'all 0.2s',
                }}
              >
                {liked.includes(option) ? '✓ ' : ''}{option}
              </button>
            ))}
          </div>
        </div>

        {/* What needs improvement */}
        <div style={sectionStyle}>
          <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
            WHAT NEEDS IMPROVEMENT?
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
            Select all that apply
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {DISLIKE_OPTIONS.map(option => (
              <button
                key={option}
                onClick={() => toggleDislike(option)}
                style={{
                  padding: '8px 16px',
                  background: disliked.includes(option) ? 'rgba(255,107,107,0.2)' : 'rgba(255,255,255,0.05)',
                  border: disliked.includes(option) ? '1px solid rgba(255,107,107,0.5)' : '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '2px',
                  color: disliked.includes(option) ? '#ff9999' : 'rgba(255,255,255,0.6)',
                  cursor: 'pointer', fontFamily: 'Georgia, serif',
                  fontSize: '12px', letterSpacing: '0.5px',
                  transition: 'all 0.2s',
                }}
              >
                {disliked.includes(option) ? '✗ ' : ''}{option}
              </button>
            ))}
          </div>
        </div>

        {/* Suggestion */}
        <div style={sectionStyle}>
          <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
            SUGGESTIONS & COMMENTS
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
            Tell us anything else — what features would you love to see?
          </p>
          <textarea
            value={suggestion}
            onChange={e => setSuggestion(e.target.value)}
            placeholder="Share your thoughts, ideas, or suggestions..."
            rows={5}
            style={{
              width: '100%', padding: '14px 16px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '4px', color: '#ffffff',
              fontFamily: 'Georgia, serif', fontSize: '14px',
              outline: 'none', boxSizing: 'border-box',
              resize: 'vertical', lineHeight: '1.6',
              fontStyle: 'italic',
            }}
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '18px',
            background: loading ? 'rgba(255,255,255,0.05)' : 'rgba(232,196,154,0.2)',
            border: '1px solid rgba(232,196,154,0.5)',
            borderRadius: '4px', color: '#e8c49a',
            fontFamily: 'Georgia, serif', fontSize: '13px',
            letterSpacing: '3px', cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s', marginBottom: '40px',
          }}
          onMouseOver={e => {
            if (!loading) {
              e.target.style.background = 'rgba(232,196,154,0.35)';
              e.target.style.color = '#ffffff';
            }
          }}
          onMouseOut={e => {
            if (!loading) {
              e.target.style.background = 'rgba(232,196,154,0.2)';
              e.target.style.color = '#e8c49a';
            }
          }}
        >
          {loading ? 'SUBMITTING...' : 'SUBMIT FEEDBACK'}
        </button>

      </div>
    </div>
  );
}