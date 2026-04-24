import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../AccessibilityContext';
import { useUser } from '../UserContext';
import LoadingScreen from './LoadingScreen';
import { glassCard, inputStyle as themeInputStyle, btnPrimary, btnSuccess, btnDanger, sectionLabel, sectionLabelGold, COLORS, FONT } from '../styles/theme';
import useToast from '../hooks/useToast';
import useAuth from '../hooks/useAuth';

const CONDITIONS = [
  'Diabetes', 'Hypertension', 'Celiac Disease',
  'Lactose Intolerance', 'Nut Allergy', 'Shellfish Allergy',
  'Heart Disease', 'Chronic Kidney Disease (CKD)', 'IBS',
];

const BG = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=90';

export default function HealthProfile() {
  const navigate = useNavigate();
  const { t } = useAccessibility();
  const { user, conditions, avoidances, addCondition, removeCondition, addAvoidance, removeAvoidance, loading } = useUser();
  const { user: authUser } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [newCondition, setNewCondition] = useState('');
  const [customCondition, setCustomCondition] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [newAvoidance, setNewAvoidance] = useState('');
  const [profile, setProfile] = useState({
    currentWeight: '', goalWeight: '', heightInches: '',
    dailyCarbGoal: '', dietaryRestrictions: '', dietaryGoal: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const setWarning = (text) => { setMessage(text); setMessageType('warning'); };
  const setSuccess = (text) => { setMessage(text); setMessageType('success'); };
  const setError = (text) => { setMessage(text); setMessageType('error'); };

  useEffect(() => {
    if (!loading && !user) navigate('/');
  }, [user, loading, navigate]);

  const handleAddCondition = async () => {
    const conditionToAdd = useCustom ? customCondition.trim() : newCondition;
    if (!conditionToAdd) return;
    const result = await addCondition(conditionToAdd);
    if (result?.error) { setWarning(result.error); return; }
    setNewCondition('');
    setCustomCondition('');
    setSuccess('Condition added!');
  };

  const handleRemoveCondition = async (id) => {
    await removeCondition(id);
  };

  const handleAddAvoidance = async () => {
    if (!newAvoidance.trim()) return;
    const result = await addAvoidance(newAvoidance.trim());
    if (result?.error) { setWarning(result.error); return; }
    setNewAvoidance('');
    setSuccess('Ingredient added!');
  };

  const handleRemoveAvoidance = async (id) => {
    await removeAvoidance(id);
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

  if (loading) return <LoadingScreen bg={BG} />;

  return (
    <div className="page-enter" style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', position: 'relative', overflow: 'hidden' }}>

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
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.5)', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px', fontWeight: '600' }}
          >
            ← DASHBOARD
          </button>
        </div>

        {message && (() => {
          const isWarning = messageType === 'warning';
          const isError = messageType === 'error';
          const bg = isWarning ? 'rgba(240,192,64,0.15)' : isError ? 'rgba(255,107,107,0.15)' : 'rgba(93,187,99,0.15)';
          const border = isWarning ? 'rgba(240,192,64,0.5)' : isError ? 'rgba(255,107,107,0.5)' : 'rgba(93,187,99,0.4)';
          const color = isWarning ? 'rgba(240,192,64,0.9)' : isError ? 'rgba(255,107,107,0.9)' : '#7dd97f';
          return (
            <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '4px', padding: '12px 20px', marginBottom: '20px', marginTop: '8px', color, fontSize: '13px', letterSpacing: '1px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{isWarning && <strong>⚠ WARNING: </strong>}{message}</span>
              <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', color, cursor: 'pointer', fontSize: '16px', marginLeft: '12px', flexShrink: 0 }}>×</button>
            </div>
          );
        })()}

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
                <button onClick={() => handleRemoveCondition(c.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', padding: 0, lineHeight: 1 }}>×</button>
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
                style={{ 
  ...inputStyle, 
  flex: 1, 
  color: '#ffffff',
  background: 'rgba(255,255,255,0.1)',
  WebkitAppearance: 'none',
  appearance: 'none',
  cursor: 'pointer',
  paddingRight: '30px',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
}}
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
                onKeyDown={e => e.key === 'Enter' && handleAddCondition()}
                style={{ ...inputStyle, flex: 1 }}
              />
            )}
            <button
              onClick={handleAddCondition}
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
                <button onClick={() => handleRemoveAvoidance(a.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', padding: 0, lineHeight: 1 }}>×</button>
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
              onKeyDown={e => e.key === 'Enter' && handleAddAvoidance()}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={handleAddAvoidance}
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