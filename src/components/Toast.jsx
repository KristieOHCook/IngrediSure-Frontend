import React, { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, 400);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  const colors = {
    success: {
      bg: 'rgba(93,187,99,0.95)',
      border: 'rgba(93,187,99,1)',
      icon: '✓',
    },
    error: {
      bg: 'rgba(255,107,107,0.95)',
      border: 'rgba(255,107,107,1)',
      icon: '✗',
    },
    warning: {
      bg: 'rgba(240,192,64,0.95)',
      border: 'rgba(240,192,64,1)',
      icon: '⚠',
    },
    info: {
      bg: 'rgba(116,185,255,0.95)',
      border: 'rgba(116,185,255,1)',
      icon: 'ℹ',
    },
    delete: {
      bg: 'rgba(255,107,107,0.95)',
      border: 'rgba(255,107,107,1)',
      icon: '×',
    },
  };

  const color = colors[type] || colors.success;

  return (
    <div style={{
      position: 'fixed',
      bottom: '90px',
      left: '50%',
      transform: `translateX(-50%) ${fadeOut ? 'translateY(20px)' : 'translateY(0)'}`,
      zIndex: 99999,
      background: color.bg,
      border: `1px solid ${color.border}`,
      borderRadius: '8px',
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      backdropFilter: 'blur(16px)',
      fontFamily: 'Georgia, serif',
      fontSize: '13px',
      color: '#ffffff',
      fontWeight: '600',
      letterSpacing: '0.5px',
      opacity: fadeOut ? 0 : 1,
      transition: 'all 0.4s ease',
      whiteSpace: 'nowrap',
      maxWidth: '90vw',
    }}>
      <span style={{ fontSize: '16px' }}>{color.icon}</span>
      <span>{message}</span>
    </div>
  );
}