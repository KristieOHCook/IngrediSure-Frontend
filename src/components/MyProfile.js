import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAccessibility } from '../AccessibilityContext';
import Toast from './Toast';

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
  const { language } = useAccessibility();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('conditions');
  const [conditions, setConditions] = useState([]);
  const [avoidances, setAvoidances] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [newCondition, setNewCondition] = useState('');
  const [customCondition, setCustomCondition] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [newAvoidance, setNewAvoidance] = useState('');
  const [medications, setMedications] = useState([]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFrequency, setNewMedFrequency] = useState('');
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/'); return; }
    const parsed = JSON.parse(stored);
    setUser(parsed);
    setNewUsername(parsed.username);
    setNewEmail(parsed.email || '');
    loadData(parsed);
  }, [navigate]);

  const headers = (u) => ({ Authorization: `Bearer ${u.token}` });

  const loadData = async (u) => {
    try {
      const [condRes, avoRes, savedRes, medRes] = await Promise.all([
        axios.get(`${API}/conditions/user/${u.userId}`, { headers: headers(u) }),
        axios.get(`${API}/avoidances/user/${u.userId}`, { headers: headers(u) }),
        axios.get(`${API}/saved-items/user/${u.userId}`, { headers: headers(u) }),
        axios.get(`${API}/medications/user/${u.userId}`, { headers: headers(u) }),
      ]);
      setConditions(condRes.data || []);
      setAvoidances(avoRes.data || []);
      setSavedItems(savedRes.data || []);
      setMedications(medRes.data || []);
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
        conditionName: conditionToAdd,
        userId: user.userId,
      }, { headers: headers(user) });
      setConditions(prev => [...prev, res.data]);
      setNewCondition('');
      setCustomCondition('');
      showToast('Condition added! ✓', 'success');
    } catch (err) { showToast('Error adding condition.', 'error'); }
  };

  const removeCondition = async (id) => {
    try {
      await axios.delete(`${API}/conditions/${id}`, { headers: headers(user) });
      setConditions(prev => prev.filter(c => c.id !== id));
      showToast('Condition removed.', 'delete');
    } catch (err) { showToast('Error removing condition.', 'error'); }
  };

  const addAvoidance = async () => {
    if (!newAvoidance.trim()) return;
    try {
      const res = await axios.post(`${API}/avoidances`, {
        ingredientName: newAvoidance.trim(),
        userId: user.userId,
      }, { headers: headers(user) });
      setAvoidances(prev => [...prev, res.data]);
      setNewAvoidance('');
      showToast('Ingredient added! ✓', 'success');
    } catch (err) { showToast('Error adding ingredient.', 'error'); }
  };

  const removeAvoidance = async (id) => {
    try {
      await axios.delete(`${API}/avoidances/${id}`, { headers: headers(user) });
      setAvoidances(prev => prev.filter(a => a.id !== id));
      showToast('Ingredient removed.', 'delete');
    } catch (err) { showToast('Error removing ingredient.', 'error'); }
  };

  // Food-drug interaction database
  const FOOD_DRUG_INTERACTIONS = {
    'Warfarin': { flags: ['vitamin k', 'kale', 'spinach', 'broccoli', 'brussels sprouts', 'green tea', 'grapefruit', 'alcohol'], warning: 'Vitamin K rich foods and grapefruit can reduce effectiveness' },
    'Metformin': { flags: ['alcohol', 'refined sugar', 'white bread', 'white rice', 'soda', 'candy', 'high fructose corn syrup'], warning: 'High sugar and alcohol can worsen blood sugar control' },
    'Lisinopril': { flags: ['potassium', 'banana', 'orange', 'salt substitute', 'spinach', 'avocado'], warning: 'High potassium foods can cause dangerous potassium levels' },
    'Atorvastatin': { flags: ['grapefruit', 'grapefruit juice', 'alcohol'], warning: 'Grapefruit significantly increases medication levels in blood' },
    'Simvastatin': { flags: ['grapefruit', 'grapefruit juice', 'alcohol', 'large amounts of niacin'], warning: 'Grapefruit can cause serious muscle damage with this medication' },
    'Levothyroxine': { flags: ['soy', 'calcium', 'high fiber', 'walnuts', 'coffee', 'cottonseed meal'], warning: 'These foods can reduce absorption — take medication on empty stomach' },
    'Clopidogrel': { flags: ['grapefruit', 'alcohol', 'vitamin e', 'fish oil', 'garlic', 'ginger'], warning: 'These can increase bleeding risk' },
    'Amlodipine': { flags: ['grapefruit', 'grapefruit juice'], warning: 'Grapefruit can increase medication levels dangerously' },
    'Metoprolol': { flags: ['alcohol', 'caffeine'], warning: 'Alcohol and caffeine can interfere with heart rate control' },
    'Sertraline': { flags: ['alcohol', 'grapefruit', 'tyramine', 'aged cheese', 'cured meats', 'sauerkraut'], warning: 'Alcohol worsens depression; tyramine can cause dangerous blood pressure spikes' },
    'Fluoxetine': { flags: ['alcohol', 'grapefruit', 'tyramine'], warning: 'Alcohol and grapefruit can increase side effects' },
    'Alprazolam': { flags: ['alcohol', 'grapefruit', 'caffeine'], warning: 'Alcohol dramatically increases sedation risk' },
    'Gabapentin': { flags: ['alcohol', 'magnesium'], warning: 'Alcohol increases dizziness and sedation' },
    'Prednisone': { flags: ['sodium', 'salt', 'alcohol', 'calcium', 'potassium', 'sugar'], warning: 'Avoid high sodium — increases fluid retention; take calcium supplements' },
    'Furosemide': { flags: ['licorice', 'alcohol', 'sodium', 'salt'], warning: 'Licorice can reduce effectiveness; watch sodium intake' },
    'Spironolactone': { flags: ['potassium', 'banana', 'orange', 'salt substitute', 'avocado', 'coconut water'], warning: 'High potassium foods can cause dangerous potassium levels' },
    'Ciprofloxacin': { flags: ['dairy', 'milk', 'yogurt', 'cheese', 'calcium', 'antacids', 'iron', 'caffeine'], warning: 'Dairy and calcium reduce absorption significantly' },
    'Doxycycline': { flags: ['dairy', 'milk', 'yogurt', 'cheese', 'calcium', 'iron', 'antacids'], warning: 'Dairy reduces absorption — take with water only' },
    'Amoxicillin': { flags: ['alcohol'], warning: 'Alcohol can reduce effectiveness and increase side effects' },
    'Ibuprofen': { flags: ['alcohol', 'sodium', 'salt'], warning: 'Alcohol increases stomach bleeding risk' },
    'Aspirin': { flags: ['alcohol', 'vitamin e', 'fish oil', 'garlic', 'ginger', 'grapefruit'], warning: 'Increases bleeding risk with alcohol and blood thinning supplements' },
    'Insulin': { flags: ['alcohol', 'refined sugar', 'high fructose corn syrup', 'white bread', 'white rice', 'soda', 'candy'], warning: 'Alcohol can cause dangerous blood sugar drops; high sugar spikes glucose' },
    'Glipizide': { flags: ['alcohol', 'refined sugar', 'high fructose corn syrup'], warning: 'Alcohol can cause dangerous low blood sugar' },
    'Hydrochlorothiazide': { flags: ['licorice', 'alcohol', 'sodium', 'potassium'], warning: 'Monitor potassium levels; avoid licorice' },
    'Digoxin': { flags: ['licorice', 'high fiber', 'bran', 'St Johns Wort', 'caffeine'], warning: 'Licorice and high fiber can reduce effectiveness dangerously' },
  };

  const getFoodInteractions = (medName) => {
    const key = Object.keys(FOOD_DRUG_INTERACTIONS).find(k =>
      medName.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(medName.toLowerCase())
    );
    return key ? FOOD_DRUG_INTERACTIONS[key] : null;
  };

  const checkAvoidanceConflicts = (medName) => {
    const interaction = getFoodInteractions(medName);
    if (!interaction) return [];
    return avoidances.filter(a =>
      interaction.flags.some(flag =>
        a.ingredientName.toLowerCase().includes(flag.toLowerCase()) ||
        flag.toLowerCase().includes(a.ingredientName.toLowerCase())
      )
    );
  };

  const addMedication = async () => {
    if (!newMedName.trim()) return;
    try {
      const res = await axios.post(`${API}/medications`, {
        userId: user.userId,
        medicationName: newMedName.trim(),
        dosage: newMedDosage.trim(),
        frequency: newMedFrequency.trim(),
      }, { headers: headers(user) });
      setMedications(prev => [...prev, res.data]);
      setNewMedName('');
      setNewMedDosage('');
      setNewMedFrequency('');
      showToast('Medication added! ✓', 'success');
    } catch (err) { showToast('Error adding medication.', 'error'); }
  };

  const removeMedication = async (id) => {
    try {
      await axios.delete(`${API}/medications/${id}`, { headers: headers(user) });
      setMedications(prev => prev.filter(m => m.id !== id));
      showToast('Medication removed.', 'delete');
    } catch (err) { showToast('Error removing medication.', 'error'); }
  };

  const removeSavedItem = async (id) => {
    try {
      await axios.delete(`${API}/saved-items/${id}`, { headers: headers(user) });
      setSavedItems(prev => prev.filter(s => s.id !== id));
      showToast('Item removed.', 'delete');
    } catch (err) { showToast('Error removing item.', 'error'); }
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
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(232,196,154,0.2)', border: '2px solid rgba(232,196,154,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px',
          }}>👤</div>
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
            { label: 'CONDITIONS', value: conditions.length, icon: '🏥' },
            { label: 'AVOIDANCES', value: avoidances.length, icon: '🚫' },
            { label: 'MEDICATIONS', value: medications.length, icon: '💊' },
            { label: 'SAVED SCANS', value: savedItems.length, icon: '📋' },
          ].map(stat => (
            <div key={stat.label} style={{
              ...glass, flex: 1, minWidth: '120px', textAlign: 'center', padding: '16px',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>{stat.icon}</div>
              <div style={{ fontSize: '28px', color: '#e8c49a', fontWeight: '400' }}>{stat.value}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { key: 'conditions', label: '🏥 Health Conditions' },
            { key: 'avoidances', label: '🚫 Avoidances & Restrictions' },
            { key: 'medications', label: '💊 Medications' },
            { key: 'saved', label: '📋 Saved Scans' },
            { key: 'account', label: '⚙️ Account' },
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
                  <button onClick={() => removeCondition(c.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '16px', padding: 0, lineHeight: 1 }}>×</button>
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
                  onKeyDown={e => e.key === 'Enter' && addCondition()}
                  style={{ ...inputStyle, flex: 1 }}
                />
              )}
              <button onClick={addCondition} style={btnStyle('#7dd97f')}>ADD</button>
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
              {['🛒 Grocery Scanner', '🍽 Restaurant Finder', '🍳 Recipes', '📅 Meal Planner'].map(f => (
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
                  🚫 {a.ingredientName}
                  <button onClick={() => removeAvoidance(a.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '16px', padding: 0, lineHeight: 1 }}>×</button>
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
                onKeyDown={e => e.key === 'Enter' && addAvoidance()}
                style={{ ...inputStyle, flex: 1 }}
              />
              <button onClick={addAvoidance} style={btnStyle('#7dd97f')}>ADD</button>
            </div>

            {/* Quick links */}
            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <p style={{ margin: '0 0 12px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px' }}>QUICK ACCESS</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { label: '🔍 Grocery Scanner', path: '/grocery' },
                  { label: '🍽 Restaurant Finder', path: '/restaurant' },
                  { label: '🍳 Recipes', path: '/recipes' },
                  { label: '📅 Meal Planner', path: '/meal-planner' },
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
                  onKeyDown={e => e.key === 'Enter' && addMedication()}
                  style={{ ...inputStyle, flex: 1, minWidth: '140px' }}
                />
                <button onClick={addMedication} style={btnStyle('#7dd97f')}>ADD</button>
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
                const interaction = getFoodInteractions(med.medicationName);
                const conflicts = checkAvoidanceConflicts(med.medicationName);
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
                          💊 {med.medicationName}
                        </div>
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          {med.dosage && (
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                              📏 {med.dosage}
                            </span>
                          )}
                          {med.frequency && (
                            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                              🕐 {med.frequency}
                            </span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => removeMedication(med.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,107,107,0.6)', cursor: 'pointer', fontSize: '18px' }}>🗑</button>
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
                              🚫 {c.ingredientName}
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
                    <div style={{ fontSize: '24px', color: '#f0c040' }}>{medications.filter(m => getFoodInteractions(m.medicationName)).length}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>WITH FOOD INTERACTIONS</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', color: '#ff6b6b' }}>{medications.filter(m => checkAvoidanceConflicts(m.medicationName).length > 0).length}</div>
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

        {/* SAVED SCANS TAB */}
        {activeTab === 'saved' && (
          <div style={glass}>
            <h2 style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
              SAVED SAFETY CHECKS
            </h2>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>
              All products and menu items you have previously scanned
            </p>

            {savedItems.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
                <p>No saved scans yet. Start scanning products!</p>
                <button onClick={() => navigate('/grocery')} style={btnStyle()}>GO TO GROCERY SCANNER</button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
              {savedItems.map(item => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px', background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                  flexWrap: 'wrap', gap: '8px',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', color: '#ffffff', marginBottom: '4px' }}>{item.itemName}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{item.brandOrRestaurant} • {item.itemSource}</div>
                    {item.matchedTriggers && (
                      <div style={{ fontSize: '11px', color: 'rgba(255,107,53,0.8)', marginTop: '4px' }}>
                        ⚠ {item.matchedTriggers}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                      color: verdictColor(item.safetyVerdict),
                      border: `1px solid ${verdictColor(item.safetyVerdict)}`,
                      background: `${verdictColor(item.safetyVerdict)}22`,
                    }}>
                      {item.safetyVerdict}
                    </span>
                    <button onClick={() => removeSavedItem(item.id)} style={{ background: 'none', border: 'none', color: 'rgba(255,107,107,0.6)', cursor: 'pointer', fontSize: '18px' }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}