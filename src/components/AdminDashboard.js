import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:8080/api';
const BG = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=90';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/'); return; }
    const parsed = JSON.parse(stored);
    if (!parsed?.token) { navigate('/'); return; }
    if (parsed.role !== 'ROLE_ADMIN') { navigate('/dashboard'); return; }
    setUser(parsed);
    loadData(parsed);
  }, [navigate]);

  const headers = (u) => ({ Authorization: `Bearer ${u.token}` });

  const loadData = async (u) => {
    try {
      const [analyticsRes, usersRes] = await Promise.all([
        axios.get(`${API}/admin/analytics`, { headers: headers(u) }),
        axios.get(`${API}/admin/users`, { headers: headers(u) }),
      ]);
      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data || []);
    } catch (err) {
      console.error('Load error:', err);
    }
    setLoading(false);
  };

  const promoteUser = async (userId) => {
    try {
      await axios.put(`${API}/admin/promote/${userId}`, {}, { headers: headers(user) });
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, role: 'ROLE_ADMIN' } : u
      ));
      setMessage('User promoted to Admin.');
    } catch (err) { setMessage('Error promoting user.'); }
  };

  const deactivateUser = async (userId) => {
    try {
      await axios.put(`${API}/admin/deactivate/${userId}`, {}, { headers: headers(user) });
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, active: false } : u
      ));
      setMessage('User deactivated.');
    } catch (err) { setMessage('Error deactivating user.'); }
  };

  const sectionStyle = {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '4px', padding: '28px 32px',
    marginBottom: '20px',
  };

  const tabStyle = (active) => ({
    padding: '10px 24px',
    background: active ? 'rgba(232,196,154,0.2)' : 'transparent',
    border: active ? '1px solid rgba(232,196,154,0.5)' : '1px solid rgba(255,255,255,0.15)',
    borderRadius: '2px', color: active ? '#e8c49a' : 'rgba(255,255,255,0.5)',
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
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.7) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '6px' }}>INGREDISURE</div>
            <h1 style={{ margin: 0, fontSize: '36px', fontWeight: '400', color: '#ffffff', letterSpacing: '1px' }}>Admin Dashboard</h1>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 24px', borderRadius: '2px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px' }}
          >
            ← DASHBOARD
          </button>
        </div>

        {/* Message */}
        {message && (
          <div style={{ background: 'rgba(93,187,99,0.2)', border: '1px solid rgba(93,187,99,0.4)', borderRadius: '4px', padding: '12px 20px', marginBottom: '20px', color: '#7dd97f', fontSize: '13px', letterSpacing: '1px' }}>
            {message}
            <button onClick={() => setMessage('')} style={{ float: 'right', background: 'none', border: 'none', color: '#7dd97f', cursor: 'pointer', fontSize: '16px' }}>×</button>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <button style={tabStyle(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>OVERVIEW</button>
          <button style={tabStyle(activeTab === 'users')} onClick={() => setActiveTab('users')}>USERS</button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && analytics && (
          <>
            {/* Stats cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
              {[
                { label: 'TOTAL USERS', value: analytics.totalUsers, color: '#74b9ff' },
                { label: 'MENU ITEMS', value: analytics.totalMenuItems, color: '#e8c49a' },
                { label: 'SAFETY CHECKS', value: analytics.totalSavedItems, color: '#7dd97f' },
              ].map(stat => (
                <div key={stat.label} style={{ ...sectionStyle, textAlign: 'center', marginBottom: 0 }}>
                  <div style={{ fontSize: '42px', fontWeight: '300', color: stat.color, marginBottom: '8px' }}>
                    {stat.value ?? '—'}
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* System info */}
            <div style={sectionStyle}>
              <h2 style={{ margin: '0 0 20px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
                SYSTEM STATUS
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {[
                  { label: 'Backend', value: 'Running', color: '#7dd97f' },
                  { label: 'Database', value: 'Connected', color: '#7dd97f' },
                  { label: 'API Version', value: 'Spring Boot 3.5', color: '#e8c49a' },
                  { label: 'Frontend', value: 'React 18', color: '#e8c49a' },
                  { label: 'Auth', value: 'JWT Active', color: '#7dd97f' },
                  { label: 'Admin', value: user?.username?.toUpperCase(), color: '#74b9ff' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', letterSpacing: '1px' }}>{item.label}</span>
                    <span style={{ color: item.color, fontSize: '13px', fontWeight: '600', letterSpacing: '1px' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={sectionStyle}>
            <h2 style={{ margin: '0 0 20px', fontSize: '13px', fontWeight: '400', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px' }}>
              ALL USERS — {users.length} REGISTERED
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {users.map(u => (
                <div key={u.id} style={{ padding: '16px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(232,196,154,0.2)', border: '1px solid rgba(232,196,154,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e8c49a', fontSize: '14px', fontWeight: 'bold' }}>
                      {u.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ color: '#ffffff', fontSize: '15px', marginBottom: '3px' }}>{u.username}</div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ fontSize: '11px', color: u.role === 'ROLE_ADMIN' ? '#FF8C42' : '#74b9ff', letterSpacing: '1px', border: `1px solid ${u.role === 'ROLE_ADMIN' ? '#FF8C42' : '#74b9ff'}40`, padding: '1px 8px', borderRadius: '2px' }}>
                          {u.role?.replace('ROLE_', '')}
                        </span>
                        {u.active === false && (
                          <span style={{ fontSize: '11px', color: '#ff6b6b', letterSpacing: '1px' }}>INACTIVE</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {u.role !== 'ROLE_ADMIN' && u.id !== user?.userId && (
                      <button
                        onClick={() => promoteUser(u.id)}
                        style={{ padding: '6px 14px', background: 'rgba(232,196,154,0.15)', border: '1px solid rgba(232,196,154,0.4)', borderRadius: '2px', color: '#e8c49a', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px' }}
                      >
                        PROMOTE
                      </button>
                    )}
                    {u.id !== user?.userId && u.active !== false && (
                      <button
                        onClick={() => deactivateUser(u.id)}
                        style={{ padding: '6px 14px', background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.4)', borderRadius: '2px', color: '#ff9999', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px' }}
                      >
                        DEACTIVATE
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}