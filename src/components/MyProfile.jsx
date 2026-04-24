import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAccessibility } from '../AccessibilityContext';
import { useUser } from '../UserContext';
import Toast from './Toast';
import { glassCard, inputStyle as themeInputStyle, btnPrimary, btnSuccess, btnDanger, sectionLabel, sectionLabelGold, COLORS, FONT } from '../styles/theme';
import { FOOD_DRUG_INTERACTIONS, getFoodInteractions, checkAvoidanceConflicts } from '../constants/medications';
import useToast from '../hooks/useToast';
import useAuth from '../hooks/useAuth';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const CONDITIONS = [
  'Type 2 Diabetes', 'Type 1 Diabetes', 'Hypertension', 'Heart Disease',
  'Celiac Disease', 'Crohn\'s Disease', 'IBS', 'Kidney Disease',
  'Liver Disease', 'Thyroid Disease', 'PCOS', 'Lupus', 'Arthritis',
  'Osteoporosis', 'Anemia', 'High Cholesterol', 'Obesity', 'Gout',
  'Hashimoto\'s', 'Multiple Sclerosis', 'Parkinson\'s Disease',
  'Alzheimer\'s Disease', 'Cancer', 'HIV/AIDS', 'Asthma', 'COPD',
  'Sleep Apnea', 'Depression', 'Anxiety', 'ADHD', 'Autism',
  'Food Allergy — Peanuts', 'Food Allergy — Tree Nuts',
  'Food Allergy — Shellfish', 'Food Allergy — Fish',
  'Food Allergy — Milk/Dairy', 'Food Allergy — Eggs',
  'Food Allergy — Wheat/Gluten', 'Food Allergy — Soy',
  'Lactose Intolerance', 'Other'
];

