import React, { useEffect, useState } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    if (localStorage.getItem('installDismissed')) return;

    // Check if iOS
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    const standalone = window.navigator.standalone;
    if (ios && !standalone) {
      setIsIOS(true);
      setShowBanner(true);
      return;
    }

    // Android / Chrome install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('installDismissed', '1');
  };

  if (!showBanner || dismissed) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(232,196,154,0.3)',
      padding: '16px 20px',
      fontFamily: 'Georgia, serif',
    }}>
      <div style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <img src="/logo.jpg" alt="IngrediSure"
          style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
          onError={e => e.target.style.display = 'none'}
        />
        <div style={{ flex: 1 }}>
          <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600', marginBottom: '3px' }}>
            Add IngrediSure to your home screen
          </div>
          {isIOS ? (
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontStyle: 'italic', lineHeight: '1.5' }}>
              Tap <strong style={{ color: '#e8c49a' }}>Share</strong> then <strong style={{ color: '#e8c49a' }}>"Add to Home Screen"</strong> for instant access to ingredient safety checks
            </div>
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontStyle: 'italic', lineHeight: '1.5' }}>
              Install the app for faster access, offline use and home screen shortcuts
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
          {!isIOS && (
            <button onClick={handleInstall}
              style={{ padding: '8px 16px', background: 'rgba(232,196,154,0.25)', border: '1px solid rgba(232,196,154,0.5)', borderRadius: '2px', color: '#e8c49a', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
              INSTALL
            </button>
          )}
          <button onClick={handleDismiss}
            style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '2px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px' }}>
            NOT NOW
          </button>
        </div>
      </div>
    </div>
  );
}