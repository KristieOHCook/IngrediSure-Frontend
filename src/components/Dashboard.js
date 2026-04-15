import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../AccessibilityContext';
import SMSReminder from './SMSReminder';
import SimpleModeWrapper from './SimpleModeWrapper';

const IMAGES = [
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=90',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=90',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&q=90',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=90',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&q=90',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=90',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1200&q=90',
  'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&q=90',
  'https://images.unsplash.com/photo-1573246123716-6b1782bfc499?w=1200&q=90',
  'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200&q=90',
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&q=90',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=90',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=90',
  'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&q=90',
];

const NAV_SECTIONS = [
  {
    id: 'begin',
    label: 'Begin Your Journey',
    mobileLabel: 'Start',
    tiles: [
      {
        id: 'health', title: 'Set Up Your Health Profile',
        desc: 'Start here — add your medical conditions and ingredients to avoid for personalized safety checks',
        route: '/profile', accent: 'rgba(93,187,99,0.9)',
        iconPath: <><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></>,
      },
    ],
    intro: true,
  },
  {
    id: 'discover',
    label: 'Discover & Scan',
    mobileLabel: 'Discover',
    tiles: [
      {
        id: 'grocery', title: 'Grocery Scanner',
        desc: 'Search any product and verify ingredient safety against your health profile',
        route: '/grocery', accent: 'rgba(255,107,53,0.9)',
        iconPath: <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></>,
      },
      {
        id: 'restaurant', title: 'Restaurant Finder',
        desc: 'Discover safe dining options near you with full menu safety analysis',
        route: '/restaurant', accent: 'rgba(74,159,212,0.9)',
        iconPath: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>,
      },
      {
        id: 'barcode', title: 'Barcode Scanner',
        desc: 'Scan any product barcode for an instant ingredient safety verdict',
        route: '/barcode', accent: 'rgba(255,107,53,0.9)',
        iconPath: <><path d="M6 2H4a2 2 0 00-2 2v2M18 2h2a2 2 0 012 2v2M6 22H4a2 2 0 01-2-2v-2M18 22h2a2 2 0 002-2v-2"/><line x1="7" y1="7" x2="7" y2="17"/><line x1="10" y1="7" x2="10" y2="17"/><line x1="13" y1="7" x2="13" y2="17"/><line x1="16" y1="7" x2="16" y2="17"/></>,
      },
      {
        id: 'meal-prep', title: 'Meal Prep Services',
        desc: 'Health-focused meal delivery services catering to your dietary restrictions',
        route: '/meal-prep', accent: 'rgba(162,155,254,0.9)',
        iconPath: <><path d="M5 12h14M12 5l7 7-7 7"/></>,
      },
    ],
  },
  {
    id: 'wellness',
    label: 'Wellness & Planning',
    mobileLabel: 'Wellness',
    tiles: [
      {
        id: 'nutrition', title: 'Nutrition & Medications',
        desc: 'Track calories, macros and get food-drug interaction warnings',
        route: '/nutrition', accent: 'rgba(116,185,255,0.9)',
        iconPath: <><path d="M9 2v6M15 2v6M3 8h18M5 8v12a2 2 0 002 2h10a2 2 0 002-2V8"/><line x1="9" y1="13" x2="15" y2="13"/></>,
      },
      {
        id: 'family', title: 'Family Hub',
        desc: 'One safety hub for every family member — ages 1 through 100',
        route: '/family', accent: 'rgba(253,121,168,0.9)',
        iconPath: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
      },
      {
        id: 'health', title: 'Health Profile',
        desc: 'Manage your medical conditions, dietary restrictions and ingredient avoidances',
        route: '/profile', accent: 'rgba(93,187,99,0.9)',
        iconPath: <><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></>,
      },
      {
        id: 'meal-planner', title: 'Weekly Meal Planner',
        desc: 'Generate a personalized 7-day meal plan with breakfast, lunch and dinner',
        route: '/meal-planner', accent: 'rgba(74,159,212,0.9)',
        iconPath: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
      },
      {
        id: 'recipes', title: 'Recipe Suggestions',
        desc: 'Browse healthy recipes filtered by your health profile with grocery list export',
        route: '/recipes', accent: 'rgba(93,187,99,0.9)',
        iconPath: <><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><path d="M7 2v20M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></>,
      },
    ],
  },
  {
    id: 'tools',
    label: 'My Tools',
    mobileLabel: 'Tools',
    tiles: [
      {
        id: 'saved', title: 'Saved Products',
        desc: 'View your complete history of checked products with safety verdicts',
        route: '/saved', accent: 'rgba(116,185,255,0.9)',
        iconPath: <><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></>,
      },
      {
        id: 'grocery-lists', title: 'My Grocery Lists',
        desc: 'Create and manage shopping lists, save from recipes and meal plans',
        route: '/grocery-lists', accent: 'rgba(232,196,154,0.9)',
        iconPath: <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
      },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    mobileLabel: 'Account',
    tiles: [
      {
        id: 'feedback', title: '💚 Share Your Experience',
        desc: 'Your feedback directly shapes IngrediSure — 3 minutes of your time helps us serve thousands better',
        route: '/feedback', accent: 'rgba(93,187,99,0.9)',
        iconPath: <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>,
      },
      {
        id: 'admin', title: 'Admin Dashboard',
        desc: 'Manage users, view analytics and system data',
        route: '/admin', accent: 'rgba(232,196,154,0.9)',
        adminOnly: true,
        iconPath: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
      },
    ],
  },
];

function ContentTile({ tile, onClick, isMobile }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.12)',
        backdropFilter: hovered ? 'blur(32px)' : 'blur(16px)',
        WebkitBackdropFilter: hovered ? 'blur(32px)' : 'blur(16px)',
        border: hovered ? '1px solid rgba(255,255,255,0.9)' : '1px solid rgba(255,255,255,0.18)',
        borderRadius: '4px',
        padding: isMobile ? '18px 16px' : '22px 20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        transition: 'all 0.35s ease',
        position: 'relative',
        overflow: 'hidden',
        transform: hovered ? (isMobile ? 'none' : 'translateX(6px)') : 'none',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.2)',
      }}
    >
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: tile.accent }} />
      <div style={{ width: isMobile ? '38px' : '44px', height: isMobile ? '38px' : '44px', border: `1.5px solid ${tile.accent}`, borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: hovered ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.04)' }}>
        <svg viewBox="0 0 24 24" width={isMobile ? '16' : '20'} height={isMobile ? '16' : '20'} fill="none" stroke={tile.accent} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
          {tile.iconPath}
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <h3 style={{ margin: 0, fontSize: isMobile ? '14px' : '15px', fontWeight: '700', color: hovered ? '#111111' : '#ffffff', fontFamily: 'Georgia, serif', letterSpacing: '0.3px', transition: 'color 0.35s' }}>
            {tile.title}
          </h3>
          {tile.adminOnly && (
            <span style={{ fontSize: '8px', border: `1px solid ${hovered ? '#c0622a' : '#e8c49a'}`, color: hovered ? '#c0622a' : '#e8c49a', padding: '2px 6px', borderRadius: '2px', letterSpacing: '1px', transition: 'all 0.35s' }}>ADMIN</span>
          )}
        </div>
        <p style={{ margin: 0, fontSize: isMobile ? '11px' : '12px', color: hovered ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.55)', fontFamily: 'Georgia, serif', fontStyle: 'italic', lineHeight: '1.4', transition: 'color 0.35s' }}>
          {tile.desc}
        </p>
      </div>
      <div style={{ fontSize: '18px', color: hovered ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.35)', flexShrink: 0, transition: 'color 0.35s' }}>›</div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { simpleMode, t } = useAccessibility();
  const [user, setUser] = useState(null);
  const [bgIndex, setBgIndex] = useState(0);
  const [activeSection, setActiveSection] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [navigate]);

  const handleSectionClick = (sectionId) => {
    if (sectionId === activeSection) {
      setAnimating(true);
      setTimeout(() => { setActiveSection(null); setAnimating(false); }, 180);
      return;
    }
    setAnimating(true);
    setTimeout(() => { setActiveSection(sectionId); setAnimating(false); }, 180);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1a1a1a', color: '#c9b99a', fontFamily: 'Georgia, serif', fontSize: '18px', letterSpacing: '2px' }}>
      INGREDISURE
    </div>
  );

  const visibleSections = NAV_SECTIONS.map(s => ({
    ...s,
    tiles: s.tiles.filter(t => !t.adminOnly || user?.role === 'ROLE_ADMIN'),
  })).filter(s => s.tiles.length > 0);

  const currentSection = visibleSections.find(s => s.id === activeSection);

  // ── MOBILE LAYOUT ──────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', fontFamily: "'Georgia','Garamond',serif", position: 'relative', overflow: 'hidden' }}>

        {/* Background */}
        {IMAGES.map((img, i) => (
          <div key={i} style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: i === bgIndex ? 1 : 0, transition: 'opacity 2s ease-in-out' }} />
        ))}
        <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.7) 100%)' }} />

        {/* Mobile header */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '400', color: '#ffffff', letterSpacing: '2px', fontFamily: 'Georgia, serif' }}>
              INGREDI<span style={{ color: '#e8c49a' }}>SURE</span>
            </div>
            <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.6)', letterSpacing: '2px' }}>EAT WELL · CHOOSE WISELY</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(232,196,154,0.45)', border: '2px solid rgba(255,200,120,0.9)', fontSize: '13px', color: '#ffffff', fontWeight: 'bold' }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <button onClick={handleLogout}
              style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 14px', borderRadius: '2px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '10px', letterSpacing: '1px' }}
            >
              OUT
            </button>
          </div>
        </div>

        {/* Mobile content */}
        <div style={{ position: 'relative', zIndex: 2, paddingTop: '72px', paddingBottom: '80px', minHeight: '100vh' }}>

          {/* No section — mobile welcome */}
          {!activeSection && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 152px)', padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#ffffff', letterSpacing: '4px', marginBottom: '8px', fontFamily: 'Georgia, serif', textShadow: '0 2px 8px rgba(0,0,0,0.8)', fontWeight: '300' }}>
                {t.welcome.toUpperCase()}
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.3)', width: '160px', margin: '0 auto 28px' }} />
              <h1 style={{ fontSize: '40px', fontWeight: '300', color: '#ffffff', fontFamily: 'Georgia, serif', margin: '0 0 8px', textShadow: '0 4px 24px rgba(0,0,0,0.7)', letterSpacing: '2px' }}>
                Eat Well.
              </h1>
              <h1 style={{ fontSize: '40px', fontWeight: '300', color: '#e8c49a', fontFamily: 'Georgia, serif', margin: '0 0 20px', textShadow: '0 4px 24px rgba(0,0,0,0.7)', letterSpacing: '2px' }}>
                Choose Wisely.
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', fontStyle: 'italic', fontFamily: 'Georgia, serif', lineHeight: '1.8', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                Select a category below to get started.
              </p>
            </div>
          )}

          {/* Section tiles */}
          {activeSection && currentSection && (
            <div style={{ padding: '24px 16px', opacity: animating ? 0 : 1, transition: 'opacity 0.2s' }}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '3px', marginBottom: '6px' }}>
                  {currentSection.label.toUpperCase()}
                </div>
                <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '300', color: '#ffffff', fontFamily: 'Georgia, serif', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
                  {currentSection.label}
                </h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentSection.tiles.map(tile => (
                  <ContentTile key={tile.id} tile={tile} onClick={() => navigate(tile.route)} isMobile={true} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile bottom nav */}
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-around', padding: '8px 0 12px' }}>
          {visibleSections.map(section => {
            const isActive = section.id === activeSection;
            return (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '4px 8px', flex: 1 }}
              >
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: isActive ? '#e8c49a' : 'transparent', marginBottom: '2px', transition: 'background 0.2s' }} />
                <div style={{ fontSize: '11px', color: isActive ? '#e8c49a' : 'rgba(255,255,255,0.5)', fontFamily: 'Georgia, serif', letterSpacing: '0.5px', transition: 'color 0.2s', textAlign: 'center' }}>
                  {section.mobileLabel}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── DESKTOP LAYOUT ─────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Georgia','Garamond',serif", position: 'relative', overflow: 'hidden' }}>

      {/* Background */}
      {IMAGES.map((img, i) => (
        <div key={i} style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: i === bgIndex ? 1 : 0, transition: 'opacity 2s ease-in-out' }} />
      ))}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.38) 50%, rgba(0,0,0,0.6) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', minHeight: '100vh' }}>

        {/* LEFT SIDEBAR */}
        <div style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', padding: '36px 0 36px 28px', borderRight: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>

          {/* Logo */}
          <div style={{ marginBottom: '32px', textAlign: 'center', paddingRight: '20px' }}>
            <img src="/logo.jpg" alt="IngrediSure"
              style={{ height: '64px', objectFit: 'contain', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.8)) contrast(1.1) brightness(1.1)', borderRadius: '12px', mixBlendMode: 'luminosity', display: 'block', margin: '0 auto 12px' }}
              onError={e => e.target.style.display = 'none'}
            />
            <div style={{ fontSize: '18px', fontWeight: '400', color: '#ffffff', letterSpacing: '3px', textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>
              INGREDI<span style={{ color: '#e8c49a' }}>SURE</span>
            </div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.8)', letterSpacing: '2px', marginTop: '3px' }}>
              EAT WELL · CHOOSE WISELY
            </div>
          </div>

          {/* User info */}
          <div style={{ marginBottom: '28px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingRight: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(232,196,154,0.45)', border: '2px solid rgba(255,200,120,0.9)', fontSize: '13px', color: '#ffffff', fontWeight: 'bold', flexShrink: 0 }}>
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>WELCOME BACK</div>
                <div style={{ fontSize: '13px', color: '#ffffff', letterSpacing: '0.5px', marginTop: '1px' }}>
                  {user?.username?.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Nav label */}
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '3px', marginBottom: '10px' }}>
            {t.dashboard.toUpperCase()}
          </div>

          {/* Nav items */}
          <div style={{ flex: 1 }}>
            {visibleSections.map(section => {
              const isActive = section.id === activeSection;
              return (
                <div key={section.id} onClick={() => handleSectionClick(section.id)}
                  style={{ padding: '12px 14px', marginBottom: '4px', marginRight: '20px', cursor: 'pointer', borderRadius: '4px', background: isActive ? 'rgba(232,196,154,0.18)' : 'transparent', borderLeft: isActive ? '3px solid #e8c49a' : '3px solid transparent', transition: 'all 0.25s ease' }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderLeft = '3px solid rgba(255,255,255,0.4)'; }}}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeft = '3px solid transparent'; }}}
                >
                  <div style={{ fontSize: '13px', fontWeight: isActive ? '700' : '400', color: isActive ? '#e8c49a' : 'rgba(255,255,255,0.75)', letterSpacing: '1px', fontFamily: 'Georgia, serif', transition: 'color 0.25s', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {section.label}
                    <span style={{ fontSize: '14px', color: isActive ? '#e8c49a' : 'rgba(255,255,255,0.3)' }}>{isActive ? '‹' : '›'}</span>
                  </div>
                  <div style={{ fontSize: '10px', color: isActive ? 'rgba(232,196,154,0.6)' : 'rgba(255,255,255,0.3)', marginTop: '2px', fontStyle: 'italic' }}>
                    {section.tiles.length} feature{section.tiles.length > 1 ? 's' : ''}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Admin badge */}
          {user?.role === 'ROLE_ADMIN' && (
            <div style={{ textAlign: 'center', marginBottom: '16px', marginRight: '20px' }}>
              <span style={{ fontSize: '10px', border: '2px solid #FF8C42', color: '#FF8C42', padding: '4px 16px', borderRadius: '2px', letterSpacing: '3px', fontWeight: 'bold', display: 'inline-block' }}>ADMIN</span>
            </div>
          )}

          {/* Log out */}
          <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', marginRight: '20px' }}>
            <button onClick={handleLogout}
              style={{ width: '100%', padding: '11px', background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '2px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '3px', transition: 'all 0.3s' }}
              onMouseOver={e => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.borderColor = '#e8c49a'; e.target.style.color = '#e8c49a'; }}
              onMouseOut={e => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'rgba(255,255,255,0.2)'; e.target.style.color = 'rgba(255,255,255,0.5)'; }}
            >
              LOG OUT
            </button>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', marginTop: '10px', letterSpacing: '1px', fontStyle: 'italic', textAlign: 'center' }}>
              IngrediSure v1.0
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT PANEL */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: activeSection ? 'flex-start' : 'center', padding: '48px' }}>

          {/* Welcome screen */}
          {!activeSection && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '100%', minHeight: 'calc(100vh - 96px)', padding: '8px 0 40px' }}>

              {/* TOP */}
              <div style={{ textAlign: 'center', width: '100%' }}>
                <div style={{ fontSize: '20px', color: '#ffffff', letterSpacing: '5px', marginBottom: '10px', fontFamily: 'Georgia, serif', textShadow: '0 2px 8px rgba(0,0,0,0.8)', fontWeight: '300' }}>
                  {t.welcome.toUpperCase()}
                </div>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.3)', width: '220px', margin: '0 auto' }} />
              </div>

              {/* MIDDLE */}
              <div style={{ textAlign: 'center', width: '100%' }}>
                <h1 style={{ fontSize: '62px', fontWeight: '300', color: '#ffffff', fontFamily: 'Georgia, serif', margin: '0 0 12px', textShadow: '0 4px 32px rgba(0,0,0,0.7)', letterSpacing: '3px', lineHeight: '1.2' }}>
                  {t.tagline.split('.')[0]}.
                </h1>
                <h1 style={{ fontSize: '62px', fontWeight: '300', color: '#e8c49a', fontFamily: 'Georgia, serif', margin: '0 0 28px', textShadow: '0 4px 32px rgba(0,0,0,0.7)', letterSpacing: '3px' }}>
                  {t.tagline.split('.')[1]}.
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '15px', fontStyle: 'italic', fontFamily: 'Georgia, serif', lineHeight: '1.8', maxWidth: '380px', margin: '0 auto', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                  Your personalized health intelligence hub.<br />
                  Select a category from the left to begin.
                </p>
              </div>

              {/* BOTTOM — Select Category */}
              <div style={{ textAlign: 'center', width: '100%' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', letterSpacing: '3px', marginBottom: '14px', fontFamily: 'Georgia, serif', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                  SELECT CATEGORY
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '120px', flexWrap: 'wrap' }}>
                  {visibleSections.map(s => (
                    <button key={s.id} onClick={() => handleSectionClick(s.id)}
                      style={{ padding: '9px 18px', background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '2px', color: '#ffffff', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '2px', transition: 'all 0.25s', backdropFilter: 'blur(8px)', textShadow: '0 1px 4px rgba(0,0,0,0.8)', whiteSpace: 'nowrap' }}
                      onMouseOver={e => { e.target.style.background = 'rgba(232,196,154,0.25)'; e.target.style.borderColor = '#e8c49a'; e.target.style.color = '#e8c49a'; }}
                      onMouseOut={e => { e.target.style.background = 'rgba(0,0,0,0.45)'; e.target.style.borderColor = 'rgba(255,255,255,0.4)'; e.target.style.color = '#ffffff'; }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Section tiles */}
          {activeSection && currentSection && (
            <div style={{ width: '100%', maxWidth: '680px', opacity: animating ? 0 : 1, transform: animating ? 'translateX(12px)' : 'translateX(0)', transition: 'all 0.25s ease' }}>

              {/* Special intro view for Begin Your Journey */}
              {currentSection.intro ? (
                <div>
                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', letterSpacing: '3px', marginBottom: '8px' }}>
                      {t.welcome.toUpperCase()}
                    </div>
                    <h2 style={{ margin: '0 0 20px', fontSize: '34px', fontWeight: '300', color: '#ffffff', fontFamily: 'Georgia, serif', letterSpacing: '0.5px', textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}>
                      Begin Your Journey
                    </h2>

                    {/* Our Story */}
                    <div style={{ background: 'rgba(232,196,154,0.08)', backdropFilter: 'blur(16px)', border: '1px solid rgba(232,196,154,0.2)', borderRadius: '4px', padding: '28px 32px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '11px', color: '#e8c49a', letterSpacing: '3px', marginBottom: '16px' }}>💚 THE STORY BEHIND INGREDISURE</div>

                      <p style={{ color: '#ffffff', fontSize: '16px', lineHeight: '2', margin: '0 0 16px', fontStyle: 'italic', fontWeight: '300', textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                        "I built IngrediSure watching my mother struggle with something most people never think about — knowing what was safe to eat."
                      </p>

                      <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', lineHeight: '2', margin: '0 0 14px' }}>
                        Living with multiple health conditions, my mother faced this challenge every single day. At the grocery store she stood in the aisles reading ingredient label after ingredient label, trying to figure out what was safe and what to avoid — not knowing if something would interact with her medications or trigger a reaction. At restaurants she didn't feel confident ordering anything beyond the plainest, safest options she already knew — plain baked chicken, plain broccoli — not because she didn't want variety, but because she had no way to know whether anything else was safe for her. When ordering food online it was even harder — no one to ask, no way to check, just guessing and hoping for the best.
                      </p>

                      <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '13px', lineHeight: '2', margin: '0 0 14px' }}>
                        She deserved so much more than plain and predictable. She deserved to enjoy food — to explore flavors, try new restaurants, order groceries with confidence, and share meals with family without anxiety. There was no single tool that gave her that. So I built one.
                      </p>

                      <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '13px', lineHeight: '2', margin: '0 0 14px' }}>
                        But as I built it I realized — this isn't just for my mother. This is for <span style={{ color: '#e8c49a', fontWeight: '600' }}>everyone</span>. From the toddler with a severe food allergy to the teenager managing celiac disease. From the parent navigating a child's dietary restrictions to the grandparent managing diabetes, heart disease, or kidney conditions at 80 years old. IngrediSure is built for ages 1 through 100 — a helpful, intelligent companion for <span style={{ color: '#e8c49a', fontWeight: '600' }}>every member of your family.</span>
                      </p>

                      <div style={{ borderTop: '1px solid rgba(232,196,154,0.2)', paddingTop: '16px', marginTop: '4px' }}>
                        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: '2', margin: 0, fontStyle: 'italic' }}>
                          No one should have to guess whether their food is safe. No one should have to choose between enjoying a meal and protecting their health. <span style={{ color: '#e8c49a', fontWeight: '600' }}>That is what IngrediSure is here to change.</span>
                        </p>
                      </div>
                    </div>

                    {/* What is IngrediSure */}
                    <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', padding: '24px 28px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '11px', color: '#e8c49a', letterSpacing: '3px', marginBottom: '12px' }}>WHAT IS INGREDISURE?</div>
                      <p style={{ color: '#ffffff', fontSize: '14px', lineHeight: '1.9', margin: '0 0 12px', fontStyle: 'italic' }}>
                        IngrediSure is the first all-in-one health intelligence hub that combines grocery safety scanning, restaurant finding, meal planning, and recipe suggestions — all filtered through YOUR personal health profile.
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', lineHeight: '1.9', margin: 0 }}>
                        Unlike any other app on the market, IngrediSure doesn't just track calories or macros — it analyzes every ingredient against your specific medical conditions, dietary restrictions, and personal avoidances to give you a clear <span style={{ color: '#7dd97f', fontWeight: 'bold' }}>SAFE</span>, <span style={{ color: '#f0c040', fontWeight: 'bold' }}>CAUTION</span>, or <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>UNSAFE</span> verdict for everything you eat.
                      </p>
                    </div>

                    {/* Why IngrediSure is different */}
                    <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', padding: '24px 28px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '11px', color: '#e8c49a', letterSpacing: '3px', marginBottom: '16px' }}>WHY INGREDISURE IS DIFFERENT</div>
                      {[
                        { icon: '✓', title: 'Medically Aware', desc: 'Built around your specific health conditions — diabetes, hypertension, kidney disease, celiac, and more.' },
                        { icon: '✓', title: 'All In One', desc: 'Grocery scanner, barcode scanner, restaurant finder, meal planner, recipes, and delivery services in a single app.' },
                        { icon: '✓', title: 'Real Ingredient Analysis', desc: 'We analyze actual ingredient lists — not just nutrition labels — so nothing harmful slips through.' },
                        { icon: '✓', title: 'Personalized To You', desc: 'Every safety verdict is based on YOUR conditions and avoidances, not generic dietary guidelines.' },
                        { icon: '✓', title: 'Calorie & Macro Tracking', desc: 'Track daily calories, protein, carbs, fat, sodium and fiber with custom personal goals.' },
                        { icon: '✓', title: 'Medication Safety', desc: 'Add your medications and get instant warnings when foods you eat dangerously interact with them.' },
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '14px', marginBottom: '14px' }}>
                          <span style={{ color: '#7dd97f', fontSize: '16px', flexShrink: 0, marginTop: '2px' }}>{item.icon}</span>
                          <div>
                            <div style={{ color: '#ffffff', fontSize: '13px', fontWeight: '600', marginBottom: '3px', letterSpacing: '0.5px' }}>{item.title}</div>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', lineHeight: '1.6', fontStyle: 'italic' }}>{item.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* How to get started */}
                    <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', padding: '24px 28px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '11px', color: '#e8c49a', letterSpacing: '3px', marginBottom: '16px' }}>HOW TO GET STARTED</div>
                      {[
                        { step: '01', title: 'Set Up Your Health Profile', desc: 'Add your medical conditions and any ingredients you need to avoid. This is the foundation of everything IngrediSure does for you.' },
                        { step: '02', title: 'Scan Your Groceries', desc: 'Search any product or scan its barcode to instantly see if it is safe for your specific health needs.' },
                        { step: '03', title: 'Find Safe Restaurants', desc: 'Enter your ZIP code to discover restaurants near you and check their menus for safe options.' },
                        { step: '04', title: 'Plan Your Meals', desc: 'Use the weekly meal planner and recipe suggestions to build a full week of meals you can eat with confidence.' },
                        { step: '05', title: 'Track Your Nutrition', desc: 'Log your meals daily to track calories and macros against your personal goals.' },
                        { step: '06', title: 'Add Your Medications', desc: 'Enter your prescriptions and get real-time warnings about dangerous food and drug interactions.' },
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: i < 3 ? '20px' : '0', paddingBottom: i < 3 ? '20px' : '0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                          <div style={{ fontSize: '22px', fontWeight: '300', color: 'rgba(232,196,154,0.5)', fontFamily: 'Georgia, serif', flexShrink: 0, width: '32px' }}>{item.step}</div>
                          <div>
                            <div style={{ color: '#ffffff', fontSize: '13px', fontWeight: '600', marginBottom: '4px', letterSpacing: '0.5px' }}>{item.title}</div>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', lineHeight: '1.6', fontStyle: 'italic' }}>{item.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <ContentTile
                      tile={{
                        id: 'health', title: 'Set Up Your Health Profile Now',
                        desc: 'Start here — it only takes 2 minutes and unlocks the full power of IngrediSure',
                        route: '/profile', accent: 'rgba(93,187,99,0.9)',
                        iconPath: <><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></>
                      }}
                      onClick={() => navigate('/profile')}
                      isMobile={false}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '28px' }}>
                    <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', letterSpacing: '3px', marginBottom: '8px' }}>
                      {currentSection.label.toUpperCase()}
                    </div>
                    <h2 style={{ margin: 0, fontSize: '34px', fontWeight: '300', color: '#ffffff', fontFamily: 'Georgia, serif', letterSpacing: '0.5px', textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}>
                      {currentSection.label}
                    </h2>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {currentSection.tiles.map(tile => (
                      <ContentTile key={tile.id} tile={tile} onClick={() => navigate(tile.route)} isMobile={false} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}