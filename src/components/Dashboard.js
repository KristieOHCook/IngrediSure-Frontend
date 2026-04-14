import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:8080/api';

const IMAGES = [
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=90',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=90',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&q=90',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=90',
];

const tiles = [
  {
    id: 'grocery',
    title: 'Grocery Scanner',
    desc: 'Search products and verify ingredient safety',
    route: '/grocery',
    accent: 'rgba(255, 107, 53, 0.9)',
    iconPath: <>
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </>,
  },
  {
    id: 'restaurant',
    title: 'Restaurant Finder',
    desc: 'Discover safe dining options near you',
    route: '/restaurant',
    accent: 'rgba(74, 159, 212, 0.9)',
    iconPath: <>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </>,
  },
  {
    id: 'health',
    title: 'Health Profile',
    desc: 'Manage your dietary restrictions and conditions',
    route: '/profile',
    accent: 'rgba(93, 187, 99, 0.9)',
    iconPath: <>
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </>,
  },
  {
    id: 'admin',
    title: 'Admin Dashboard',
    desc: 'Manage users, analytics, and system data',
    route: '/admin',
    accent: 'rgba(232, 196, 154, 0.9)',
    iconPath: <>
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </>,
    adminOnly: true,
  },
  {
    id: 'feedback',
    title: 'Share Feedback',
    desc: 'Rate your experience and suggest improvements',
    route: '/feedback',
    accent: 'rgba(180, 120, 200, 0.9)',
    iconPath: <>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </>,
  },
];

