import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const IMAGES = [
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=90',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=90',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&q=90',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=90',
];

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bgIndex, setBgIndex] = useState(0);
  const [focusedField, setFocusedField] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed?.username) navigate('/dashboard');
      } catch (e) {
        localStorage.removeItem('user');
      }
    }

    const interval = setInterval(() => {
      setBgIndex(i => (i + 1) % IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('http://localhost:8080/api/auth/login', {
        username, password
      });
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* Cycling background images */}
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

      {/* Login card */}
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

        {/* Welcome text */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '3px', marginBottom: '6px' }}>
            WELCOME BACK
          </div>
          <div style={{ fontSize: '22px', color: '#ffffff', fontWeight: '400', letterSpacing: '0.5px' }}>
            Sign in to your account
          </div>
        </div>

        {/* Error message */}
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
        <form onSubmit={handleLogin}>

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
              placeholder="Enter your username"
              style={{
                width: '100%', padding: '14px 16px',
                background: 'rgba(255,255,255,0.08)',
                border: focusedField === 'username'
                  ? '1px solid rgba(232,196,154,0.6)'
                  : '1px solid rgba(255,255,255,0.15)',
                borderRadius: '4px', color: '#ffffff',
                fontFamily: 'Georgia, serif', fontSize: '14px',
                outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.3s',
                letterSpacing: '0.5px',
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '8px' }}>
              PASSWORD
            </div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField('')}
              placeholder="Enter your password"
              style={{
                width: '100%', padding: '14px 16px',
                background: 'rgba(255,255,255,0.08)',
                border: focusedField === 'password'
                  ? '1px solid rgba(232,196,154,0.6)'
                  : '1px solid rgba(255,255,255,0.15)',
                borderRadius: '4px', color: '#ffffff',
                fontFamily: 'Georgia, serif', fontSize: '14px',
                outline: 'none', boxSizing: 'border-box',
                transition: 'border-color 0.3s',
                letterSpacing: '0.5px',
              }}
            />
          </div>

          {/* Forgot password */}
          <div style={{ textAlign: 'right', marginBottom: '28px' }}>
            <Link to="/forgot-password" style={{
              color: 'rgba(232,196,154,0.8)', fontSize: '12px',
              textDecoration: 'none', letterSpacing: '1px',
              fontFamily: 'Georgia, serif',
            }}>
              Forgot Password?
            </Link>
          </div>

          {/* Login button */}
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
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>

          {/* Divider */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginBottom: '24px' }} />

          {/* Register link */}
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', letterSpacing: '0.5px' }}>
              New to IngrediSure?{' '}
            </span>
            <Link to="/register" style={{
              color: '#e8c49a', fontSize: '13px',
              textDecoration: 'none', letterSpacing: '1px',
              fontFamily: 'Georgia, serif',
            }}>
              Create Account
            </Link>
          </div>

        </form>
      </div>
    </div>
  );
}