import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:8080/api';
const BG = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=90';

export default function SavedList() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/'); return; }
    const parsed = JSON.parse(stored);
    if (!parsed?.token) { navigate('/'); return; }
    setUser(parsed);
    loadItems(parsed);
  }, [navigate]);

  const loadItems = async (u) => {
    try {
      const res = await axios.get(
        `${API}/saved-items/user/${u.userId}`,
        { headers: { Authorization: `Bearer ${u.token}` } }
      );
      setItems(res.data || []);
    } catch (err) {
      console.error('Load error:', err);
    }
    setLoading(false);
  };

  const removeItem = async (id) => {
    try {
      await axios.delete(
        `${API}/saved-items/${id}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error('Remove error:', err);
    }
  };

  const verdictColor = (v) => {
    const val = (v || '').toLowerCase();
    if (val === 'safe') return '#7dd97f';
    if (val === 'caution') return '#f0c040';
    if (val === 'unsafe') return '#ff6b6b';
    return 'rgba(255,255,255,0.4)';
  };

  const verdictBg = (v) => {
    const val = (v || '').toLowerCase();
    if (val === 'safe') return 'rgba(93,187,99,0.12)';
    if (val === 'caution') return 'rgba(240,192,64,0.12)';
    if (val === 'unsafe') return 'rgba(255,107,107,0.12)';
    return 'rgba(255,255,255,0.04)';
  };

  const verdictIcon = (v) => {
    const val = (v || '').toLowerCase();
    if (val === 'safe') return '✓';
    if (val === 'caution') return '⚠';
    if (val === 'unsafe') return '✗';
    return '·';
  };

  const filtered = items.filter(item => {
    if (filter === 'all') return true;
    return (item.safetyVerdict || '').toLowerCase() === filter;
  });

  const sectionStyle = {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '4px', padding: '28px 32px',
    marginBottom: '20px',
  };

  const tabStyle = (active) => ({
    padding: '8px 20px',
    background: active ? 'rgba(232,196,154,0.2)' : 'transparent',
    border: active ? '1px solid rgba(232,196,154,0.5)' : '1px solid rgba(255,255,255,0.15)',
    borderRadius: '2px',
    color: active ? '#e8c49a' : 'rgba(255,255,255,0.4)',
    cursor: 'pointer', fontFamily: 'Georgia, serif',
    fontSize: '11px', letterSpacing: '2px',
    transition: 'all 0.2s',
  });

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1a1a1a', color: '#c9b99a', fontFamily: 'Georgia, serif', fontSize: '18px', letterSpacing: '2px' }}>
      LOADING...
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.65) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '6px' }}>INGREDISURE</div>
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '400', color: '#ffffff', letterSpacing: '1px' }}>My Saved Products</h1>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 24px', borderRadius: '2px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px' }}
          >
            ← DASHBOARD
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'TOTAL', value: items.length, color: '#ffffff' },
            { label: 'SAFE', value: items.filter(i => (i.safetyVerdict||'').toLowerCase() === 'safe').length, color: '#7dd97f' },
            { label: 'CAUTION', value: items.filter(i => (i.safetyVerdict||'').toLowerCase() === 'caution').length, color: '#f0c040' },
            { label: 'UNSAFE', value: items.filter(i => (i.safetyVerdict||'').toLowerCase() === 'unsafe').length, color: '#ff6b6b' },
          ].map(stat => (
            <div key={stat.label} style={{ ...sectionStyle, textAlign: 'center', padding: '16px', marginBottom: 0 }}>
              <div style={{ fontSize: '28px', fontWeight: '300', color: stat.color, marginBottom: '4px' }}>{stat.value}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          {['all', 'safe', 'caution', 'unsafe'].map(f => (
            <button key={f} style={tabStyle(filter === f)} onClick={() => setFilter(f)}>
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Items list */}
        <div style={sectionStyle}>
          <h2 style={{ margin: '0 0 20px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
            {filter === 'all' ? 'ALL SAVED PRODUCTS' : `${filter.toUpperCase()} PRODUCTS`} — {filtered.length} ITEMS
          </h2>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
              {items.length === 0
                ? 'No saved products yet. Start scanning or searching products to build your list.'
                : `No ${filter} products in your list.`}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filtered.map((item, i) => (
                <div
                  key={item.id || i}
                  style={{
                    padding: '18px 20px',
                    background: verdictBg(item.safetyVerdict),
                    border: `1px solid ${verdictColor(item.safetyVerdict)}30`,
                    borderRadius: '4px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '18px', color: verdictColor(item.safetyVerdict) }}>
                        {verdictIcon(item.safetyVerdict)}
                      </span>
                      <span style={{ color: '#ffffff', fontSize: '16px' }}>{item.itemName}</span>
                      <span style={{ fontSize: '10px', color: verdictColor(item.safetyVerdict), letterSpacing: '1px', border: `1px solid ${verdictColor(item.safetyVerdict)}50`, padding: '1px 8px', borderRadius: '2px' }}>
                        {(item.safetyVerdict || '').toUpperCase()}
                      </span>
                    </div>
                    {item.brandOrRestaurant && (
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontStyle: 'italic', marginBottom: '4px' }}>
                        {item.brandOrRestaurant}
                      </div>
                    )}
                    {item.matchedTriggers && (
                      <div style={{ color: '#ff9999', fontSize: '12px', marginTop: '6px' }}>
                        ⚑ {item.matchedTriggers}
                      </div>
                    )}
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', marginTop: '6px', letterSpacing: '1px' }}>
                      {item.itemSource} · {item.savedAt ? new Date(item.savedAt).toLocaleDateString() : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{ marginLeft: '16px', padding: '6px 14px', background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '2px', color: '#ff9999', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px', flexShrink: 0 }}
                  >
                    REMOVE
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}