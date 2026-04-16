import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from './translations';

const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
  const [language, setLanguage] = useState(() =>
    localStorage.getItem('language') || 'en'
  );
  const [simpleMode, setSimpleMode] = useState(() =>
    localStorage.getItem('simpleMode') === 'true'
  );
  const [fontSize, setFontSize] = useState(() =>
    localStorage.getItem('fontSize') || 'normal'
  );
  const [highContrast, setHighContrast] = useState(() =>
    localStorage.getItem('highContrast') === 'true'
  );
  const [isReading, setIsReading] = useState(false);

  const t = translations[language] || translations.en;

  const isRTL = language === 'ar';

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [language, isRTL]);

  useEffect(() => {
    localStorage.setItem('simpleMode', simpleMode);
    if (simpleMode) {
      document.body.classList.add('simple-mode');
    } else {
      document.body.classList.remove('simple-mode');
    }
  }, [simpleMode]);

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
    // Remove all font size classes first
    document.body.classList.remove('font-large', 'font-xlarge');
    if (fontSize === 'large') {
      document.body.classList.add('font-large');
    } else if (fontSize === 'extraLarge') {
      document.body.classList.add('font-xlarge');
    }
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('highContrast', highContrast);
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Set language for speech
    const langMap = {
      en: 'en-US', es: 'es-ES', zh: 'zh-CN',
      ja: 'ja-JP', fr: 'fr-FR', ar: 'ar-SA', hi: 'hi-IN',
    };
    utterance.lang = langMap[language] || 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);

    setIsReading(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsReading(false);
  };

  const getFontSize = () => {
    const sizes = { normal: '14px', large: '18px', extraLarge: '22px' };
    return sizes[fontSize] || '14px';
  };

  const getHeadingSize = () => {
    const sizes = { normal: '32px', large: '40px', extraLarge: '48px' };
    return sizes[fontSize] || '32px';
  };

  return (
    <AccessibilityContext.Provider value={{
      language, setLanguage,
      simpleMode, setSimpleMode,
      fontSize, setFontSize,
      highContrast, setHighContrast,
      isReading, speak, stopSpeaking,
      t, isRTL, getFontSize, getHeadingSize,
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}