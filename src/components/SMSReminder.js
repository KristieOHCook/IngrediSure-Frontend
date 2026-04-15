import React, { useState } from 'react';

// This component shows users how to set up SMS reminders
// Real SMS requires Twilio backend integration (future feature)
// For now we use device native SMS + Web Share API

export default function SMSReminder({ compact = false }) {
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);

  const shareViaText = () => {
    const message = `Don't forget to check your ingredients today! Open IngrediSure: https://ingredisure.com — Eat Well. Choose Wisely. 💚`;

    // Try Web Share API first (mobile)
    if (navigator.share) {
      navigator.share({
        title: 'IngrediSure Reminder',
        text: message,
      }).catch(() => {});
      return;
    }

    // Fallback to SMS link
    const smsUrl = `sms:${phone}?body=${encodeURIComponent(message)}`;
    window.open(smsUrl);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  const shareToWhatsApp = () => {
    const message = `Don't forget to check your ingredients today! Open IngrediSure: https://ingredisure.com 💚`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (compact) return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <span onClick={shareToWhatsApp}
        style={{ padding: '6px 14px', background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.4)', borderRadius: '2px', color: '#25d366', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px' }}>
        📱 SHARE VIA WHATSAPP
      </span>
      <span onClick={shareViaText}
        style={{ padding: '6px 14px', background: 'rgba(116,185,255,0.15)', border: '1px solid rgba(116,185,255,0.4)', borderRadius: '2px', color: '#74b9ff', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '11px', letterSpacing: '1px' }}>
        💬 SHARE VIA TEXT
      </span>
    </div>
  );

  return null;
}