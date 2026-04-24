import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      fontFamily: 'Georgia, serif',
      color: '#ffffff',
      textAlign: 'center',
      padding: '40px',
    }}>
      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '4px', marginBottom: '24px' }}>
        INGREDISURE
      </div>
      <div style={{ fontSize: '80px', fontWeight: '300', color: 'rgba(232,196,154,0.6)', marginBottom: '8px', letterSpacing: '4px' }}>
        404
      </div>
      <h1 style={{ fontSize: '28px', fontWeight: '300', color: '#ffffff', marginBottom: '16px', letterSpacing: '1px' }}>
        Page Not Found
      </h1>
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', marginBottom: '40px', maxWidth: '400px', lineHeight: '1.8' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ padding: '12px 28px', background: 'rgba(232,196,154,0.15)', border: '1px solid rgba(232,196,154,0.5)', borderRadius: '4px', color: '#e8c49a', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px' }}
        >
          GO TO DASHBOARD
        </button>
        <button
          onClick={() => navigate(-1)}
          style={{ padding: '12px 28px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px' }}
        >
          GO BACK
        </button>
      </div>
      <div style={{ marginTop: '48px', fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '1px', fontStyle: 'italic' }}>
        IngrediSure v1.0
      </div>
    </div>
  );
}
