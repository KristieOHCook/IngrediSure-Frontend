import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:8080/api';

const CONDITIONS = [
  'Diabetes', 'Hypertension', 'Celiac Disease',
  'Lactose Intolerance', 'Nut Allergy', 'Shellfish Allergy',
  'Heart Disease', 'Chronic Kidney Disease (CKD)', 'IBS',
];

const BG = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=90';

export default function HealthProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [conditions, setConditions] = useState([]);
  const [avoidances, setAvoidances] = useState([]);
  const [newCondition, setNewCondition] = useState('');
  const [customCondition, setCustomCondition] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [newAvoidance, setNewAvoidance] = useState('');
  const [profile, setProfile] = useState({
    currentWeight: '', goalWeight: '', heightInches: '',
    dailyCarbGoal: '', dietaryRestrictions: '', dietaryGoal: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/'); return; }
    const parsed = JSON.parse(stored);
    if (!parsed?.token) { navigate('/'); return; }
    setUser(parsed);
    loadData(parsed);
  }, [navigate]);

  const headers = (u) => ({ Authorization: `Bearer ${u.token}` });

  const loadData = async (u) => {
    try {
      const [condRes, avoRes] = await Promise.all([
        axios.get(`${API}/conditions/user/${u.userId}`, { headers: headers(u) }),
        axios.get(`${API}/avoidances/user/${u.userId}`, { headers: headers(u) }),
      ]);
      setConditions(condRes.data || []);
      setAvoidances(avoRes.data || []);
    } catch (err) {
      console.error('Load error:', err);
    }
    setLoading(false);
  };

  const addCondition = async () => {
    const conditionToAdd = useCustom ? customCondition.trim() : newCondition;
    if (!conditionToAdd) return;
    try {
      const res = await axios.post(`${API}/conditions`, {
        userId: user.userId,
        conditionName: conditionToAdd,
        severity: 'moderate',
      }, { headers: headers(user) });
      setConditions(prev => [...prev, res.data]);
      setNewCondition('');
      setCustomCondition('');
      setMessage('Condition added!');
    } catch (err) { setMessage('Error adding condition.'); }
  };

  const removeCondition = async (id) => {
    try {
      await axios.delete(`${API}/conditions/${id}`, { headers: headers(user) });
      setConditions(prev => prev.filter(c => c.id !== id));
    } catch (err) { setMessage('Error removing condition.'); }
  };

  const addAvoidance = async () => {
    if (!newAvoidance.trim()) return;
    try {
      const res = await axios.post(`${API}/avoidances`, {
        userId: user.userId,
        ingredientName: newAvoidance.trim(),
      }, { headers: headers(user) });
      setAvoidances(prev => [...prev, res.data]);
      setNewAvoidance('');
      setMessage('Ingredient added!');
    } catch (err) { setMessage('Error adding ingredient.'); }
  };

  const removeAvoidance = async (id) => {
    try {
      await axios.delete(`${API}/avoidances/${id}`, { headers: headers(user) });
      setAvoidances(prev => prev.filter(a => a.id !== id));
    } catch (err) { setMessage('Error removing ingredient.'); }
  };

  const labelStyle = {
    fontSize: '11px', letterSpacing: '2px',
    color: 'rgba(255,255,255,0.6)', marginBottom: '6px',
    fontFamily: 'Georgia, serif',
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '4px', color: '#ffffff',
    fontFamily: 'Georgia, serif', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const chipStyle = {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '6px 12px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '2px', color: '#ffffff',
    fontSize: '12px', fontFamily: 'Georgia, serif',
    letterSpacing: '0.5px',
  };

  const sectionStyle = {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '4px', padding: '28px 32px',
    marginBottom: '20px',
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1a1a1a', color: '#c9b99a', fontFamily: 'Georgia, serif', fontSize: '18px', letterSpacing: '2px' }}>
      LOADING...
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', position: 'relative', overflow: 'hidden' }}>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.65) 100%)' }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '6px' }}>
              INGREDISURE
            </div>
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '400', color: '#ffffff', letterSpacing: '1px' }}>
              Health Profile
            </h1>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 24px', borderRadius: '2px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px' }}
          >
            ← DASHBOARD
          </button>
        </div>

        {message && (
          <div style={{ background: 'rgba(93,187,99,0.2)', border: '1px solid rgba(93,187,99,0.4)', borderRadius: '4px', padding: '12px 20px', marginBottom: '20px', color: '#7dd97f', fontSize: '13px', letterSpacing: '1px' }}>
            {message}
            <button onClick={() => setMessage('')} style={{ float: 'right', background: 'none', border: 'none', color: '#7dd97f', cursor: 'pointer', fontSize: '16px' }}>×</button>
          </div>
        )}

        {/* Medical Conditions */}
        <div style={sectionStyle}>
          <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
            MEDICAL CONDITIONS
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
            These automatically flag relevant ingredients during safety checks
          </p>

          {/* Existing conditions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px', minHeight: '32px' }}>
            {conditions.length === 0 && (
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontStyle: 'italic' }}>No conditions added yet</span>
            )}
            {conditions.map(c => (
              <div key={c.id} style={chipStyle}>
                {c.conditionName}
                <button onClick={() => removeCondition(c.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', padding: 0, lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>

          {/* Toggle between dropdown and custom input */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <button
              onClick={() => setUseCustom(false)}
              style={{ padding: '6px 16px', background: !useCustom ? 'rgba(93,187,99,0.3)' : 'transparent', border: !useCustom ? '1px solid rgba(93,187,99,0.5)' : '1px solid rgba(255,255,255,0.2)', borderRadius: '2px', color: !useCustom ? '#7dd97f' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px' }}
            >
              SELECT FROM LIST
            </button>
            <button
              onClick={() => setUseCustom(true)}
              style={{ padding: '6px 16px', background: useCustom ? 'rgba(93,187,99,0.3)' : 'transparent', border: useCustom ? '1px solid rgba(93,187,99,0.5)' : '1px solid rgba(255,255,255,0.2)', borderRadius: '2px', color: useCustom ? '#7dd97f' : 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px' }}
            >
              TYPE CUSTOM CONDITION
            </button>
          </div>

          {/* Add condition */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {!useCustom ? (
              <select
                value={newCondition}
                onChange={e => setNewCondition(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
              >
                <option value="">Select a condition...</option>
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : (
              <input
                type="text"
                placeholder="e.g. Crohn's Disease, PCOS, Gout, Hashimoto's..."
                value={customCondition}
                onChange={e => setCustomCondition(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCondition()}
                style={{ ...inputStyle, flex: 1 }}
              />
            )}
            <button
              onClick={addCondition}
              style={{ padding: '12px 28px', background: 'rgba(93,187,99,0.3)', border: '1px solid rgba(93,187,99,0.5)', color: '#7dd97f', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '1px', whiteSpace: 'nowrap' }}
            >
              ADD
            </button>
          </div>
        </div>

        {/* Ingredient Avoidances */}
        <div style={sectionStyle}>
          <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
            INGREDIENT AVOIDANCES
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
            Specific ingredients to always flag regardless of condition rules
          </p>

          {/* Existing avoidances */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px', minHeight: '32px' }}>
            {avoidances.length === 0 && (
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontStyle: 'italic' }}>No ingredients added yet</span>
            )}
            {avoidances.map(a => (
              <div key={a.id} style={{ ...chipStyle, borderColor: 'rgba(255,107,53,0.4)' }}>
                {a.ingredientName}
                <button onClick={() => removeAvoidance(a.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', padding: 0, lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>

          {/* Add avoidance */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              placeholder="e.g. MSG, shellfish, red dye 40..."
              value={newAvoidance}
              onChange={e => setNewAvoidance(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addAvoidance()}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={addAvoidance}
              style={{ padding: '12px 28px', background: 'rgba(255,107,53,0.3)', border: '1px solid rgba(255,107,53,0.5)', color: 'rgba(255,150,100,1)', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '1px', whiteSpace: 'nowrap' }}
            >
              ADD
            </button>
          </div>
        </div>

        {/* User info */}
        <div style={{ ...sectionStyle, marginBottom: 0 }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
            ACCOUNT
          </h2>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={labelStyle}>USERNAME</div>
              <div style={{ color: '#ffffff', fontSize: '16px', letterSpacing: '1px' }}>{user?.username}</div>
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={labelStyle}>ROLE</div>
              <div style={{ color: user?.role === 'ROLE_ADMIN' ? '#FF8C42' : '#7dd97f', fontSize: '14px', letterSpacing: '2px' }}>
                {user?.role?.replace('ROLE_', '')}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}