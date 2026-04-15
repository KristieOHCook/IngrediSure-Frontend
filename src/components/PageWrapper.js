import React from 'react';
import { useAccessibility } from '../AccessibilityContext';
import ReadAloudButton from './ReadAloudButton';

export default function PageWrapper({ children, title, description, readText, showHeader = true, bg }) {
  const { highContrast, fontSize, t, isRTL } = useAccessibility();

  const bodySize = fontSize === 'extraLarge' ? '18px' : fontSize === 'large' ? '16px' : '14px';
  const headingSize = fontSize === 'extraLarge' ? '42px' : fontSize === 'large' ? '38px' : '32px';

  // High contrast overrides
  if (highContrast) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000000',
        color: '#ffffff',
        fontFamily: 'Georgia, serif',
        fontSize: bodySize,
        direction: isRTL ? 'rtl' : 'ltr',
      }}>
        {/* High contrast header */}
        {showHeader && title && (
          <div style={{
            background: '#000000',
            borderBottom: '3px solid #ffffff',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#ffffff', letterSpacing: '3px', marginBottom: '4px' }}>
                INGREDISURE
              </div>
              <h1 style={{ margin: 0, fontSize: headingSize, color: '#ffffff', fontWeight: '700' }}>
                {title}
              </h1>
              {description && (
                <p style={{ margin: '6px 0 0', fontSize: bodySize, color: '#ffffff' }}>
                  {description}
                </p>
              )}
            </div>
            {readText && <ReadAloudButton text={readText} />}
          </div>
        )}

        {/* High contrast disclaimer */}
        <div style={{
          background: '#1a0000',
          border: '2px solid #ff0000',
          padding: '10px 24px',
          fontSize: '12px',
          color: '#ffff00',
          lineHeight: '1.6',
        }}>
          ⚕️ {t.notMedicalAdvice} {t.consultDoctor}
        </div>

        {/* Content with high contrast styles injected */}
        <div style={{ padding: '24px' }}
          className="high-contrast-content">
          {children}
        </div>
      </div>
    );
  }

  // Normal mode — just apply font size and RTL direction
  return (
    <div style={{
      fontSize: bodySize,
      direction: isRTL ? 'rtl' : 'ltr',
    }}>
      {children}
    </div>
  );
}