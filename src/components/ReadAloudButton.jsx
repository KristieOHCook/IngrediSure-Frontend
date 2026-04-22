import React from 'react';
import { useAccessibility } from '../AccessibilityContext';

export default function ReadAloudButton({ text, style }) {
  const { speak, stopSpeaking, isReading, t } = useAccessibility();

  return (
    <button
      onClick={() => isReading ? stopSpeaking() : speak(text)}
      style={{
        padding: '6px 14px',
        background: isReading ? 'rgba(255,107,107,0.2)' : 'rgba(93,187,99,0.15)',
        border: isReading ? '1px solid rgba(255,107,107,0.5)' : '1px solid rgba(93,187,99,0.4)',
        borderRadius: '2px',
        color: isReading ? '#ff9999' : '#7dd97f',
        cursor: 'pointer',
        fontFamily: 'Georgia, serif',
        fontSize: '11px',
        letterSpacing: '1px',
        transition: 'all 0.2s',
        ...style,
      }}
      aria-label={isReading ? t.stopReading : t.readAloud}
    >
      {isReading ? t.stopReading : t.readAloud}
    </button>
  );
}