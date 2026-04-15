import React from 'react';

export default function SMSReminder({ compact = false }) {

  const shareViaText = () => {
    const message = `Don't forget to check your ingredients today! Open IngrediSure: https://ingredisure.com — Eat Well. Choose Wisely.`;
    if (navigator.share) {
      navigator.share({ title: 'IngrediSure Reminder', text: message }).catch(() => {});
      return;
    }
    window.open(`sms:?body=${encodeURIComponent(message)}`);
  };

  const shareToWhatsApp = () => {
    const message = `Don't forget to check your ingredients today! Open IngrediSure: https://ingredisure.com`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!compact) return null;

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <span
        onClick={shareToWhatsApp}
        style={{ padding: '6px 14px', background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.4)', borderRadius: '2px', color: '#25d366', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px' }}>
        📱 SHARE VIA WHATSAPP
      </span>
      <span
        onClick={shareViaText}
        style={{ padding: '6px 14px', background: 'rgba(116,185,255,0.15)', border: '1px solid rgba(116,185,255,0.4)', borderRadius: '2px', color: '#74b9ff', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px' }}>
        💬 SHARE VIA TEXT
      </span>
    </div>
  );
}