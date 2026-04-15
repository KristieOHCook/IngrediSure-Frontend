import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingScreen from './LoadingScreen';

const API = 'http://localhost:8080/api';
const BG = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=90';

export default function AdminDashboard() {
  const navigate = useNavigate();
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
    if (!stored) { navigate('/'); return; }
    const parsed = JSON.parse(stored);
    if (!parsed?.token || parsed?.role !== 'ROLE_ADMIN') { navigate('/dashboard'); return; }
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
      console.error('Load error:', err);
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
              style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 24px', borderRadius: '2px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px' }}>
              ← DASHBOARD
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {['overview', 'users', 'engagement', 'feedback', 'system'].map(tab => (
            <button key={tab} style={tabStyle(activeTab === tab)} onClick={() => setActiveTab(tab)}>
              {tab === 'overview' && '📊 '}
              {tab === 'users' && '👥 '}
              {tab === 'engagement' && '📈 '}
              {tab === 'feedback' && '💬 '}
              {tab === 'system' && '⚙️ '}
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
                  { label: 'Safety Scans', value: analytics.totalSavedItems, color: '#e8c49a', icon: '🔍' },
                  { label: 'Grocery Lists', value: analytics.totalGroceryLists, color: '#7dd97f', icon: '🛒' },
                  { label: 'Nutrition Logs', value: analytics.totalNutritionLogs, color: '#55efc4', icon: '📊' },
                  { label: 'Medications Added', value: analytics.totalMedications, color: '#fd79a8', icon: '💊' },
                  { label: 'Family Members', value: analytics.totalFamilyMembers, color: '#fdcb6e', icon: '👥' },
                  { label: 'Feedback Submitted', value: analytics.totalFeedback, color: '#a29bfe', icon: '💬' },
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
                    👥 MANAGE USERS
                  </button>
                  <button onClick={() => setActiveTab('feedback')}
                    style={{ padding: '12px', background: 'rgba(162,155,254,0.1)', border: '1px solid rgba(162,155,254,0.3)', borderRadius: '4px', color: '#a29bfe', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px', textAlign: 'left' }}>
                    💬 REVIEW FEEDBACK
                  </button>
                  <button onClick={() => setActiveTab('engagement')}
                    style={{ padding: '12px', background: 'rgba(232,196,154,0.1)', border: '1px solid rgba(232,196,154,0.3)', borderRadius: '4px', color: '#e8c49a', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px', textAlign: 'left' }}>
                    📈 VIEW ENGAGEMENT
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

      </div>
    </div>
  );
}