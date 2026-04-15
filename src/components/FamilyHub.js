import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingScreen from './LoadingScreen';

const API = 'http://localhost:8080/api';
const BG = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=90';

const RELATIONSHIPS = [
  'Myself', 'Spouse / Partner', 'Child', 'Parent',
  'Grandparent', 'Grandchild', 'Sibling', 'Other Family Member',
];

const AVATAR_COLORS = [
  '#e8c49a', '#7dd97f', '#74b9ff', '#fd79a8',
  '#a29bfe', '#ff7675', '#55efc4', '#fdcb6e',
];

const COMMON_CONDITIONS = [
  'Type 2 Diabetes', 'Type 1 Diabetes', 'Hypertension',
  'Celiac Disease', 'Kidney Disease', 'Heart Disease',
  'Gluten Intolerance', 'Lactose Intolerance', 'Nut Allergy',
  'Shellfish Allergy', 'Crohn\'s Disease', 'IBS',
  'High Cholesterol', 'GERD / Acid Reflux', 'Thyroid Disease',
];

export default function FamilyHub() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [message, setMessage] = useState('');
  const [activeView, setActiveView] = useState('hub');

  // Form state
  const [memberName, setMemberName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [age, setAge] = useState('');
  const [conditions, setConditions] = useState([]);
  const [customCondition, setCustomCondition] = useState('');
  const [avoidances, setAvoidances] = useState('');
  const [avatarColor, setAvatarColor] = useState('#e8c49a');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/'); return; }
    const parsed = JSON.parse(stored);
    if (!parsed?.token) { navigate('/'); return; }
    setUser(parsed);
    loadMembers(parsed);
  }, [navigate]);

  const loadMembers = async (u) => {
    try {
      const res = await axios.get(
        `${API}/family/members/${u.userId}`,
        { headers: { Authorization: `Bearer ${u.token}` } }
      );
      setMembers(res.data || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const resetForm = () => {
    setMemberName(''); setRelationship(''); setAge('');
    setConditions([]); setCustomCondition('');
    setAvoidances(''); setAvatarColor('#e8c49a');
    setEditingMember(null);
  };

  const toggleCondition = (condition) => {
    setConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const addCustomCondition = () => {
    if (!customCondition.trim()) return;
    setConditions(prev => [...prev, customCondition.trim()]);
    setCustomCondition('');
  };

  const saveMember = async () => {
    if (!memberName.trim() || !relationship) return;
    const payload = {
      memberName, relationship,
      age: age ? parseInt(age) : null,
      conditions: conditions.join(', '),
      avoidances, avatarColor,
    };
    try {
      if (editingMember) {
        await axios.put(`${API}/family/members/${editingMember.id}`, payload,
          { headers: { Authorization: `Bearer ${user.token}` } });
        setMembers(prev => prev.map(m =>
          m.id === editingMember.id ? { ...m, ...payload } : m
        ));
        setMessage(`${memberName}'s profile updated!`);
      } else {
        const res = await axios.post(`${API}/family/members`, payload,
          { headers: { Authorization: `Bearer ${user.token}` } });
        setMembers(prev => [...prev, res.data]);
        setMessage(`${memberName} added to your family hub!`);
      }
      resetForm();
      setShowAddForm(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { console.error(err); }
  };

  const deleteMember = async (id, name) => {
    try {
      await axios.delete(`${API}/family/members/${id}`,
        { headers: { Authorization: `Bearer ${user.token}` } });
      setMembers(prev => prev.filter(m => m.id !== id));
      if (selectedMember?.id === id) setSelectedMember(null);
      setMessage(`${name} removed from family hub.`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { console.error(err); }
  };

  const startEdit = (member) => {
    setEditingMember(member);
    setMemberName(member.memberName);
    setRelationship(member.relationship);
    setAge(member.age?.toString() || '');
    setConditions(member.conditions ? member.conditions.split(', ').filter(Boolean) : []);
    setAvoidances(member.avoidances || '');
    setAvatarColor(member.avatarColor || '#e8c49a');
    setShowAddForm(true);
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const sectionStyle = {
    background: 'rgba(255,255,255,0.07)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.13)',
    borderRadius: '4px', padding: '24px 28px',
    marginBottom: '20px',
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '4px', color: '#ffffff',
    fontFamily: 'Georgia, serif', fontSize: '13px',
    outline: 'none', boxSizing: 'border-box',
  };

  if (loading) return <LoadingScreen bg={BG} />;

  return (
    <div className="page-enter" style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.65) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', letterSpacing: '3px', marginBottom: '6px' }}>INGREDISURE</div>
            <h1 style={{ margin: 0, fontSize: '34px', fontWeight: '400', color: '#ffffff', letterSpacing: '1px' }}>Family Hub</h1>
            <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '13px', fontStyle: 'italic', letterSpacing: '0.5px' }}>
              One intelligent hub for every member of your household
            </p>
          </div>
          <button onClick={() => navigate('/dashboard')}
            style={{ background: 'transparent', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 24px', borderRadius: '2px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px' }}>
            ← DASHBOARD
          </button>
        </div>

        {/* Why family hub */}
        <div style={{ ...sectionStyle, background: 'rgba(232,196,154,0.08)', border: '1px solid rgba(232,196,154,0.2)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ width: '48px', height: '48px', border: '1px solid rgba(232,196,154,0.4)', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#e8c49a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                  <path d="M16 3.13a4 4 0 010 7.75"/>
                </svg>
              </div>
            <div>
              <div style={{ fontSize: '11px', color: '#e8c49a', letterSpacing: '2px', marginBottom: '8px' }}>YOUR FAMILY. YOUR HUB.</div>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', lineHeight: '1.9', margin: '0 0 10px' }}>
                Add every member of your household — from your youngest child with a food allergy to your grandparent managing multiple health conditions. Each family member gets their own health profile with personalized safety checks.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: '1.9', margin: 0, fontStyle: 'italic' }}>
                When you scan groceries, order from a restaurant, or plan meals — switch between family members instantly to get the right safety verdict for each person.
              </p>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div style={{ background: 'rgba(93,187,99,0.2)', border: '1px solid rgba(93,187,99,0.4)', borderRadius: '4px', padding: '12px 20px', marginBottom: '20px', color: '#7dd97f', fontSize: '13px' }}>
            {message}
          </div>
        )}

        {/* Add member button */}
        {!showAddForm && (
          <button onClick={() => { resetForm(); setShowAddForm(true); }}
            style={{ width: '100%', padding: '16px', background: 'rgba(232,196,154,0.15)', border: '1px solid rgba(232,196,154,0.4)', borderRadius: '4px', color: '#e8c49a', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '13px', letterSpacing: '2px', marginBottom: '24px' }}>
            + ADD FAMILY MEMBER
          </button>
        )}

        {/* Add/Edit form */}
        {showAddForm && (
          <div style={{ ...sectionStyle, border: '1px solid rgba(232,196,154,0.35)', marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', color: '#e8c49a', letterSpacing: '3px', marginBottom: '20px' }}>
              {editingMember ? `EDITING — ${editingMember.memberName.toUpperCase()}` : 'ADD FAMILY MEMBER'}
            </div>

            {/* Avatar color picker */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', letterSpacing: '2px', marginBottom: '10px' }}>CHOOSE AVATAR COLOR</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {AVATAR_COLORS.map(color => (
                  <div key={color} onClick={() => setAvatarColor(color)}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', background: color, cursor: 'pointer', border: avatarColor === color ? '3px solid #ffffff' : '2px solid rgba(255,255,255,0.2)', transition: 'all 0.2s', transform: avatarColor === color ? 'scale(1.2)' : 'scale(1)' }} />
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', letterSpacing: '2px', marginBottom: '6px' }}>FULL NAME *</div>
                <input type="text" placeholder="e.g. Sarah, Mom, Baby Jaylen..." value={memberName} onChange={e => setMemberName(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', letterSpacing: '2px', marginBottom: '6px' }}>RELATIONSHIP *</div>
                <select value={relationship} onChange={e => setRelationship(e.target.value)} style={inputStyle}>
                  <option value="">Select...</option>
                  {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', letterSpacing: '2px', marginBottom: '6px' }}>AGE</div>
                <input type="number" placeholder="e.g. 7, 45, 78..." value={age} onChange={e => setAge(e.target.value)} style={inputStyle} min="0" max="120" />
              </div>
            </div>

            {/* Health conditions */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', letterSpacing: '2px', marginBottom: '12px' }}>HEALTH CONDITIONS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                {COMMON_CONDITIONS.map(c => (
                  <button key={c} onClick={() => toggleCondition(c)}
                    style={{ padding: '6px 14px', background: conditions.includes(c) ? 'rgba(93,187,99,0.25)' : 'rgba(255,255,255,0.06)', border: conditions.includes(c) ? '1px solid rgba(93,187,99,0.5)' : '1px solid rgba(255,255,255,0.12)', borderRadius: '2px', color: conditions.includes(c) ? '#7dd97f' : 'rgba(255,255,255,0.75)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '0.5px', transition: 'all 0.2s' }}>
                    {conditions.includes(c) ? '✓ ' : ''}{c}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="Add custom condition..." value={customCondition} onChange={e => setCustomCondition(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomCondition()} style={{ ...inputStyle, flex: 1 }} />
                <button onClick={addCustomCondition}
                  style={{ padding: '11px 20px', background: 'rgba(93,187,99,0.2)', border: '1px solid rgba(93,187,99,0.4)', borderRadius: '4px', color: '#7dd97f', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                  ADD
                </button>
              </div>
              {conditions.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                  {conditions.map(c => (
                    <span key={c} onClick={() => toggleCondition(c)}
                      style={{ padding: '4px 12px', background: 'rgba(93,187,99,0.2)', border: '1px solid rgba(93,187,99,0.4)', borderRadius: '2px', color: '#7dd97f', fontSize: '11px', cursor: 'pointer' }}>
                      {c} ×
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Avoidances */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', letterSpacing: '2px', marginBottom: '6px' }}>INGREDIENTS TO AVOID</div>
              <input type="text" placeholder="e.g. peanuts, shellfish, dairy, gluten, soy..." value={avoidances} onChange={e => setAvoidances(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={saveMember}
                style={{ flex: 1, padding: '13px', background: 'rgba(93,187,99,0.2)', border: '1px solid rgba(93,187,99,0.4)', borderRadius: '4px', color: '#7dd97f', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px' }}>
                {editingMember ? 'SAVE CHANGES' : 'ADD TO FAMILY HUB'}
              </button>
              <button onClick={() => { resetForm(); setShowAddForm(false); }}
                style={{ padding: '13px 24px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '1px' }}>
                CANCEL
              </button>
            </div>
          </div>
        )}

        {/* Family members grid */}
        {members.length === 0 && !showAddForm ? (
          <div style={{ ...sectionStyle, textAlign: 'center', padding: '48px 32px' }}>
            <div style={{ width: '80px', height: '80px', border: '1px solid rgba(232,196,154,0.3)', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', background: 'rgba(232,196,154,0.06)' }}>
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="rgba(232,196,154,0.7)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                <path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '3px', marginBottom: '12px' }}>GET STARTED</div>
            <h2 style={{ color: '#ffffff', fontSize: '22px', fontWeight: '400', margin: '0 0 12px' }}>Build Your Family Hub</h2>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '14px', fontStyle: 'italic', lineHeight: '1.8', maxWidth: '420px', margin: '0 auto 24px' }}>
              Add your family members so IngrediSure can give personalized safety checks for every person in your household — from your youngest to your oldest.
            </p>
            <button onClick={() => { resetForm(); setShowAddForm(true); }}
              style={{ padding: '14px 32px', background: 'rgba(232,196,154,0.2)', border: '1px solid rgba(232,196,154,0.5)', borderRadius: '4px', color: '#e8c49a', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '3px' }}>
              + ADD YOUR FIRST FAMILY MEMBER
            </button>
          </div>
        ) : (
          members.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '16px' }}>
                YOUR FAMILY — {members.length} MEMBER{members.length > 1 ? 'S' : ''}
              </div>

              {/* Member cards grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                {members.map(member => (
                  <div key={member.id}
                    style={{ background: selectedMember?.id === member.id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)', border: selectedMember?.id === member.id ? `2px solid ${member.avatarColor}` : '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onClick={() => setSelectedMember(selectedMember?.id === member.id ? null : member)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: member.avatarColor || '#e8c49a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 'bold', color: 'rgba(0,0,0,0.7)', flexShrink: 0, boxShadow: `0 4px 12px ${member.avatarColor}40` }}>
                        {getInitials(member.memberName)}
                      </div>
                      <div>
                        <div style={{ color: '#ffffff', fontSize: '16px', fontWeight: '600', marginBottom: '2px' }}>{member.memberName}</div>
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontStyle: 'italic' }}>
                          {member.relationship}{member.age ? ` · Age ${member.age}` : ''}
                        </div>
                      </div>
                    </div>

                    {member.conditions && (
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '6px' }}>CONDITIONS</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {member.conditions.split(', ').filter(Boolean).slice(0, 3).map(c => (
                            <span key={c} style={{ padding: '2px 8px', background: 'rgba(116,185,255,0.15)', border: '1px solid rgba(116,185,255,0.3)', borderRadius: '2px', color: '#74b9ff', fontSize: '10px' }}>
                              {c}
                            </span>
                          ))}
                          {member.conditions.split(', ').filter(Boolean).length > 3 && (
                            <span style={{ padding: '2px 8px', color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>
                              +{member.conditions.split(', ').filter(Boolean).length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {member.avoidances && (
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '4px' }}>AVOIDS</div>
                        <div style={{ color: '#ff9999', fontSize: '11px', fontStyle: 'italic' }}>
                          {member.avoidances.split(', ').slice(0, 3).join(', ')}
                          {member.avoidances.split(', ').length > 3 && '...'}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={e => { e.stopPropagation(); startEdit(member); }}
                        style={{ flex: 1, padding: '7px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '2px', color: 'rgba(255,255,255,0.75)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '10px', letterSpacing: '1px' }}>
                        EDIT
                      </button>
                      <button onClick={e => { e.stopPropagation(); deleteMember(member.id, member.memberName); }}
                        style={{ padding: '7px 12px', background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '2px', color: '#ff9999', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '10px' }}>
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected member actions */}
              {selectedMember && (
                <div style={{ ...sectionStyle, border: `1px solid ${selectedMember.avatarColor}40`, background: `rgba(${selectedMember.avatarColor}, 0.05)` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: selectedMember.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 'bold', color: 'rgba(0,0,0,0.7)' }}>
                      {getInitials(selectedMember.memberName)}
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '2px', marginBottom: '2px' }}>CHECK SAFETY FOR</div>
                      <div style={{ color: '#ffffff', fontSize: '18px', fontWeight: '600' }}>{selectedMember.memberName}</div>
                    </div>
                  </div>

                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontStyle: 'italic', marginBottom: '20px', lineHeight: '1.7' }}>
                    Use IngrediSure's features below to check food safety specifically for {selectedMember.memberName}'s health conditions and avoidances. Their profile will be used to generate personalized verdicts.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    {[
                      { label: '🛒 Grocery Scanner', route: '/grocery', desc: 'Search groceries safe for ' + selectedMember.memberName },
                      { label: '🍽 Restaurant Finder', route: '/restaurant', desc: 'Find safe restaurant options' },
                      { label: '📷 Barcode Scanner', route: '/barcode', desc: 'Scan products instantly' },
                      { label: '📋 Recipe Suggestions', route: '/recipes', desc: 'Recipes that work for everyone' },
                      { label: '📅 Meal Planner', route: '/meal-planner', desc: 'Plan meals for the whole family' },
                      { label: '🛍 Grocery Lists', route: '/grocery-lists', desc: 'Build a family shopping list' },
                    ].map(action => (
                      <div key={action.route} onClick={() => navigate(action.route)}
                        style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                      >
                        <div style={{ color: '#ffffff', fontSize: '13px', marginBottom: '4px' }}>{action.label}</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontStyle: 'italic' }}>{action.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        )}

      </div>
    </div>
  );
}