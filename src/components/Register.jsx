import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const IMAGES = [
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=90',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=90',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&q=90',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=90',
];

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailOptIn, setEmailOptIn] = useState(true);
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bgIndex, setBgIndex] = useState(0);
  const [focusedField, setFocusedField] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex(i => (i + 1) % IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/auth/register', {
        username, email, password, emailOptIn, smsOptIn, phone
      });
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Username may already exist.';
      setError(msg);
    }
    setLoading(false);
  };

  const inputStyle = (field) => ({
    width: '100%', padding: '14px 16px',
    background: 'rgba(255,255,255,0.08)',
    border: focusedField === field
      ? '1px solid rgba(232,196,154,0.6)'
      : '1px solid rgba(255,255,255,0.15)',
    borderRadius: '4px', color: '#ffffff',
    fontFamily: 'Georgia, serif', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.3s',
    letterSpacing: '0.5px',
  });

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* Cycling background */}
      {IMAGES.map((img, i) => (
        <div key={i} style={{
          position: 'fixed', inset: 0, zIndex: 0,
          backgroundImage: `url(${img})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: i === bgIndex ? 1 : 0,
          transition: 'opacity 2s ease-in-out',
        }} />
      ))}

      {/* Dark overlay */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%)',
      }} />

      {/* Register card */}
      <div style={{
        position: 'relative', zIndex: 2,
        width: '100%', maxWidth: '420px',
        margin: '0 24px',
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '4px',
        padding: '48px 40px',
      }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <img
            src="/logo.jpg"
            alt="IngrediSure"
            style={{
              height: '80px', objectFit: 'contain',
              filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.8))',
              borderRadius: '12px', marginBottom: '16px',
            }}
            onError={e => e.target.style.display = 'none'}
          />
          <div style={{
            fontSize: '24px', fontWeight: '400', color: '#ffffff',
            letterSpacing: '4px', fontFamily: 'Georgia, serif',
            textShadow: '0 2px 12px rgba(0,0,0,0.5)',
          }}>
            INGREDI<span style={{ color: '#e8c49a' }}>SURE</span>
          </div>
          <div style={{
            fontSize: '10px', color: 'rgba(255,255,255,0.6)',
            letterSpacing: '3px', marginTop: '6px',
          }}>
            EAT WELL · CHOOSE WISELY
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginBottom: '32px' }} />

        {/* Title */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '3px', marginBottom: '6px' }}>
            GET STARTED
          </div>
          <div style={{ fontSize: '22px', color: '#ffffff', fontWeight: '400', letterSpacing: '0.5px' }}>
            Create your account
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(255,107,107,0.15)',
            border: '1px solid rgba(255,107,107,0.4)',
            borderRadius: '4px', padding: '12px 16px',
            color: '#ff9999', fontSize: '13px',
            marginBottom: '20px', letterSpacing: '0.5px',
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister}>

          {/* Username */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '8px' }}>
              USERNAME
            </div>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField('')}
              placeholder="Choose a username"
              style={inputStyle('username')}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '8px' }}>
              EMAIL
            </div>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
              placeholder="Enter your email"
              style={inputStyle('email')}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '8px' }}>
              PASSWORD
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField('')}
              placeholder="Minimum 6 characters"
              style={inputStyle('password')}
            />
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '8px' }}>
              CONFIRM PASSWORD
            </div>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              onFocus={() => setFocusedField('confirm')}
              onBlur={() => setFocusedField('')}
              placeholder="Re-enter your password"
              style={inputStyle('confirm')}
            />
          </div>

          {/* Phone number */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '8px' }}>
              MOBILE PHONE <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px' }}>(OPTIONAL — FOR SMS ALERTS)</span>
            </div>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField('')}
              placeholder="e.g. (614) 555-0123"
              style={inputStyle('phone')}
            />
          </div>

          {/* Opt-in checkboxes */}
          <div style={{ marginBottom: '24px', padding: '16px 20px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '12px' }}>COMMUNICATION PREFERENCES</div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px', cursor: 'pointer' }} onClick={() => setEmailOptIn(!emailOptIn)}>
              <div style={{ width: '18px', height: '18px', border: `1.5px solid ${emailOptIn ? '#7dd97f' : 'rgba(255,255,255,0.3)'}`, borderRadius: '2px', background: emailOptIn ? 'rgba(93,187,99,0.3)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', transition: 'all 0.2s' }}>
                {emailOptIn && <span style={{ color: '#7dd97f', fontSize: '11px' }}>✓</span>}
              </div>
              <div>
                <div style={{ color: '#ffffff', fontSize: '13px', marginBottom: '2px' }}>Weekly meal plans & safety tips by email</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontStyle: 'italic' }}>Personalized to your health conditions — unsubscribe anytime</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }} onClick={() => setSmsOptIn(!smsOptIn)}>
              <div style={{ width: '18px', height: '18px', border: `1.5px solid ${smsOptIn ? '#74b9ff' : 'rgba(255,255,255,0.3)'}`, borderRadius: '2px', background: smsOptIn ? 'rgba(116,185,255,0.3)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', transition: 'all 0.2s' }}>
                {smsOptIn && <span style={{ color: '#74b9ff', fontSize: '11px' }}>✓</span>}
              </div>
              <div>
                <div style={{ color: '#ffffff', fontSize: '13px', marginBottom: '2px' }}>Safety alerts & reminders by text message</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontStyle: 'italic' }}>Requires mobile number above — standard rates apply</div>
              </div>
            </div>
          </div>

          {/* Register button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '16px',
              background: loading ? 'rgba(255,255,255,0.05)' : 'rgba(232,196,154,0.2)',
              border: '1px solid rgba(232,196,154,0.5)',
              borderRadius: '4px', color: '#e8c49a',
              fontFamily: 'Georgia, serif', fontSize: '13px',
              letterSpacing: '3px', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s', marginBottom: '24px',
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
            {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
          </button>

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginBottom: '24px' }} />

          {/* Login link */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', letterSpacing: '0.5px' }}>
              Already have an account?{' '}
            </span>
            <Link to="/" style={{
              color: '#e8c49a', fontSize: '13px',
              textDecoration: 'none', letterSpacing: '1px',
              fontFamily: 'Georgia, serif',
            }}>
              Sign In
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}