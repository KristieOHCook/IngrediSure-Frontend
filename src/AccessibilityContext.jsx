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

    const langMap = {
      en: 'en-US', es: 'es-ES', zh: 'zh-CN',
      ja: 'ja-JP', fr: 'fr-FR', ar: 'ar-SA', hi: 'hi-IN',
    };

    const targetLang = langMap[language] || 'en-US';
    const langPrefix = targetLang.split('-')[0];

    window.speechSynthesis.cancel();

    const doSpeak = () => {
      const msg = new SpeechSynthesisUtterance();
      msg.text = text;
      msg.lang = targetLang;
      msg.rate = 0.85;
      msg.pitch = 1;
      msg.volume = 1;

      const voices = window.speechSynthesis.getVoices();
      console.log('Total voices available:', voices.length);

      if (voices.length > 0) {
        const voice = voices.find(v => v.lang.startsWith(langPrefix));
        if (voice) {
          msg.voice = voice;
          console.log('Selected voice:', voice.name);
        } else {
          console.log('No voice found for:', langPrefix);
        }
      }

      msg.onend = () => setIsReading(false);
      msg.onerror = (e) => {
        console.log('Error:', e.error);
        setIsReading(false);
      };

      setIsReading(true);
      window.speechSynthesis.speak(msg);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) {
      console.log('Waiting for voices to load...');
      window.speechSynthesis.addEventListener('voiceschanged', doSpeak, { once: true });
    } else {
      doSpeak();
    }
  };
    // Set language for speech
    

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