function Tile({ tile, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.08)',
        backdropFilter: hovered ? 'blur(28px)' : 'blur(12px)',
        WebkitBackdropFilter: hovered ? 'blur(28px)' : 'blur(12px)',
        border: hovered ? '1px solid rgba(255,255,255,0.8)' : '1px solid rgba(255,255,255,0.15)',
        borderRadius: '4px',
        padding: '32px 28px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '22px',
        transition: 'all 0.35s ease',
        position: 'relative',
        overflow: 'hidden',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      {/* Colored left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
        background: tile.accent,
        borderRadius: '4px 0 0 4px',
      }} />

      {/* Icon */}
      <div style={{
        width: '52px', height: '52px',
        border: `1.5px solid ${tile.accent}`,
        borderRadius: '2px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        background: 'rgba(255,255,255,0.05)',
      }}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
          stroke={tile.accent} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          {tile.iconPath}
        </svg>
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <h3 style={{
            margin: 0, fontSize: '17px', fontWeight: '700',
            color: hovered ? '#1a1a1a' : '#ffffff',
            fontFamily: 'Georgia, serif',
            letterSpacing: '0.5px',
            textShadow: hovered ? 'none' : '0 1px 4px rgba(0,0,0,0.5)',
            transition: 'color 0.35s ease',
          }}>
            {tile.title}
          </h3>
          {tile.adminOnly && (
            <span style={{
              fontSize: '9px',
              border: hovered ? '1px solid #a0622a' : '1px solid #e8c49a',
              color: hovered ? '#a0622a' : '#e8c49a',
              padding: '2px 6px',
              borderRadius: '2px', letterSpacing: '1px',
              transition: 'all 0.35s ease',
            }}>
              ADMIN
            </span>
          )}
        </div>
        <p style={{
          margin: 0, fontSize: '13px',
          color: hovered ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.95)',
          lineHeight: '1.6', fontFamily: 'Georgia, serif',
          fontStyle: 'italic',
          transition: 'color 0.35s ease',
        }}>
          {tile.desc}
        </p>
      </div>

      {/* Arrow */}
      <div style={{
        fontSize: '22px',
        color: hovered ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.7)',
        flexShrink: 0,
        transition: 'color 0.35s ease',
      }}>
        ›
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bgIndex, setBgIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/'); return; }
    const parsed = JSON.parse(stored);
    if (!parsed?.token) { navigate('/'); return; }
    setUser(parsed);
    setLoading(false);

    const interval = setInterval(() => {
      setBgIndex(i => (i + 1) % IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const visibleTiles = tiles.filter(t => !t.adminOnly || user?.role === 'ROLE_ADMIN');

  if (loading) return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      height: '100vh', background: '#1a1a1a', color: '#c9b99a',
      fontFamily: 'Georgia, serif', fontSize: '18px', letterSpacing: '2px',
    }}>
      INGREDISURE
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: "'Georgia', 'Garamond', serif",
      position: 'relative',
      overflow: 'hidden',
    }}>

      {IMAGES.map((img, i) => (
        <div key={i} style={{
          position: 'fixed', inset: 0, zIndex: 0,
          backgroundImage: `url(${img})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: i === bgIndex ? 1 : 0,
          transition: 'opacity 2s ease-in-out',
        }} />
      ))}

      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.55) 100%)',
      }} />

      <div style={{
        position: 'relative', zIndex: 2,
        maxWidth: '960px', margin: '0 auto',
        padding: '0 24px',
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '32px 0 24px',
          borderBottom: '1px solid rgba(255,255,255,0.15)',
          marginBottom: '48px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src="/logo.jpg"
              alt="IngrediSure"
              style={{
                height: '70px', objectFit: 'contain',
                filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.8)) contrast(1.1) brightness(1.1)',
                borderRadius: '16px',
                mixBlendMode: 'luminosity',
              }}
              onError={e => e.target.style.display = 'none'}
            />
            <div>
              <div style={{
                fontSize: '22px', fontWeight: '400', color: '#ffffff',
                letterSpacing: '3px', fontFamily: 'Georgia, serif',
                textShadow: '0 2px 12px rgba(0,0,0,0.5)',
              }}>
                INGREDI<span style={{ color: '#e8c49a' }}>SURE</span>
              </div>
              <div style={{
                fontSize: '11px', color: 'rgba(255,255,255,0.95)',
                letterSpacing: '2px', marginTop: '2px',
              }}>
                EAT WELL · CHOOSE WISELY
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '13px', color: 'rgba(255,255,255,0.95)',
                letterSpacing: '1px', marginBottom: '4px',
              }}>
                WELCOME BACK
              </div>
              <div style={{
                fontSize: '16px', color: '#ffffff', fontWeight: '400',
                letterSpacing: '1px',
              }}>
                {user?.username?.toUpperCase()}
                {user?.role === 'ROLE_ADMIN' && (
                  <span style={{
                    marginLeft: '10px', fontSize: '10px',
                    border: '2px solid #FF8C42', color: '#FF8C42',
                    padding: '2px 8px', borderRadius: '2px',
                    letterSpacing: '2px', verticalAlign: 'middle',
                    fontWeight: 'bold',
                  }}>
                    ADMIN
                  </span>
                )}
              </div>
            </div>

            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(232, 196, 154, 0.5)',
              border: '2px solid rgba(255, 200, 120, 0.95)',
              fontSize: '18px', color: '#ffffff', fontFamily: 'Georgia, serif',
              fontWeight: 'bold', textAlign: 'center',
            }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>

            <button
              onClick={handleLogout}
              style={{
                background: 'transparent', color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.5)',
                padding: '10px 28px', borderRadius: '2px',
                cursor: 'pointer', fontFamily: 'Georgia, serif',
                fontSize: '12px', letterSpacing: '2px', transition: 'all 0.3s',
              }}
              onMouseOver={e => {
                e.target.style.background = 'rgba(255,255,255,0.1)';
                e.target.style.borderColor = '#e8c49a';
                e.target.style.color = '#e8c49a';
              }}
              onMouseOut={e => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                e.target.style.color = '#ffffff';
              }}
            >
              LOG OUT
            </button>
          </div>
        </div>

        {/* Page title */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '13px', fontWeight: '400',
            color: 'rgba(255,255,255,0.95)',
            letterSpacing: '4px', margin: '0 0 8px',
            fontFamily: 'Georgia, serif',
          }}>
            NAVIGATION
          </h1>
          <h2 style={{
            fontSize: '42px', fontWeight: '400',
            color: '#ffffff', margin: 0,
            fontFamily: 'Georgia, serif',
            textShadow: '0 2px 20px rgba(0,0,0,0.4)',
            letterSpacing: '1px',
          }}>
            Your Dashboard
          </h2>
        </div>

        {/* Tiles */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          paddingBottom: '48px',
        }}>
          {visibleTiles.map(tile => (
            <Tile
              key={tile.id}
              tile={tile}
              onClick={() => navigate(tile.route)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}