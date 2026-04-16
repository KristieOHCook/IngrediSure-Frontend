import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAccessibility } from '../AccessibilityContext';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
];

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [pos, setPos] = useState(() => {
    try {
      const saved = localStorage.getItem('a11yPos');
      return saved ? JSON.parse(saved) : { x: window.innerWidth - 80, y: window.innerHeight - 160 };
    } catch { return { x: window.innerWidth - 80, y: window.innerHeight - 160 }; }
  });

  const isDragging = useRef(false);
  const didDrag = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, px: 0, py: 0 });

  const {
    language, setLanguage,
    simpleMode, setSimpleMode,
    fontSize, setFontSize,
    highContrast, setHighContrast,
    isReading, speak, stopSpeaking,
    selectedVoice, setSelectedVoice, availableVoices,
    t,
  } = useAccessibility();

  // Save position whenever it changes
  useEffect(() => {
    localStorage.setItem('a11yPos', JSON.stringify(pos));
  }, [pos]);

  // Global mouse/touch move and up
  useEffect(() => {
    const onMove = (clientX, clientY) => {
      if (!isDragging.current) return;
      const dx = Math.abs(clientX - dragStart.current.mx);
      const dy = Math.abs(clientY - dragStart.current.my);
      if (dx > 3 || dy > 3) didDrag.current = true;
      const newX = Math.max(10, Math.min(window.innerWidth - 70, dragStart.current.px + (clientX - dragStart.current.mx)));
      const newY = Math.max(10, Math.min(window.innerHeight - 70, dragStart.current.py + (clientY - dragStart.current.my)));
      setPos({ x: newX, y: newY });
    };

    const onMouseMove = (e) => onMove(e.clientX, e.clientY);
    const onTouchMove = (e) => { if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY); };
    const onUp = () => { isDragging.current = false; };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  const startDrag = useCallback((clientX, clientY) => {
    isDragging.current = true;
    didDrag.current = false;
    dragStart.current = { mx: clientX, my: clientY, px: pos.x, py: pos.y };
  }, [pos]);

  const handleMainClick = () => {
    if (didDrag.current) return;
    setOpen(prev => !prev);
  };

  const handleMinimizeClick = (e) => {
    e.stopPropagation();
    if (didDrag.current) return;
    setMinimized(prev => !prev);
    setOpen(false);
  };

  const readPage = () => {
    if (isReading) { stopSpeaking(); return; }

    // Grab all readable text elements in order
    const elements = Array.from(document.querySelectorAll(
      'h1, h2, h3, h4, p, li, td, th, label, button, [aria-label], .readable'
    ));

    const content = elements
      .map(el => el.innerText?.trim())
      .filter(text => text && text.length > 1 && !text.match(/^[←→✓✗⚠×+\-•]+$/))
      .join('. ')
      .replace(/\.+/g, '.')
      .replace(/\s+/g, ' ')
      .trim();

    if (!content) {
      speak('No readable content found on this page.');
      return;
    }

    // Split into chunks of 200 words to avoid speech synthesis cutoff
    const words = content.split(' ');
    const chunks = [];
    for (let i = 0; i < words.length; i += 200) {
      chunks.push(words.slice(i, i + 200).join(' '));
    }

    // Speak chunks sequentially
    let chunkIndex = 0;
    const speakNextChunk = () => {
      if (chunkIndex >= chunks.length) {
        return;
      }
      const utterance = new SpeechSynthesisUtterance(chunks[chunkIndex]);
      const langMap = {
        en: 'en-US', es: 'es-ES', zh: 'zh-CN',
        ja: 'ja-JP', fr: 'fr-FR', ar: 'ar-SA', hi: 'hi-IN',
      };
      utterance.lang = langMap[language] || 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      if (selectedVoice) {
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.name === selectedVoice);
        if (voice) utterance.voice = voice;
      }

      utterance.onend = () => {
        chunkIndex++;
        speakNextChunk();
      };
      utterance.onerror = () => stopSpeaking();

      window.speechSynthesis.speak(utterance);
    };

    window.speechSynthesis.cancel();
    speakNextChunk();
  };

  const resetAll = () => {
    setSimpleMode(false);
    setFontSize('normal');
    setHighContrast(false);
    setLanguage('en');
    setOpen(false);
  };

  const hasActive = simpleMode || highContrast || fontSize !== 'normal' || language !== 'en';

  const panelStyle = {
    position: 'fixed',
    right: pos.x < window.innerWidth / 2 ? 'auto' : '20px',
    left: pos.x < window.innerWidth / 2 ? '80px' : 'auto',
    bottom: pos.y > window.innerHeight / 2 ? `${window.innerHeight - pos.y + 10}px` : 'auto',
    top: pos.y <= window.innerHeight / 2 ? `${pos.y + 64}px` : 'auto',
    width: '292px',
    background: 'rgba(6,6,6,0.97)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '10px',
    padding: '18px',
    zIndex: 9998,
    fontFamily: 'Georgia, serif',
    boxShadow: '0 12px 48px rgba(0,0,0,0.8)',
    maxHeight: '75vh',
    overflowY: 'auto',
  };

  const optBtn = (active) => ({
    padding: '7px 10px',
    background: active ? 'rgba(232,196,154,0.22)' : 'rgba(255,255,255,0.05)',
    border: active ? '1px solid rgba(232,196,154,0.6)' : '1px solid rgba(255,255,255,0.12)',
    borderRadius: '4px',
    color: active ? '#e8c49a' : 'rgba(255,255,255,0.65)',
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
    fontSize: '11px',
    transition: 'all 0.15s',
    fontWeight: active ? '700' : '400',
  });

  const secLabel = (icon, text) => (
    <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', margin: '14px 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span>{icon}</span><span>{text}</span>
    </div>
  );

  return (
    <>
      {/* Widget container — draggable */}
      <div
        style={{
          position: 'fixed',
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '5px',
          userSelect: 'none',
        }}
        onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
        onTouchStart={(e) => { if (e.touches[0]) startDrag(e.touches[0].clientX, e.touches[0].clientY); }}
      >
        {/* Row: main button + minimize */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '3px' }}>

          {/* Main ♿ button */}
          <button
            onClick={handleMainClick}
            aria-label={t.accessibility}
            style={{
              width: minimized ? '34px' : '52px',
              height: minimized ? '34px' : '52px',
              borderRadius: '50%',
              background: open ? 'rgba(232,196,154,0.25)' : 'rgba(0,0,0,0.88)',
              border: open ? '2px solid #e8c49a' : '2px solid rgba(232,196,154,0.55)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: minimized ? '15px' : '22px',
              boxShadow: open ? '0 0 18px rgba(232,196,154,0.35)' : '0 4px 18px rgba(0,0,0,0.55)',
              transition: 'all 0.2s',
              backdropFilter: 'blur(10px)',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            ♿
            {/* Active dot */}
            {hasActive && !minimized && (
              <div style={{
                position: 'absolute', top: '-3px', right: '-3px',
                width: '11px', height: '11px', borderRadius: '50%',
                background: '#e8c49a', border: '2px solid rgba(0,0,0,0.8)',
              }} />
            )}
          </button>

          {/* Minimize / expand button */}
          <button
            onClick={handleMinimizeClick}
            title={minimized ? 'Expand widget' : 'Minimize widget'}
            style={{
              width: '20px', height: '20px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.75)',
              border: '1px solid rgba(255,255,255,0.25)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', color: 'rgba(255,255,255,0.65)',
              marginTop: '2px',
              flexShrink: 0,
              lineHeight: 1,
            }}
          >
            {minimized ? '+' : '−'}
          </button>
        </div>

        {/* 🔊 Read Aloud button — always visible unless minimized */}
        {!minimized && (
          <button
            onClick={(e) => { e.stopPropagation(); if (!isDragging.current && !didDrag.current) readPage(); }}
            style={{
              padding: '5px 12px',
              background: isReading ? 'rgba(255,80,80,0.88)' : 'rgba(0,0,0,0.85)',
              border: isReading ? '1px solid #ff6b6b' : '1px solid rgba(93,187,99,0.65)',
              borderRadius: '14px',
              color: isReading ? '#ffffff' : '#7dd97f',
              cursor: 'pointer',
              fontFamily: 'Georgia, serif',
              fontSize: '11px',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ fontSize: '13px' }}>{isReading ? '🔇' : '🔊'}</span>
            <span>{isReading ? 'Stop' : 'Read'}</span>
          </button>
        )}

        {/* Drag hint */}
        {!minimized && (
          <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.5px', pointerEvents: 'none' }}>
            drag to move
          </div>
        )}
      </div>

      {/* Settings panel */}
      {open && !minimized && (
        <div style={panelStyle}>

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ color: '#e8c49a', fontSize: '12px', letterSpacing: '2px', fontWeight: '600' }}>
              ♿ {t.accessibility.toUpperCase()}
            </div>
            <button onClick={() => setOpen(false)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '22px', padding: 0, lineHeight: 1 }}>
              ×
            </button>
          </div>

          {/* Disclaimer */}
          <div style={{ fontSize: '9px', color: 'rgba(255,200,100,0.7)', lineHeight: '1.6', padding: '8px', background: 'rgba(255,200,100,0.06)', borderRadius: '4px', fontStyle: 'italic' }}>
            ⚕️ {t.notMedicalAdvice} {t.consultDoctor}
          </div>

          {/* Read Aloud */}
          {secLabel('🔊', t.readAloud.toUpperCase())}
          <button onClick={readPage}
            style={{
              width: '100%', padding: '10px',
              background: isReading ? 'rgba(255,107,107,0.18)' : 'rgba(93,187,99,0.14)',
              border: isReading ? '1px solid rgba(255,107,107,0.5)' : '1px solid rgba(93,187,99,0.4)',
              borderRadius: '4px',
              color: isReading ? '#ff9999' : '#7dd97f',
              cursor: 'pointer', fontFamily: 'Georgia, serif',
              fontSize: '12px', letterSpacing: '1px',
            }}>
            {isReading ? `🔇 ${t.stopReading}` : `🔊 Read This Page Aloud`}
          </button>

          {/* Simple Mode */}
          {secLabel('📱', t.simpleMode.toUpperCase())}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setSimpleMode(false)} style={{ ...optBtn(!simpleMode), flex: 1 }}>Standard</button>
            <button onClick={() => setSimpleMode(true)} style={{ ...optBtn(simpleMode), flex: 1 }}>Simple</button>
          </div>

          {/* Font Size */}
          {secLabel('🔤', t.fontSize.toUpperCase())}
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { key: 'normal', label: 'A', desc: 'Normal' },
              { key: 'large', label: 'A+', desc: 'Large' },
              { key: 'extraLarge', label: 'A++', desc: 'X-Large' },
            ].map(s => (
              <button key={s.key} onClick={() => setFontSize(s.key)}
                style={{ ...optBtn(fontSize === s.key), flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', padding: '8px 6px' }}>
                <span style={{ fontSize: s.key === 'normal' ? '12px' : s.key === 'large' ? '15px' : '18px', fontWeight: '700' }}>{s.label}</span>
                <span style={{ fontSize: '9px', opacity: 0.7 }}>{s.desc}</span>
              </button>
            ))}
          </div>

          {/* High Contrast */}
          {secLabel('◑', t.highContrast.toUpperCase())}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setHighContrast(false)} style={{ ...optBtn(!highContrast), flex: 1 }}>Off</button>
            <button onClick={() => setHighContrast(true)} style={{ ...optBtn(highContrast), flex: 1 }}>◑ On</button>
          </div>

          {/* Language */}
          {secLabel('🌐', t.language.toUpperCase())}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {LANGUAGES.map(lang => (
              <button key={lang.code} onClick={() => setLanguage(lang.code)}
                style={{ ...optBtn(language === lang.code), fontSize: '10px', padding: '5px 8px' }}>
                {lang.flag} {lang.label}
              </button>
            ))}
          </div>

          {/* ASL */}
          {secLabel('👋', 'ASL / SIGN LANGUAGE')}
          <button onClick={() => window.open('https://www.youtube.com/results?search_query=ASL+food+health+sign+language+guide', '_blank')}
            style={{ width: '100%', padding: '8px', background: 'rgba(116,185,255,0.1)', border: '1px solid rgba(116,185,255,0.3)', borderRadius: '4px', color: '#74b9ff', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px', marginBottom: '6px' }}>
            👋 ASL Food & Health Video Guides ↗
          </button>
          <button onClick={() => window.open('https://www.nad.org', '_blank')}
            style={{ width: '100%', padding: '8px', background: 'rgba(116,185,255,0.06)', border: '1px solid rgba(116,185,255,0.2)', borderRadius: '4px', color: '#74b9ff', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px' }}>
            🤝 National Association of the Deaf ↗
          </button>

          {/* Reset */}
          {secLabel('↺', 'RESET')}
          <button onClick={resetAll}
            style={{ width: '100%', padding: '9px', background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px' }}>
            ↺ Reset All Accessibility Settings
          </button>

          <div style={{ marginTop: '14px', fontSize: '9px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', fontStyle: 'italic' }}>
            IngrediSure v1.0 · Accessibility Tools
          </div>
        </div>
      )}
    </>
  );
}