export default function MyProfile() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useAccessibility();
  const { user, conditions, avoidances, medications, savedItems,
          addCondition, removeCondition, addAvoidance, removeAvoidance,
          addMedication, removeMedication, removeSavedItem, loading } = useUser();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState('conditions');
  const [showPassword, setShowPassword] = useState(false);
  const { toast, showToast, hideToast } = useToast();
  const [newCondition, setNewCondition] = useState('');
  const [customCondition, setCustomCondition] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [newAvoidance, setNewAvoidance] = useState('');
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFrequency, setNewMedFrequency] = useState('');
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const [savedFilter, setSavedFilter] = useState('All');
  const [userAvatar, setUserAvatar] = useState(() => localStorage.getItem('userAvatar') || null);
  const [avatarHovered, setAvatarHovered] = useState(false);
  const avatarFileRef = useRef(null);

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      localStorage.setItem('userAvatar', base64);
      setUserAvatar(base64);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  useEffect(() => {
    if (!loading && !user) { navigate('/'); return; }
    if (user) {
      setNewUsername(user.username || '');
      setNewEmail(user.email || '');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleAddCondition = async () => {
    const conditionToAdd = useCustom ? customCondition.trim() : newCondition.trim();
    if (!conditionToAdd) return;
    const result = await addCondition(conditionToAdd);
    if (result?.error) { showToast(result.error, 'warning'); return; }
    setNewCondition('');
    setCustomCondition('');
    showToast('Condition added successfully.', 'success');
  };

  const handleRemoveCondition = async (id) => {
    await removeCondition(id);
    showToast('Condition removed.', 'delete');
  };

  const handleAddAvoidance = async () => {
    if (!newAvoidance.trim()) return;
    const result = await addAvoidance(newAvoidance.trim());
    if (result?.error) { showToast(result.error, 'warning'); return; }
    setNewAvoidance('');
    showToast('Avoidance added successfully.', 'success');
  };

  const handleRemoveAvoidance = async (id) => {
    await removeAvoidance(id);
    showToast('Avoidance removed.', 'delete');
  };

  const handleAddMedication = async () => {
    if (!newMedName.trim()) return;
    const result = await addMedication(newMedName.trim(), newMedDosage.trim(), newMedFrequency.trim());
    if (result?.error) { showToast(result.error, 'warning'); return; }
    setNewMedName('');
    setNewMedDosage('');
    setNewMedFrequency('');
    showToast('Medication added successfully.', 'success');
  };

  const handleRemoveMedication = async (id) => {
    await removeMedication(id);
    showToast('Medication removed.', 'delete');
  };

  const handleRemoveSavedItem = async (id) => {
    await removeSavedItem(id);
    showToast('Item removed.', 'delete');
  };

  const bg = 'linear-gradient(135deg, #1a1a1a 0%, #2d1f1f 50%, #1a1a1a 100%)';
  const glass = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '24px',
    backdropFilter: 'blur(10px)',
  };
  const chipStyle = {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '6px 14px', borderRadius: '20px',
    background: 'rgba(232,196,154,0.15)', border: '1px solid rgba(232,196,154,0.3)',
    color: '#e8c49a', fontSize: '12px', letterSpacing: '0.5px',
  };
  const inputStyle = {
    padding: '12px 16px', background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px',
    color: '#ffffff', fontFamily: 'Georgia, serif', fontSize: '13px',
    outline: 'none', width: '100%', boxSizing: 'border-box',
  };
  const btnStyle = (color = '#e8c49a') => ({
    padding: '10px 20px', background: `rgba(${color === '#e8c49a' ? '232,196,154' : '93,187,99'},0.2)`,
    border: `1px solid rgba(${color === '#e8c49a' ? '232,196,154' : '93,187,99'},0.4)`,
    color: color, borderRadius: '4px', cursor: 'pointer',
    fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '1px',
  });

  const verdictColor = (v) => {
    if (!v) return '#ffffff';
    if (v.toLowerCase().includes('safe') && !v.toLowerCase().includes('un')) return '#7dd97f';
    if (v.toLowerCase().includes('caution')) return '#f0c040';
    return '#ff6b6b';
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#e8c49a', fontFamily: 'Georgia, serif', fontSize: '16px', letterSpacing: '2px' }}>LOADING YOUR PROFILE...</div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: bg, padding: '40px 20px', fontFamily: 'Georgia, serif' }}>
      
      {/* Header */}
      <div style={{ maxWidth: '900px', margin: '0 auto 32px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ ...btnStyle(), marginBottom: '24px', fontSize: '11px' }}>
          ← DASHBOARD
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{ position: 'relative', width: '72px', height: '72px', flexShrink: 0, cursor: 'pointer' }}
            onClick={() => avatarFileRef.current?.click()}
            onMouseEnter={() => setAvatarHovered(true)}
            onMouseLeave={() => setAvatarHovered(false)}
          >
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: userAvatar ? 'transparent' : 'rgba(232,196,154,0.2)',
              border: '2px solid rgba(232,196,154,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', fontSize: '28px', fontWeight: '600', color: '#e8c49a',
            }}>
              {userAvatar
                ? <img src={userAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (user?.username?.[0]?.toUpperCase() || '?')
              }
            </div>
            {avatarHovered && (
              <div style={{
                position: 'absolute', bottom: 0, right: 0,
                width: '22px', height: '22px', borderRadius: '50%',
                background: 'rgba(0,0,0,0.75)', border: '1.5px solid rgba(255,255,255,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#ffffff', fontSize: '14px', fontWeight: '700', lineHeight: 1,
                pointerEvents: 'none',
              }}>+</div>
            )}
            <input ref={avatarFileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '400', color: '#e8c49a', letterSpacing: '2px' }}>
              {user?.username?.toUpperCase()}
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>
              MY PROFILE & HEALTH SETTINGS
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div style={{ display: 'flex', gap: '16px', marginTop: '24px', flexWrap: 'wrap' }}>
          {[
            { label: 'CONDITIONS', value: conditions.length, color: '#e8c49a' },
            { label: 'AVOIDANCES', value: avoidances.length, color: '#e8c49a' },
            { label: 'MEDICATIONS', value: medications.length, color: '#e8c49a' },
            { label: 'SAVED HISTORY', value: savedItems.length, color: '#e8c49a' },
            { label: 'RESTAURANTS', value: savedItems.filter(i => i.itemSource === 'Restaurant').length, color: 'rgba(74,159,212,0.85)' },
            { label: 'RECIPES', value: savedItems.filter(i => i.itemSource === 'Recipe').length, color: 'rgba(162,155,254,0.85)' },
          ].map(stat => (
            <div key={stat.label} style={{
              ...glass, flex: 1, minWidth: '120px', textAlign: 'center', padding: '16px',
            }}>
              <div style={{ fontSize: '28px', color: stat.color, fontWeight: '400' }}>{stat.value}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { key: 'conditions', label: 'Health Conditions' },
            { key: 'avoidances', label: 'Avoidances & Restrictions' },
            { key: 'medications', label: 'Medications' },
            { key: 'saved', label: 'Saved History' },
            { key: 'account', label: 'Account' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 20px',
                background: activeTab === tab.key ? 'rgba(232,196,154,0.2)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${activeTab === tab.key ? 'rgba(232,196,154,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: activeTab === tab.key ? '#e8c49a' : 'rgba(255,255,255,0.5)',
                borderRadius: '4px', cursor: 'pointer',
                fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '1px',
                transition: 'all 0.2s ease',
              }}
            >{tab.label}</button>
          ))}
        </div>

        {/* CONDITIONS TAB */}
        {activeTab === 'conditions' && (
          <div style={glass}>
            <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
              HEALTH CONDITIONS
            </h2>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
              Your conditions are used to personalize every safety check across the app
            </p>

            {/* Existing conditions */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px', minHeight: '40px' }}>
              {conditions.length === 0 && (
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontStyle: 'italic' }}>No conditions added yet</span>
              )}
              {conditions.map(c => (
                <div key={c.id} style={chipStyle}>
                  {c.conditionName}
                  <button onClick={() => handleRemoveCondition(c.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '16px', padding: 0, lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>

            {/* Add condition */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.6)', fontSize: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={useCustom} onChange={e => setUseCustom(e.target.checked)} />
                Enter custom condition
              </label>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              {!useCustom ? (
                <select
                  value={newCondition}
                  onChange={e => setNewCondition(e.target.value)}
                  style={{
                    ...inputStyle, flex: 1,
                    background: 'rgba(255,255,255,0.1)',
                    color: '#ffffff', cursor: 'pointer',
                  }}
                >
                  <option value="">Select a condition...</option>
                  {CONDITIONS.map(c => <option key={c} value={c} style={{ background: '#2a2a2a', color: '#ffffff' }}>{c}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Crohn's Disease, PCOS, Gout..."
                  value={customCondition}
                  onChange={e => setCustomCondition(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCondition()}
                  style={{ ...inputStyle, flex: 1 }}
                />
              )}
              <button onClick={handleAddCondition} style={btnStyle('#7dd97f')}>ADD</button>
            </div>
          </div>
        )}

        {/* AVOIDANCES TAB */}
        {activeTab === 'avoidances' && (
          <div style={glass}>
            <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
              AVOIDANCES & RESTRICTIONS
            </h2>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
              These ingredients are flagged across ALL features — grocery scanning, restaurant finder, recipes and meal planning
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              {['Grocery Scanner', 'Restaurant Finder', 'Recipes', 'Meal Planner'].map(f => (
                <span key={f} style={{ padding: '4px 12px', background: 'rgba(232,196,154,0.1)', border: '1px solid rgba(232,196,154,0.2)', borderRadius: '20px', color: 'rgba(232,196,154,0.7)', fontSize: '11px' }}>{f}</span>
              ))}
            </div>

            {/* Existing avoidances */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px', minHeight: '40px' }}>
              {avoidances.length === 0 && (
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', fontStyle: 'italic' }}>No ingredients added yet</span>
              )}
              {avoidances.map(a => (
                <div key={a.id} style={{ ...chipStyle, borderColor: 'rgba(255,107,53,0.4)', color: '#ff9966' }}>
                  {a.ingredientName}
                  <button onClick={() => handleRemoveAvoidance(a.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '16px', padding: 0, lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>

            {/* Add avoidance */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="e.g. high fructose corn syrup, sodium, gluten..."
                value={newAvoidance}
                onChange={e => setNewAvoidance(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddAvoidance()}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button onClick={handleAddAvoidance} style={btnStyle('#7dd97f')}>ADD</button>
            </div>

            {/* Quick links */}
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ margin: '0 0 12px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>QUICK ACCESS</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Grocery Scanner', path: '/grocery' },
                  { label: 'Restaurant Finder', path: '/restaurant' },
                  { label: 'Recipes', path: '/recipes' },
                  { label: 'Meal Planner', path: '/meal-planner' },
                ].map(link => (
                  <button key={link.path} onClick={() => navigate(link.path)} style={btnStyle()}>
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MEDICATIONS TAB */}
        {activeTab === 'medications' && (
          <div style={glass}>
            <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
              MEDICATIONS & FOOD INTERACTIONS
            </h2>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
              Your medications are cross-referenced against your ingredient avoidances to flag dangerous interactions
            </p>

            {/* Add medication form */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '14px' }}>ADD MEDICATION</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder="Medication name (e.g. Metformin)..."
                  value={newMedName}
                  onChange={e => setNewMedName(e.target.value)}
                  style={{ ...inputStyle, flex: 2, minWidth: '180px' }}
                />
                <input
                  type="text"
                  placeholder="Dosage (e.g. 500mg)..."
                  value={newMedDosage}
                  onChange={e => setNewMedDosage(e.target.value)}
                  style={{ ...inputStyle, flex: 1, minWidth: '120px' }}
                />
                <input
                  type="text"
                  placeholder="Frequency (e.g. Twice daily)..."
                  value={newMedFrequency}
                  onChange={e => setNewMedFrequency(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddMedication()}
                  style={{ ...inputStyle, flex: 1, minWidth: '140px' }}
                />
                <button onClick={handleAddMedication} style={btnStyle('#7dd97f')}>ADD</button>
              </div>
            </div>

            {/* Medications list */}
            {medications.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px', color: 'rgba(255,255,255,0.3)' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>💊</div>
                <p>No medications added yet.</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {medications.map(med => {
                const interaction = getFoodInteractions(med?.medicationName);
                const conflicts = checkAvoidanceConflicts(med?.medicationName, avoidances);
                return (
                  <div key={med.id} style={{
                    padding: '20px',
                    background: conflicts.length > 0 ? 'rgba(255,107,107,0.08)' : interaction ? 'rgba(240,192,64,0.06)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${conflicts.length > 0 ? 'rgba(255,107,107,0.3)' : interaction ? 'rgba(240,192,64,0.2)' : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: '8px',
                  }}>
                    {/* Medication header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{ fontSize: '16px', color: '#ffffff', fontWeight: '600', marginBottom: '4px' }}>
                          {med.medicationName}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          {med.dosage && (
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                              {med.dosage}
                            </span>
                          )}
                          {med.frequency && (
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                              {med.frequency}
                            </span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => handleRemoveMedication(med.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,107,107,0.6)', cursor: 'pointer', fontSize: '18px' }}>×</button>
                    </div>

                    {/* Conflicts with current avoidances */}
                    {conflicts.length > 0 && (
                      <div style={{ background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '6px', padding: '12px', marginBottom: '12px' }}>
                        <div style={{ fontSize: '11px', color: '#ff6b6b', letterSpacing: '2px', marginBottom: '8px', fontWeight: '600' }}>
                          ⚠ CONFLICT WITH YOUR AVOIDANCES
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,200,200,0.8)', marginBottom: '8px' }}>
                          The following ingredients in your avoidances list can interact dangerously with {med.medicationName}:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {conflicts.map((c, i) => (
                            <span key={i} style={{ padding: '3px 10px', background: 'rgba(255,107,107,0.25)', border: '1px solid rgba(255,107,107,0.4)', borderRadius: '12px', color: '#ff9999', fontSize: '11px' }}>
                              {c.ingredientName}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* General food interaction warnings */}
                    {interaction && (
                      <div style={{ background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.25)', borderRadius: '6px', padding: '12px' }}>
                        <div style={{ fontSize: '11px', color: '#f0c040', letterSpacing: '2px', marginBottom: '8px', fontWeight: '600' }}>
                          ⚠ KNOWN FOOD INTERACTIONS
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,220,100,0.8)', marginBottom: '10px', fontStyle: 'italic' }}>
                          {interaction.warning}
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '6px', letterSpacing: '1px' }}>
                          FOODS TO AVOID WITH {med.medicationName.toUpperCase()}:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {interaction.flags.map((flag, i) => (
                            <span key={i} style={{ padding: '3px 10px', background: 'rgba(240,192,64,0.12)', border: '1px solid rgba(240,192,64,0.25)', borderRadius: '12px', color: '#f0c040', fontSize: '11px' }}>
                              {flag}
                            </span>
                          ))}
                        </div>
                        <div style={{ marginTop: '12px', fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>
                          ⚕ Always consult your healthcare provider before making dietary changes
                        </div>
                      </div>
                    )}

                    {/* No known interactions */}
                    {!interaction && (
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
                        ✓ No major food interactions found in our database for this medication
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            {medications.length > 0 && (
              <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', marginBottom: '8px' }}>MEDICATION SUMMARY</div>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', color: '#ffffff' }}>{medications.length}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>MEDICATIONS</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', color: '#f0c040' }}>{medications.filter(m => getFoodInteractions(m?.medicationName)).length}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>WITH FOOD INTERACTIONS</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', color: '#ff6b6b' }}>{medications.filter(m => checkAvoidanceConflicts(m?.medicationName, avoidances).length > 0).length}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>CONFLICT WITH AVOIDANCES</div>
                  </div>
                </div>
                <div style={{ marginTop: '12px', fontSize: '10px', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>
                  ⚕ This information is for reference only. Always consult your pharmacist or physician about food-drug interactions specific to your health situation.
                </div>
              </div>
            )}
          </div>
        )}

        {/* SAVED HISTORY TAB */}
        {activeTab === 'saved' && (() => {
          const SOURCE_BADGE = {
            Restaurant: { label: 'RESTAURANT', bg: 'rgba(74,159,212,0.2)',  border: 'rgba(74,159,212,0.5)',  color: '#4a9fd4' },
            Recipe:     { label: 'RECIPE',      bg: 'rgba(162,155,254,0.2)', border: 'rgba(162,155,254,0.5)', color: '#a29bfe' },
            Barcode:    { label: 'BARCODE',      bg: 'rgba(255,107,53,0.2)',  border: 'rgba(255,107,53,0.5)',  color: '#ff6b35' },
            Grocery:    { label: 'GROCERY',      bg: 'rgba(93,187,99,0.2)',   border: 'rgba(93,187,99,0.5)',   color: '#5dbb63' },
          };
          const getSource = (item) => {
            const s = item.itemSource;
            if (!s || s === '' || s === 'Grocery') return 'Grocery';
            return s;
          };
          const FILTERS = ['All', 'Restaurants', 'Grocery', 'Barcode', 'Recipe'];
          const filteredItems = savedItems.filter(item => {
            if (savedFilter === 'All') return true;
            if (savedFilter === 'Restaurants') return item.itemSource === 'Restaurant';
            if (savedFilter === 'Grocery') return !item.itemSource || item.itemSource === '' || item.itemSource === 'Grocery';
            return item.itemSource === savedFilter;
          });
          return (
            <div style={glass}>
              <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
                SAVED HISTORY
              </h2>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
                All products, restaurants, and recipes you have previously scanned or saved
              </p>

              {/* Filter bar */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {FILTERS.map(f => (
                  <button
                    key={f}
                    onClick={() => setSavedFilter(f)}
                    style={{
                      padding: '7px 16px', borderRadius: '4px', cursor: 'pointer',
                      fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1.5px',
                      background: savedFilter === f ? 'rgba(232,196,154,0.2)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${savedFilter === f ? 'rgba(232,196,154,0.5)' : 'rgba(255,255,255,0.15)'}`,
                      color: savedFilter === f ? '#e8c49a' : 'rgba(255,255,255,0.45)',
                      transition: 'all 0.15s ease',
                    }}
                  >{f}</button>
                ))}
              </div>

              {filteredItems.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}>
                  <p style={{ marginBottom: '16px' }}>
                    {savedItems.length === 0 ? 'No saved items yet. Start scanning products!' : `No ${savedFilter.toLowerCase()} saved yet.`}
                  </p>
                  {savedItems.length === 0 && (
                    <button onClick={() => navigate('/grocery')} style={btnStyle()}>GO TO GROCERY SCANNER</button>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
                {filteredItems.map(item => {
                  const src = getSource(item);
                  const badge = SOURCE_BADGE[src] || SOURCE_BADGE.Grocery;
                  const vColor = verdictColor(item.safetyVerdict);
                  return (
                    <div key={item.id} style={{
                      padding: '16px', background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                            <span style={{ fontSize: '14px', color: '#ffffff' }}>{item.itemName}</span>
                            <span style={{
                              padding: '2px 8px', borderRadius: '10px', fontSize: '9px', letterSpacing: '1px',
                              background: badge.bg, border: `1px solid ${badge.border}`, color: badge.color,
                              flexShrink: 0,
                            }}>{badge.label}</span>
                          </div>
                          {item.brandOrRestaurant && (
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>{item.brandOrRestaurant}</div>
                          )}
                          {item.savedAt && (
                            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>
                              {new Date(item.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          )}
                          {item.matchedTriggers && (
                            <div style={{ fontSize: '11px', color: 'rgba(255,107,53,0.8)', marginTop: '4px' }}>
                              Flagged: {item.matchedTriggers}
                            </div>
                          )}
                          {src === 'Restaurant' && item.ingredients && (
                            <div style={{ marginTop: '8px' }}>
                              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '1.5px', marginBottom: '5px' }}>SAFE MENU ITEMS</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {item.ingredients.split(', ').filter(Boolean).map((menuItem, idx) => (
                                  <span key={idx} style={{ padding: '2px 8px', background: 'rgba(93,187,99,0.12)', border: '1px solid rgba(93,187,99,0.25)', borderRadius: '10px', color: '#7dd97f', fontSize: '10px' }}>
                                    {menuItem}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                          <span style={{
                            padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                            color: vColor, border: `1px solid ${vColor}`, background: `${vColor}22`,
                          }}>
                            {item.safetyVerdict || 'Unknown'}
                          </span>
                          <button
                            onClick={() => handleRemoveSavedItem(item.id)}
                            style={{ background: 'none', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '4px', color: 'rgba(255,107,107,0.7)', cursor: 'pointer', fontSize: '11px', padding: '4px 10px', fontFamily: 'Georgia, serif', letterSpacing: '1px' }}
                          >
                            REMOVE
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ACCOUNT TAB */}
        {activeTab === 'account' && (
          <div style={glass}>
            <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
              ACCOUNT SETTINGS
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
              Manage your account information
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Username */}
              <div>
                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>USERNAME</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    disabled={!editingUsername}
                    style={{ ...inputStyle, flex: 1, opacity: editingUsername ? 1 : 0.6 }}
                  />
                  <button onClick={() => setEditingUsername(!editingUsername)} style={btnStyle()}>
                    {editingUsername ? 'CANCEL' : 'EDIT'}
                  </button>
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>EMAIL</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    disabled={!editingEmail}
                    style={{ ...inputStyle, flex: 1, opacity: editingEmail ? 1 : 0.6 }}
                  />
                  <button onClick={() => setEditingEmail(!editingEmail)} style={btnStyle()}>
                    {editingEmail ? 'CANCEL' : 'EDIT'}
                  </button>
                </div>
              </div>

              {/* Password */}
              <div>
                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>PASSWORD</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={(() => { try { return JSON.parse(localStorage.getItem('user'))?.password || ''; } catch { return ''; } })() || '••••••••'}
                    readOnly
                    disabled
                    style={{ ...inputStyle, flex: 1, opacity: 0.65, cursor: 'default', letterSpacing: showPassword ? '0.5px' : '4px' }}
                  />
                  <button
                    onClick={() => setShowPassword(p => !p)}
                    style={{ ...btnStyle(), padding: '10px 14px', fontSize: '18px', letterSpacing: 0, lineHeight: 1, flexShrink: 0 }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', lineHeight: '1.6' }}>
                  For security purposes your password is encrypted and cannot be displayed in plain text. Contact support to reset your password.
                </p>
              </div>

              {/* Role */}
              <div>
                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>ROLE</label>
                <div style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}>{user?.role}</div>
              </div>

              {/* Danger Zone */}
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,107,107,0.2)' }}>
                <p style={{ margin: '0 0 12px', fontSize: '11px', color: 'rgba(255,107,107,0.6)', letterSpacing: '2px' }}>ACCOUNT ACTIONS</p>
                <button
                  onClick={() => { localStorage.clear(); navigate('/'); }}
                  style={{ padding: '10px 20px', background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '1px' }}
                >
                  LOG OUT
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
    </div>
  );
}