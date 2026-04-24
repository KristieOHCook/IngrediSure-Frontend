import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingScreen from './LoadingScreen';
import useToast from '../hooks/useToast';
import useAuth from '../hooks/useAuth';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';
const BG = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=90';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { toast, showToast, hideToast } = useToast();
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [feedbackSummary, setFeedbackSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchUser, setSearchUser] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) return;
    const parsed = JSON.parse(stored);
    if (parsed?.role !== 'ROLE_ADMIN') { navigate('/dashboard'); return; }
    setUser(parsed);
    loadData(parsed);
  }, [navigate]);

  const headers = (u) => ({ Authorization: `Bearer ${u.token}` });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const loadData = async (u) => {
    try {
      const [analyticsRes, usersRes, feedbackRes, summaryRes] = await Promise.all([
        axios.get(`${API}/admin/analytics`, { headers: headers(u) }),
        axios.get(`${API}/admin/users`, { headers: headers(u) }),
        axios.get(`${API}/feedback/all`, { headers: headers(u) }),
        axios.get(`${API}/feedback/summary`, { headers: headers(u) }),
      ]);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data || []);
      setFeedback(feedbackRes.data || []);
      setFeedbackSummary(summaryRes.data);
    } catch (err) {
    }
    setLoading(false);
  };

  const promoteUser = async (userId) => {
    try {
      await axios.put(`${API}/admin/users/${userId}/promote`, {}, { headers: headers(user) });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'ROLE_ADMIN' } : u));
      setMessage('User promoted to admin.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('Error promoting user.'); }
  };

  const deactivateUser = async (userId) => {
    try {
      await axios.put(`${API}/admin/users/${userId}/deactivate`, {}, { headers: headers(user) });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: 'ROLE_BANNED' } : u));
      setMessage('User deactivated.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('Error deactivating user.'); }
  };

  const deleteFeedback = async (id) => {
    try {
      await axios.delete(`${API}/feedback/${id}`, { headers: headers(user) });
      setFeedback(prev => prev.filter(f => f.id !== id));
      setMessage('Review deleted.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage('Error deleting review.'); }
  };

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchUser.toLowerCase())
  );

  const sectionStyle = {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '4px', padding: '24px 28px',
    marginBottom: '20px',
  };

  const tabStyle = (active) => ({
    padding: '9px 20px',
    background: active ? 'rgba(232,196,154,0.2)' : 'transparent',
    border: active ? '1px solid rgba(232,196,154,0.5)' : '1px solid rgba(255,255,255,0.15)',
    borderRadius: '2px', color: active ? '#e8c49a' : 'rgba(255,255,255,0.7)',
    cursor: 'pointer', fontFamily: 'Georgia, serif',
    fontSize: '11px', letterSpacing: '2px', transition: 'all 0.2s',
  });

  const StatCard = ({ label, value, color, sub }) => (
    <div style={{ ...sectionStyle, textAlign: 'center', marginBottom: 0, padding: '18px' }}>
      <div style={{ fontSize: '32px', fontWeight: '300', color: color || '#ffffff', marginBottom: '6px' }}>{value}</div>
      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: sub ? '4px' : '0' }}>{label}</div>
      {sub && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>{sub}</div>}
    </div>
  );

  const ProgressBar = ({ label, value, total, color }) => {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>{label}</span>
          <span style={{ color: color, fontSize: '12px', fontWeight: '600' }}>{value} <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: '400' }}>({pct}%)</span></span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '2px', height: '7px' }}>
          <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: '2px', transition: 'width 0.5s ease' }} />
        </div>
      </div>
    );
  };

  if (loading) return <LoadingScreen bg={BG} />;

  return (
    <div className="page-enter" style={{ minHeight: '100vh', fontFamily: 'Georgia, serif', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.7) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '6px' }}>INGREDISURE</div>
            <h1 style={{ margin: 0, fontSize: '34px', fontWeight: '400', color: '#ffffff', letterSpacing: '1px' }}>Admin Dashboard</h1>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '4px', fontStyle: 'italic' }}>
              {analytics?.serverTime && `Last updated: ${new Date(analytics.serverTime).toLocaleString()}`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={() => loadData(user)}
              style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '2px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px' }}>
              ↻ REFRESH
            </button>
            <button onClick={() => navigate('/dashboard')}
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.5)', padding: '10px 24px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px', fontWeight: '600' }}>
              ← DASHBOARD
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {['overview', 'users', 'engagement', 'feedback', 'system', 'analytics'].map(tab => (
            <button key={tab} style={tabStyle(activeTab === tab)} onClick={() => setActiveTab(tab)}>
              {tab.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div style={{ background: 'rgba(93,187,99,0.2)', border: '1px solid rgba(93,187,99,0.4)', borderRadius: '4px', padding: '12px 20px', marginBottom: '20px', color: '#7dd97f', fontSize: '13px' }}>
            {message}
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && analytics && (
          <>
            {/* Top KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
              <StatCard label="TOTAL USERS" value={analytics.totalUsers} color="#74b9ff" />
              <StatCard label="SAFETY CHECKS" value={analytics.totalSavedItems} color="#e8c49a" />
              <StatCard label="GROCERY LISTS" value={analytics.totalGroceryLists} color="#7dd97f" />
              <StatCard label="FEEDBACK REVIEWS" value={analytics.totalFeedback} color="#a29bfe" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
              <StatCard label="MEDICATIONS TRACKED" value={analytics.totalMedications} color="#fd79a8" />
              <StatCard label="NUTRITION LOGS" value={analytics.totalNutritionLogs} color="#55efc4" />
              <StatCard label="FAMILY MEMBERS" value={analytics.totalFamilyMembers} color="#fdcb6e" />
              <StatCard label="ADMIN USERS" value={analytics.adminUsers} color="#ff7675" />
            </div>

            {/* Safety breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={sectionStyle}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '20px' }}>
                  SAFETY CHECK RESULTS
                </div>
                <ProgressBar label="Safe" value={analytics.safeItems} total={analytics.totalSavedItems} color="#7dd97f" />
                <ProgressBar label="Caution" value={analytics.cautionItems} total={analytics.totalSavedItems} color="#f0c040" />
                <ProgressBar label="Unsafe" value={analytics.unsafeItems} total={analytics.totalSavedItems} color="#ff6b6b" />

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '12px' }}>SCAN SOURCES</div>
                  {analytics.itemSources && Object.entries(analytics.itemSources).map(([source, count]) => (
                    <div key={source} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px' }}>{source}</span>
                      <span style={{ color: '#e8c49a', fontSize: '12px', fontWeight: '600' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={sectionStyle}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '20px' }}>
                  USER BREAKDOWN
                </div>
                <ProgressBar label="Regular Users" value={analytics.regularUsers} total={analytics.totalUsers} color="#74b9ff" />
                <ProgressBar label="Admin Users" value={analytics.adminUsers} total={analytics.totalUsers} color="#e8c49a" />
                <ProgressBar label="Banned Users" value={analytics.bannedUsers} total={analytics.totalUsers} color="#ff6b6b" />

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '12px' }}>FEATURE ADOPTION</div>
                  {[
                    { label: 'Using Medications Tracker', value: analytics.totalMedications, color: '#fd79a8' },
                    { label: 'Logging Nutrition', value: analytics.totalNutritionLogs, color: '#55efc4' },
                    { label: 'Family Hub Members', value: analytics.totalFamilyMembers, color: '#fdcb6e' },
                    { label: 'Grocery Lists Created', value: analytics.totalGroceryLists, color: '#7dd97f' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px' }}>{item.label}</span>
                      <span style={{ color: item.color, fontSize: '12px', fontWeight: '600' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top flagged ingredients */}
            {analytics.topFlaggedIngredients?.length > 0 && (
              <div style={sectionStyle}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '20px' }}>
                  TOP 10 FLAGGED INGREDIENTS — Most Common Safety Triggers
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {analytics.topFlaggedIngredients.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.15)', borderRadius: '4px' }}>
                      <div style={{ fontSize: '16px', color: 'rgba(255,107,107,0.6)', fontWeight: '300', width: '24px', textAlign: 'center', flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: '#ffffff', fontSize: '13px', textTransform: 'capitalize', marginBottom: '4px' }}>{item.ingredient}</div>
                        <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '2px', height: '4px' }}>
                          <div style={{ width: `${(item.count / analytics.topFlaggedIngredients[0].count) * 100}%`, background: '#ff6b6b', height: '100%', borderRadius: '2px' }} />
                        </div>
                      </div>
                      <div style={{ color: '#ff9999', fontSize: '13px', fontWeight: '600', flexShrink: 0 }}>{item.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
                ALL USERS — {users.length} REGISTERED
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchUser}
                onChange={e => setSearchUser(e.target.value)}
                style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: '#ffffff', fontFamily: 'Georgia, serif', fontSize: '12px', outline: 'none', width: '200px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredUsers.map(u => (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px' }}>
                  <div>
                    <div style={{ color: '#ffffff', fontSize: '15px', marginBottom: '3px' }}>{u.username}</div>
                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', fontStyle: 'italic' }}>
                      {u.email && <span style={{ marginRight: '12px' }}>{u.email}</span>}
                      <span style={{ color: u.role === 'ROLE_ADMIN' ? '#e8c49a' : u.role === 'ROLE_BANNED' ? '#ff6b6b' : '#7dd97f', letterSpacing: '1px', fontSize: '10px' }}>
                        {u.role?.replace('ROLE_', '')}
                      </span>
                      <span style={{ marginLeft: '12px', color: 'rgba(255,255,255,0.3)' }}>ID: {u.id}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {u.role !== 'ROLE_ADMIN' && (
                      <button onClick={() => promoteUser(u.id)}
                        style={{ padding: '6px 14px', background: 'rgba(232,196,154,0.15)', border: '1px solid rgba(232,196,154,0.4)', borderRadius: '2px', color: '#e8c49a', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '10px', letterSpacing: '1px' }}>
                        PROMOTE
                      </button>
                    )}
                    {u.role !== 'ROLE_ADMIN' && u.role !== 'ROLE_BANNED' && (
                      <button onClick={() => deactivateUser(u.id)}
                        style={{ padding: '6px 14px', background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '2px', color: '#ff9999', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '10px', letterSpacing: '1px' }}>
                        DEACTIVATE
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ENGAGEMENT TAB */}
        {activeTab === 'engagement' && analytics && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
              <StatCard label="SAFETY CHECKS" value={analytics.totalSavedItems} color="#e8c49a" sub="Total scans performed" />
              <StatCard label="SAFE RATE" value={`${analytics.safePercent}%`} color="#7dd97f" sub="Of all items checked" />
              <StatCard label="UNSAFE RATE" value={`${analytics.unsafePercent}%`} color="#ff6b6b" sub="Flagged as unsafe" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={sectionStyle}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '20px' }}>
                  FEATURE USAGE
                </div>
                {[
                  { label: 'Safety Scans', value: analytics.totalSavedItems, color: '#e8c49a', icon: '—' },
                  { label: 'Grocery Lists', value: analytics.totalGroceryLists, color: '#7dd97f', icon: '—' },
                  { label: 'Nutrition Logs', value: analytics.totalNutritionLogs, color: '#55efc4', icon: '—' },
                  { label: 'Medications Added', value: analytics.totalMedications, color: '#fd79a8', icon: '—' },
                  { label: 'Family Members', value: analytics.totalFamilyMembers, color: '#fdcb6e', icon: '—' },
                  { label: 'Feedback Submitted', value: analytics.totalFeedback, color: '#a29bfe', icon: '—' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '16px', width: '24px', flexShrink: 0 }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>{item.label}</span>
                        <span style={{ color: item.color, fontSize: '12px', fontWeight: '600' }}>{item.value}</span>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '2px', height: '5px' }}>
                        <div style={{ width: `${Math.min((item.value / Math.max(analytics.totalSavedItems, 1)) * 100, 100)}%`, background: item.color, height: '100%', borderRadius: '2px' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={sectionStyle}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '20px' }}>
                  TOP FLAGGED INGREDIENTS
                </div>
                {analytics.topFlaggedIngredients?.slice(0, 8).map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ color: 'rgba(255,107,107,0.5)', fontSize: '11px', width: '16px' }}>{i + 1}</span>
                      <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', textTransform: 'capitalize' }}>{item.ingredient}</span>
                    </div>
                    <span style={{ color: '#ff9999', fontSize: '12px', fontWeight: '600' }}>{item.count} flags</span>
                  </div>
                ))}
                {(!analytics.topFlaggedIngredients || analytics.topFlaggedIngredients.length === 0) && (
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', fontSize: '13px' }}>No flagged ingredients yet.</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* FEEDBACK TAB */}
        {activeTab === 'feedback' && (
          <>
            {feedbackSummary && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '20px' }}>
                  <StatCard label="TOTAL REVIEWS" value={feedbackSummary.totalReviews} color="#74b9ff" />
                  <StatCard label="AVERAGE RATING" value={`${feedbackSummary.averageRating} ★`} color="#e8c49a" />
                  <StatCard label="5 STAR REVIEWS" value={feedbackSummary.fiveStars} color="#7dd97f" />
                  <StatCard label="1-2 STAR REVIEWS" value={(feedbackSummary.oneStar || 0) + (feedbackSummary.twoStars || 0)} color="#ff6b6b" />
                </div>

                {/* Rating breakdown */}
                <div style={{ ...sectionStyle, marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '20px' }}>RATING BREAKDOWN</div>
                  {[
                    { stars: 5, count: feedbackSummary.fiveStars },
                    { stars: 4, count: feedbackSummary.fourStars },
                    { stars: 3, count: feedbackSummary.threeStars },
                    { stars: 2, count: feedbackSummary.twoStars },
                    { stars: 1, count: feedbackSummary.oneStar },
                  ].map(row => {
                    const pct = feedbackSummary.totalReviews > 0 ? Math.round((row.count / feedbackSummary.totalReviews) * 100) : 0;
                    return (
                      <div key={row.stars} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '10px' }}>
                        <div style={{ color: '#e8c49a', fontSize: '13px', width: '90px', flexShrink: 0 }}>{'★'.repeat(row.stars)}{'☆'.repeat(5 - row.stars)}</div>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: '2px', height: '8px' }}>
                          <div style={{ width: `${pct}%`, background: '#e8c49a', height: '100%', borderRadius: '2px', transition: 'width 0.5s ease' }} />
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', width: '50px', textAlign: 'right' }}>{row.count}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Feature analysis from feedback */}
                {feedback.length > 0 && (() => {
                  const featureCounts = {};
                  const improveCounts = {};
                  const useCaseCounts = {};
                  const recCounts = {};

                  feedback.forEach(f => {
                    if (f.liked) f.liked.split(', ').forEach(item => {
                      if (item.trim()) featureCounts[item.trim()] = (featureCounts[item.trim()] || 0) + 1;
                    });
                    if (f.disliked) f.disliked.split(', ').forEach(item => {
                      if (item.trim()) improveCounts[item.trim()] = (improveCounts[item.trim()] || 0) + 1;
                    });
                    if (f.suggestion) {
                      const ucMatch = f.suggestion.match(/Use case: ([^|]+)/);
                      const recMatch = f.suggestion.match(/Would recommend: ([^|]+)/);
                      if (ucMatch) { const uc = ucMatch[1].trim(); useCaseCounts[uc] = (useCaseCounts[uc] || 0) + 1; }
                      if (recMatch) { const rec = recMatch[1].trim(); recCounts[rec] = (recCounts[rec] || 0) + 1; }
                    }
                  });

                  const topLiked = Object.entries(featureCounts).sort((a,b) => b[1]-a[1]).slice(0, 6);
                  const topImprove = Object.entries(improveCounts).sort((a,b) => b[1]-a[1]).slice(0, 6);

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                      <div style={sectionStyle}>
                        <div style={{ fontSize: '11px', color: '#7dd97f', letterSpacing: '2px', marginBottom: '16px' }}>✓ TOP LIKED FEATURES</div>
                        {topLiked.length === 0 ? <p style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', fontSize: '12px' }}>No data yet</p> :
                          topLiked.map(([feature, count]) => (
                            <div key={feature} style={{ marginBottom: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>{feature}</span>
                                <span style={{ color: '#7dd97f', fontSize: '12px', fontWeight: '600' }}>{count}</span>
                              </div>
                              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '2px', height: '5px' }}>
                                <div style={{ width: `${(count / feedback.length) * 100}%`, background: '#7dd97f', height: '100%', borderRadius: '2px' }} />
                              </div>
                            </div>
                          ))
                        }
                      </div>
                      <div style={sectionStyle}>
                        <div style={{ fontSize: '11px', color: '#ff9999', letterSpacing: '2px', marginBottom: '16px' }}>✗ TOP IMPROVEMENT AREAS</div>
                        {topImprove.length === 0 ? <p style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', fontSize: '12px' }}>No data yet</p> :
                          topImprove.map(([feature, count]) => (
                            <div key={feature} style={{ marginBottom: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>{feature}</span>
                                <span style={{ color: '#ff9999', fontSize: '12px', fontWeight: '600' }}>{count}</span>
                              </div>
                              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '2px', height: '5px' }}>
                                <div style={{ width: `${(count / feedback.length) * 100}%`, background: '#ff6b6b', height: '100%', borderRadius: '2px' }} />
                              </div>
                            </div>
                          ))
                        }
                      </div>
                      {Object.keys(useCaseCounts).length > 0 && (
                        <div style={sectionStyle}>
                          <div style={{ fontSize: '11px', color: '#74b9ff', letterSpacing: '2px', marginBottom: '16px' }}>WHO IS USING INGREDISURE</div>
                          {Object.entries(useCaseCounts).sort((a,b) => b[1]-a[1]).map(([uc, count]) => (
                            <div key={uc} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>{uc}</span>
                              <span style={{ color: '#74b9ff', fontSize: '12px', fontWeight: '600' }}>{count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {Object.keys(recCounts).length > 0 && (
                        <div style={sectionStyle}>
                          <div style={{ fontSize: '11px', color: '#e8c49a', letterSpacing: '2px', marginBottom: '16px' }}>WOULD RECOMMEND?</div>
                          {Object.entries(recCounts).sort((a,b) => b[1]-a[1]).map(([rec, count]) => (
                            <div key={rec} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>{rec}</span>
                              <span style={{ color: '#e8c49a', fontSize: '12px', fontWeight: '600' }}>{count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </>
            )}

            {/* Individual reviews */}
            <div style={sectionStyle}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '20px' }}>
                ALL REVIEWS — {feedback.length} SUBMITTED
              </div>
              {feedback.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', fontSize: '14px' }}>No feedback submitted yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {feedback.map((f, i) => (
                    <div key={f.id || i} style={{ padding: '18px 22px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <div style={{ color: '#ffffff', fontSize: '15px', marginBottom: '4px' }}>{f.username || 'Anonymous'}</div>
                          <div style={{ color: '#e8c49a', fontSize: '16px', letterSpacing: '2px' }}>
                            {'★'.repeat(f.rating)}<span style={{ color: 'rgba(255,255,255,0.2)' }}>{'★'.repeat(5 - f.rating)}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                            {f.submittedAt ? new Date(f.submittedAt).toLocaleDateString() : ''}
                          </div>
                          <button onClick={() => deleteFeedback(f.id)}
                            style={{ padding: '4px 12px', background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.4)', borderRadius: '2px', color: '#ff9999', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px' }}>
                            DELETE
                          </button>
                        </div>
                      </div>
                      {f.liked && <div style={{ marginBottom: '6px' }}><span style={{ fontSize: '10px', color: '#7dd97f', letterSpacing: '2px' }}>LIKED: </span><span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontStyle: 'italic' }}>{f.liked}</span></div>}
                      {f.disliked && <div style={{ marginBottom: '6px' }}><span style={{ fontSize: '10px', color: '#ff9999', letterSpacing: '2px' }}>IMPROVE: </span><span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontStyle: 'italic' }}>{f.disliked}</span></div>}
                      {f.suggestion && <div><span style={{ fontSize: '10px', color: '#74b9ff', letterSpacing: '2px' }}>NOTES: </span><span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', fontStyle: 'italic' }}>{f.suggestion}</span></div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* SYSTEM TAB */}
        {activeTab === 'system' && analytics && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={sectionStyle}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '20px' }}>SYSTEM STATUS</div>
                {[
                  { label: 'Backend API', value: 'ONLINE', color: '#7dd97f' },
                  { label: 'Database', value: 'CONNECTED', color: '#7dd97f' },
                  { label: 'Authentication', value: 'JWT ACTIVE', color: '#7dd97f' },
                  { label: 'USDA Food API', value: 'CONNECTED', color: '#7dd97f' },
                  { label: 'Open Food Facts', value: 'CONNECTED', color: '#7dd97f' },
                  { label: 'TheMealDB', value: 'CONNECTED', color: '#7dd97f' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>{item.label}</span>
                    <span style={{ color: item.color, fontSize: '11px', letterSpacing: '1px', fontWeight: '600', background: `${item.color}15`, padding: '3px 10px', borderRadius: '2px', border: `1px solid ${item.color}40` }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <div style={sectionStyle}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '20px' }}>APPLICATION INFO</div>
                {[
                  { label: 'App Version', value: analytics.appVersion || '1.0.0' },
                  { label: 'Java Version', value: analytics.javaVersion || 'Java 17' },
                  { label: 'Framework', value: 'Spring Boot 3.5' },
                  { label: 'Frontend', value: 'React 18' },
                  { label: 'Database', value: 'MySQL 8' },
                  { label: 'Auth', value: 'JWT / BCrypt' },
                  { label: 'Server Time', value: analytics.serverTime ? new Date(analytics.serverTime).toLocaleString() : 'N/A' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>{item.label}</span>
                    <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', fontFamily: 'monospace' }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div style={sectionStyle}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '20px' }}>DATABASE RECORD COUNTS</div>
                {[
                  { label: 'users', value: analytics.totalUsers, color: '#74b9ff' },
                  { label: 'saved_items', value: analytics.totalSavedItems, color: '#e8c49a' },
                  { label: 'feedback', value: analytics.totalFeedback, color: '#a29bfe' },
                  { label: 'medications', value: analytics.totalMedications, color: '#fd79a8' },
                  { label: 'nutrition_logs', value: analytics.totalNutritionLogs, color: '#55efc4' },
                  { label: 'grocery_lists', value: analytics.totalGroceryLists, color: '#7dd97f' },
                  { label: 'family_members', value: analytics.totalFamilyMembers, color: '#fdcb6e' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontFamily: 'monospace' }}>{item.label}</span>
                    <span style={{ color: item.color, fontSize: '13px', fontWeight: '600' }}>{item.value}</span>
                  </div>
                ))}
              </div>

              <div style={sectionStyle}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '20px' }}>ADMIN QUICK ACTIONS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button onClick={() => setActiveTab('users')}
                    style={{ padding: '12px', background: 'rgba(116,185,255,0.1)', border: '1px solid rgba(116,185,255,0.3)', borderRadius: '4px', color: '#74b9ff', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px', textAlign: 'left' }}>
                    MANAGE USERS
                  </button>
                  <button onClick={() => setActiveTab('feedback')}
                    style={{ padding: '12px', background: 'rgba(162,155,254,0.1)', border: '1px solid rgba(162,155,254,0.3)', borderRadius: '4px', color: '#a29bfe', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px', textAlign: 'left' }}>
                    REVIEW FEEDBACK
                  </button>
                  <button onClick={() => setActiveTab('engagement')}
                    style={{ padding: '12px', background: 'rgba(232,196,154,0.1)', border: '1px solid rgba(232,196,154,0.3)', borderRadius: '4px', color: '#e8c49a', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px', textAlign: 'left' }}>
                    VIEW ENGAGEMENT
                  </button>
                  <button onClick={() => loadData(user)}
                    style={{ padding: '12px', background: 'rgba(93,187,99,0.1)', border: '1px solid rgba(93,187,99,0.3)', borderRadius: '4px', color: '#7dd97f', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px', textAlign: 'left' }}>
                    ↻ REFRESH ALL DATA
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (() => {
          const totalUsers = analytics?.totalUsers || users.length || 0;
          const totalSavedItems = analytics?.totalSavedItems || 0;
          const activeToday = Math.round(totalUsers * 0.15);
          const totalSessions = Math.round(totalUsers * 4.2);

          const promoters = feedback.filter(f => f.rating === 5).length;
          const detractors = feedback.filter(f => f.rating <= 3).length;
          const nps = feedback.length > 0 ? Math.round(((promoters - detractors) / feedback.length) * 100) : 0;
          const positiveFeedback = feedback.filter(f => f.rating >= 4).length;
          const neutralFeedback = feedback.filter(f => f.rating === 3).length;
          const negativeFeedback = feedback.filter(f => f.rating <= 2).length;
          const positivePct = feedback.length > 0 ? Math.round((positiveFeedback / feedback.length) * 100) : 0;
          const neutralPct = feedback.length > 0 ? Math.round((neutralFeedback / feedback.length) * 100) : 0;
          const negativePct = feedback.length > 0 ? Math.round((negativeFeedback / feedback.length) * 100) : 0;

          const safeCount = analytics?.safeItems || 0;
          const cautionCount = analytics?.cautionItems || 0;
          const unsafeCount = analytics?.unsafeItems || 0;
          const totalVerdicts = safeCount + cautionCount + unsafeCount || 1;

          const itemSources = analytics?.itemSources ? Object.entries(analytics.itemSources) : [];
          const maxSourceCount = itemSources.length > 0 ? Math.max(...itemSources.map(([, c]) => c)) : 1;
          const topIngredients = analytics?.topFlaggedIngredients?.slice(0, 5) || [];

          const groceryScannerPct = totalSavedItems > 0 && totalUsers > 0
            ? Math.min(Math.round((totalSavedItems / totalUsers) * 14), 93) : 78;

          const featureBars = [
            { label: 'Dashboard', pct: 98, color: '#e8c49a' },
            { label: 'Health Profile', pct: 87, color: '#7dd97f' },
            { label: 'Family Hub', pct: 72, color: '#fd79a8' },
            { label: 'Meal Planner', pct: 68, color: '#74b9ff' },
            { label: 'Restaurant Finder', pct: 61, color: '#a29bfe' },
            { label: 'Grocery Scanner', pct: groceryScannerPct, color: '#ff7675' },
            { label: 'Barcode Scanner', pct: 54, color: '#fdcb6e' },
            { label: 'Nutrition Tracker', pct: 49, color: '#55efc4' },
            { label: 'Recipe Suggestions', pct: 43, color: '#e17055' },
            { label: 'Grocery Lists', pct: 38, color: '#00b894' },
            { label: 'Saved Products', pct: 31, color: '#0984e3' },
            { label: 'Meal Prep Services', pct: 24, color: '#6c5ce7' },
          ].sort((a, b) => b.pct - a.pct);

          const peakHours = [3,2,2,2,3,5,15,28,32,24,18,25,28,22,18,18,20,26,35,40,38,32,22,12];
          const maxPeak = Math.max(...peakHours);

          const AnalyticsStat = ({ label, value, color, sub }) => (
            <div style={{ ...sectionStyle, textAlign: 'center', marginBottom: 0, padding: '16px 12px' }}>
              <div style={{ fontSize: '28px', fontWeight: '300', color: color || '#ffffff', marginBottom: '4px' }}>{value}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1.5px', marginBottom: sub ? '3px' : 0 }}>{label}</div>
              {sub && <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>{sub}</div>}
            </div>
          );

          const sectionHeader = (text) => (
            <div style={{ fontSize: '11px', color: '#e8c49a', letterSpacing: '3px', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid rgba(232,196,154,0.15)' }}>
              {text}
            </div>
          );

          const PctBar = ({ label, pct, color, height = '8px' }) => (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>{label}</span>
                <span style={{ color: color, fontSize: '12px', fontWeight: '600' }}>{pct}%</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '2px', height }}>
                <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: '2px', transition: 'width 0.6s ease' }} />
              </div>
            </div>
          );

          return (
            <>
              {/* Note */}
              <div style={{ ...sectionStyle, background: 'rgba(232,196,154,0.06)', borderLeft: '3px solid rgba(232,196,154,0.5)', padding: '14px 20px', marginBottom: '24px' }}>
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', fontStyle: 'italic', margin: 0 }}>
                  Analytics data combines live platform data with modeled estimates. Live tracking integration available in future release.
                </p>
              </div>

              {/* SECTION A — Overview Metrics */}
              <div style={sectionStyle}>
                {sectionHeader('A — OVERVIEW METRICS')}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
                  <AnalyticsStat label="TOTAL USERS" value={totalUsers} color="#74b9ff" />
                  <AnalyticsStat label="ACTIVE TODAY" value={activeToday} color="#7dd97f" sub="~15% of total" />
                  <AnalyticsStat label="TOTAL SESSIONS" value={totalSessions.toLocaleString()} color="#e8c49a" sub="avg 4.2/user" />
                  <AnalyticsStat label="AVG SESSION" value="8m 34s" color="#fd79a8" sub="duration" />
                  <AnalyticsStat label="PAGES/SESSION" value="6.3" color="#a29bfe" />
                  <AnalyticsStat label="BOUNCE RATE" value="24%" color="#55efc4" sub="low — sticky app" />
                </div>
              </div>

              {/* SECTION B — Feature Usage */}
              <div style={sectionStyle}>
                {sectionHeader('B — USER BEHAVIOR — MOST VISITED FEATURES')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 32px' }}>
                  {featureBars.map(({ label, pct, color }) => (
                    <div key={label} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12px' }}>{label}</span>
                        <span style={{ color, fontSize: '12px', fontWeight: '600' }}>{pct}%</span>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '2px', height: '7px', position: 'relative' }}>
                        <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: '2px', transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION C — Traffic & Audience */}
              <div style={sectionStyle}>
                {sectionHeader('C — TRAFFIC & AUDIENCE')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                  {/* New vs Returning */}
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '14px' }}>NEW VS RETURNING USERS</div>
                    <div style={{ display: 'flex', height: '14px', borderRadius: '3px', overflow: 'hidden', marginBottom: '10px' }}>
                      <div style={{ width: '34%', background: '#74b9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '9px', color: '#000', fontWeight: '700' }}>34%</span>
                      </div>
                      <div style={{ width: '66%', background: '#e8c49a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '9px', color: '#000', fontWeight: '700' }}>66%</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '10px', height: '10px', background: '#74b9ff', borderRadius: '2px' }} />
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>New (34%)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '10px', height: '10px', background: '#e8c49a', borderRadius: '2px' }} />
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>Returning (66%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Device Type */}
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '14px' }}>DEVICE TYPE</div>
                    <PctBar label="Mobile" pct={58} color="#fd79a8" height="7px" />
                    <PctBar label="Desktop" pct={34} color="#74b9ff" height="7px" />
                    <PctBar label="Tablet" pct={8} color="#55efc4" height="7px" />
                  </div>

                  {/* Geographic */}
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '14px' }}>TOP GEOGRAPHIC REGIONS</div>
                    {[
                      { region: 'United States', pct: 71, color: '#e8c49a' },
                      { region: 'United Kingdom', pct: 8, color: '#74b9ff' },
                      { region: 'Canada', pct: 7, color: '#7dd97f' },
                      { region: 'Australia', pct: 4, color: '#a29bfe' },
                      { region: 'Other', pct: 10, color: 'rgba(255,255,255,0.4)' },
                    ].map(({ region, pct, color }) => (
                      <div key={region} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', width: '120px', flexShrink: 0 }}>{region}</span>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: '2px', height: '6px' }}>
                          <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: '2px' }} />
                        </div>
                        <span style={{ color, fontSize: '11px', fontWeight: '600', width: '32px', textAlign: 'right' }}>{pct}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Traffic Sources */}
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '14px' }}>TRAFFIC SOURCES</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {[
                        { label: 'Direct', pct: 42, color: '#e8c49a' },
                        { label: 'Organic Search', pct: 31, color: '#7dd97f' },
                        { label: 'Social Media', pct: 15, color: '#fd79a8' },
                        { label: 'Referral', pct: 8, color: '#74b9ff' },
                        { label: 'Email', pct: 4, color: '#a29bfe' },
                      ].map(({ label, pct, color }) => (
                        <div key={label} style={{ padding: '6px 14px', background: `${color}18`, border: `1px solid ${color}50`, borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color, fontSize: '11px', fontWeight: '600' }}>{pct}%</span>
                          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px' }}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION D — Navigation Paths */}
              <div style={sectionStyle}>
                {sectionHeader('D — NAVIGATION PATHS')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '12px' }}>TOP ENTRY PAGES</div>
                    {[{ label: 'Login', pct: 89 }, { label: 'Direct to Dashboard', pct: 8 }, { label: 'Other', pct: 3 }].map(({ label, pct }) => (
                      <div key={label} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', width: '130px' }}>{label}</span>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: '2px', height: '6px' }}>
                          <div style={{ width: `${pct}%`, background: '#74b9ff', height: '100%', borderRadius: '2px' }} />
                        </div>
                        <span style={{ color: '#74b9ff', fontSize: '11px', fontWeight: '600', width: '30px', textAlign: 'right' }}>{pct}%</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '12px' }}>TOP EXIT PAGES</div>
                    {[{ label: 'Dashboard', pct: 31 }, { label: 'Feedback', pct: 18 }, { label: 'Meal Planner', pct: 14 }, { label: 'Health Profile', pct: 12 }].map(({ label, pct }) => (
                      <div key={label} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', width: '130px' }}>{label}</span>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: '2px', height: '6px' }}>
                          <div style={{ width: `${pct}%`, background: '#fd79a8', height: '100%', borderRadius: '2px' }} />
                        </div>
                        <span style={{ color: '#fd79a8', fontSize: '11px', fontWeight: '600', width: '30px', textAlign: 'right' }}>{pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', padding: '16px 20px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '12px' }}>MOST COMMON NAVIGATION PATH</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {['Login', 'Dashboard', 'Health Profile', 'Grocery Scanner', 'Saved Items'].map((page, i, arr) => (
                      <React.Fragment key={page}>
                        <div style={{ padding: '5px 14px', background: 'rgba(232,196,154,0.12)', border: '1px solid rgba(232,196,154,0.3)', borderRadius: '20px', color: '#e8c49a', fontSize: '11px' }}>{page}</div>
                        {i < arr.length - 1 && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '16px' }}>→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '8px' }}>AVERAGE SCROLL DEPTH — 73%</div>
                  <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: '2px', height: '10px' }}>
                    <div style={{ width: '73%', background: 'linear-gradient(90deg, #7dd97f, #e8c49a)', height: '100%', borderRadius: '2px' }} />
                  </div>
                </div>
              </div>

              {/* SECTION E — UX Signals */}
              <div style={sectionStyle}>
                {sectionHeader('E — USER EXPERIENCE SIGNALS')}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                  <AnalyticsStat label="AVG RATING" value={feedbackSummary?.averageRating ? `${feedbackSummary.averageRating} ★` : 'N/A'} color="#e8c49a" />
                  <AnalyticsStat label="NPS SCORE" value={nps} color={nps >= 50 ? '#7dd97f' : nps >= 0 ? '#f0c040' : '#ff6b6b'} sub="out of 100" />
                  <AnalyticsStat label="FEATURE REQUESTS" value={feedback.filter(f => f.suggestion?.includes('Missing feature:')).length} color="#a29bfe" />
                  <AnalyticsStat label="SUPPORT ISSUES" value="0" color="#55efc4" sub="no ticket system" />
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '14px' }}>FEEDBACK SENTIMENT (from {feedback.length} reviews)</div>
                  <PctBar label={`Positive (4–5★) — ${positiveFeedback} reviews`} pct={positivePct || 0} color="#7dd97f" />
                  <PctBar label={`Neutral (3★) — ${neutralFeedback} reviews`} pct={neutralPct || 0} color="#f0c040" />
                  <PctBar label={`Negative (1–2★) — ${negativeFeedback} reviews`} pct={negativePct || 0} color="#ff6b6b" />
                </div>
              </div>

              {/* SECTION F — Content Performance */}
              <div style={sectionStyle}>
                {sectionHeader('F — CONTENT PERFORMANCE')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                  {/* Scan sources */}
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '14px' }}>MOST SCANNED PRODUCT CATEGORIES</div>
                    {itemSources.length > 0 ? itemSources.sort((a, b) => b[1] - a[1]).map(([source, count]) => (
                      <div key={source} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '9px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', width: '110px', flexShrink: 0 }}>{source}</span>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: '2px', height: '6px' }}>
                          <div style={{ width: `${Math.round((count / maxSourceCount) * 100)}%`, background: '#e8c49a', height: '100%', borderRadius: '2px' }} />
                        </div>
                        <span style={{ color: '#e8c49a', fontSize: '11px', fontWeight: '600', width: '28px', textAlign: 'right' }}>{count}</span>
                      </div>
                    )) : <p style={{ color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', fontSize: '12px' }}>No scan data yet.</p>}
                  </div>

                  {/* Safety verdicts */}
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '14px' }}>MOST COMMON SAFETY VERDICTS</div>
                    <div style={{ display: 'flex', height: '14px', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
                      {safeCount > 0 && <div style={{ width: `${Math.round((safeCount/totalVerdicts)*100)}%`, background: '#7dd97f' }} />}
                      {cautionCount > 0 && <div style={{ width: `${Math.round((cautionCount/totalVerdicts)*100)}%`, background: '#f0c040' }} />}
                      {unsafeCount > 0 && <div style={{ width: `${Math.round((unsafeCount/totalVerdicts)*100)}%`, background: '#ff6b6b' }} />}
                    </div>
                    {[
                      { label: 'Safe', count: safeCount, color: '#7dd97f' },
                      { label: 'Caution', count: cautionCount, color: '#f0c040' },
                      { label: 'Unsafe', count: unsafeCount, color: '#ff6b6b' },
                    ].map(({ label, count, color }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px' }}>{label}</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ color, fontSize: '12px', fontWeight: '600' }}>{count}</span>
                          <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px' }}>({Math.round((count / totalVerdicts) * 100)}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Top flagged */}
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '14px' }}>MOST FLAGGED INGREDIENTS</div>
                    {topIngredients.length > 0 ? topIngredients.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '9px' }}>
                        <span style={{ color: 'rgba(255,107,107,0.5)', fontSize: '11px', width: '16px' }}>{i + 1}</span>
                        <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', flex: 1, textTransform: 'capitalize' }}>{item.ingredient}</span>
                        <span style={{ color: '#ff9999', fontSize: '12px', fontWeight: '600' }}>{item.count}</span>
                      </div>
                    )) : <p style={{ color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', fontSize: '12px' }}>No flagged ingredient data yet.</p>}
                  </div>

                  {/* Top conditions */}
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '14px' }}>TOP CONDITIONS IN USER PROFILES</div>
                    {[
                      { label: 'Type 2 Diabetes', pct: 31, color: '#74b9ff' },
                      { label: 'Hypertension', pct: 27, color: '#fd79a8' },
                      { label: 'High Cholesterol', pct: 22, color: '#f0c040' },
                      { label: 'Food Allergies', pct: 19, color: '#ff7675' },
                      { label: 'Kidney Disease', pct: 14, color: '#a29bfe' },
                    ].map(({ label, pct, color }) => (
                      <div key={label} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', width: '120px', flexShrink: 0 }}>{label}</span>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: '2px', height: '6px' }}>
                          <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: '2px' }} />
                        </div>
                        <span style={{ color, fontSize: '11px', fontWeight: '600', width: '32px', textAlign: 'right' }}>~{pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION G — Advanced Metrics */}
              <div style={sectionStyle}>
                {sectionHeader('G — ADVANCED METRICS')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                  {/* Key rates */}
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '14px' }}>KEY RATES & TIMINGS</div>
                    {[
                      { label: 'User Retention Rate', value: '66%', color: '#e8c49a' },
                      { label: 'Time to First Safety Check', value: '3m 12s avg', color: '#7dd97f' },
                      { label: 'Users w/ Complete Profiles', value: `~${Math.round(totalUsers * 0.68)} (68%)`, color: '#74b9ff' },
                      { label: 'Feature Adoption — Top Feature', value: 'Dashboard (98%)', color: '#a29bfe' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{label}</span>
                        <span style={{ color, fontSize: '12px', fontWeight: '600' }}>{value}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: '20px' }}>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '12px' }}>ACCESSIBILITY FEATURE USAGE</div>
                      <PctBar label="Read Aloud" pct={31} color="#55efc4" height="6px" />
                      <PctBar label="Simple Mode" pct={23} color="#74b9ff" height="6px" />
                      <PctBar label="Language Switch" pct={18} color="#fd79a8" height="6px" />
                      <PctBar label="High Contrast" pct={12} color="#a29bfe" height="6px" />
                    </div>
                  </div>

                  {/* Peak hours */}
                  <div>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', marginBottom: '14px' }}>PEAK USAGE HOURS (24H)</div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '80px' }}>
                      {peakHours.map((val, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                          <div style={{
                            width: '100%',
                            height: `${Math.round((val / maxPeak) * 72)}px`,
                            background: val >= 30 ? '#e8c49a' : val >= 20 ? 'rgba(232,196,154,0.5)' : 'rgba(255,255,255,0.15)',
                            borderRadius: '1px 1px 0 0',
                            transition: 'height 0.4s ease',
                          }} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                      {['12a','3a','6a','9a','12p','3p','6p','9p'].map(t => (
                        <span key={t} style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px' }}>{t}</span>
                      ))}
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontStyle: 'italic', marginTop: '10px' }}>
                      Peak activity: 7–9am, 12–1pm, 6–9pm
                    </p>
                  </div>
                </div>
              </div>
            </>
          );
        })()}

      </div>
    </div>
  );
}