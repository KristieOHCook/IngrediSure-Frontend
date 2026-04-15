import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../AccessibilityContext';

const SIMPLE_FEATURES = [
  { label: '🔍 Scan Groceries', labelKey: 'groceryScanner', route: '/grocery', color: '#ff6b35', bg: 'rgba(255,107,53,0.15)' },
  { label: '🍽 Find Restaurants', labelKey: 'restaurantFinder', route: '/restaurant', color: '#74b9ff', bg: 'rgba(116,185,255,0.15)' },
  { label: '📷 Scan Barcode', labelKey: 'barcodeScanner', route: '/barcode', color: '#ff6b35', bg: 'rgba(255,107,53,0.15)' },
  { label: '❤️ My Health', labelKey: 'healthProfile', route: '/profile', color: '#7dd97f', bg: 'rgba(93,187,99,0.15)' },
  { label: '📋 Meal Planner', labelKey: 'mealPlanner', route: '/meal-planner', color: '#74b9ff', bg: 'rgba(116,185,255,0.15)' },
  { label: '🍳 Recipes', labelKey: 'recipes', route: '/recipes', color: '#7dd97f', bg: 'rgba(93,187,99,0.15)' },
  { label: '🛒 My Lists', labelKey: 'groceryLists', route: '/grocery-lists', color: '#e8c49a', bg: 'rgba(232,196,154,0.15)' },
  { label: '💊 Medications', labelKey: 'nutrition', route: '/nutrition', color: '#fd79a8', bg: 'rgba(253,121,168,0.15)' },
  { label: '👨‍👩‍👧 Family', labelKey: 'familyHub', route: '/family', color: '#fdcb6e', bg: 'rgba(253,203,110,0.15)' },
  { label: '💬 Feedback', labelKey: 'feedback', route: '/feedback', color: '#a29bfe', bg: 'rgba(162,155,254,0.15)' },
];

export default function SimpleModeWrapper({ user, onLogout }) {
  const navigate = useNavigate();
  const { t, highContrast, fontSize, speak, isReading, stopSpeaking } = useAccessibility();

  const bgColor = highContrast ? '#000000' : '#1a1a1a';
  const cardBg = highContrast ? '#111111' : '#2a2a2a';
  const textColor = highContrast ? '#ffffff' : '#ffffff';
  const borderColor = highContrast ? '#ffffff' : 'rgba(255,255,255,0.2)';

  const headingSize = fontSize === 'extraLarge' ? '28px' : fontSize === 'large' ? '22px' : '18px';
  const bodySize = fontSize === 'extraLarge' ? '20px' : fontSize === 'large' ? '17px' : '14px';
  const buttonSize = fontSize === 'extraLarge' ? '20px' : fontSize === 'large' ? '17px' : '15px';

  const readWelcome = () => {
    const text = `${t.welcome}. ${user?.username ? `Hello ${user.username}.` : ''} ${t.medicalDisclaimer}. Please select a feature to get started.`;
    speak(text);
  };

  return (
    <div style={{ minHeight: '100vh', background: bgColor, fontFamily: 'Georgia, serif', padding: '0 0 80px 0' }}>

      {/* Header */}
      <div style={{ background: highContrast ? '#000000' : '#111111', borderBottom: `2px solid ${highContrast ? '#ffffff' : 'rgba(232,196,154,0.4)'}`, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: headingSize, fontWeight: '700', color: highContrast ? '#ffffff' : '#e8c49a', letterSpacing: '1px' }}>
            🌿 IngrediSure
          </div>
          <div style={{ fontSize: bodySize, color: highContrast ? '#ffffff' : 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
            {t.tagline}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{ fontSize: bodySize, color: textColor }}>
            👋 {user?.username?.toUpperCase()}
          </div>
          <button
            onClick={() => { isReading ? stopSpeaking() : readWelcome(); }}
            style={{ padding: '8px 16px', background: isReading ? 'rgba(255,107,107,0.2)' : 'rgba(93,187,99,0.2)', border: `2px solid ${isReading ? '#ff6b6b' : '#7dd97f'}`, borderRadius: '4px', color: isReading ? '#ff6b6b' : '#7dd97f', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '13px', letterSpacing: '1px' }}>
            {isReading ? `🔇 ${t.stopReading}` : `🔊 ${t.readAloud}`}
          </button>
        </div>
      </div>

      {/* Medical disclaimer banner */}
      <div style={{ background: highContrast ? '#1a0000' : 'rgba(255,200,100,0.1)', border: `1px solid ${highContrast ? '#ff0000' : 'rgba(255,200,100,0.3)'}`, padding: '12px 24px', margin: '16px 16px 0' }}>
        <div style={{ fontSize: fontSize === 'extraLarge' ? '14px' : '11px', color: highContrast ? '#ffff00' : 'rgba(255,200,100,0.9)', lineHeight: '1.7' }}>
          ⚕️ {t.medicalDisclaimer}
        </div>
      </div>

      {/* Welcome message */}
      <div style={{ padding: '20px 24px 8px', textAlign: 'center' }}>
        <div style={{ fontSize: headingSize, color: textColor, fontWeight: '400', marginBottom: '6px' }}>
          {t.welcome}
        </div>
        <div style={{ fontSize: bodySize, color: highContrast ? '#ffffff' : 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>
          {t.consultDoctor}
        </div>
      </div>

      {/* Big feature buttons */}
      <div style={{ padding: '16px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        {SIMPLE_FEATURES.map(feature => (
          <button
            key={feature.route}
            onClick={() => navigate(feature.route)}
            style={{
              padding: fontSize === 'extraLarge' ? '28px 16px' : fontSize === 'large' ? '24px 16px' : '20px 16px',
              background: highContrast ? '#000000' : feature.bg,
              border: highContrast ? `3px solid ${feature.color}` : `2px solid ${feature.color}40`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: 'Georgia, serif',
              fontSize: buttonSize,
              color: highContrast ? feature.color : textColor,
              fontWeight: '600',
              textAlign: 'center',
              lineHeight: '1.4',
              transition: 'all 0.2s',
              letterSpacing: '0.5px',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = feature.bg; e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            aria-label={t[feature.labelKey] || feature.label}
          >
            {feature.label}
          </button>
        ))}
      </div>

      {/* Log out */}
      <div style={{ padding: '0 16px 16px' }}>
        <button onClick={onLogout}
          style={{ width: '100%', padding: '16px', background: 'transparent', border: `2px solid ${highContrast ? '#ffffff' : 'rgba(255,255,255,0.3)'}`, borderRadius: '8px', color: highContrast ? '#ffffff' : 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: buttonSize, letterSpacing: '2px' }}>
          {t.logout}
        </button>
      </div>

    </div>
  );
}