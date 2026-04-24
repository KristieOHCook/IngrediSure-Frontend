import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
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
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', letterSpacing: '4px', marginBottom: '16px' }}>
            INGREDISURE
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: '300', color: '#ffffff', marginBottom: '16px', letterSpacing: '1px' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', marginBottom: '32px', maxWidth: '400px', lineHeight: '1.8' }}>
            An unexpected error occurred. Please refresh the page or return to the dashboard.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '12px 28px', background: 'rgba(232,196,154,0.15)', border: '1px solid rgba(232,196,154,0.5)', borderRadius: '4px', color: '#e8c49a', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px' }}
            >
              REFRESH PAGE
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              style={{ padding: '12px 28px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '12px', letterSpacing: '2px' }}
            >
              GO TO DASHBOARD
            </button>
          </div>
          <div style={{ marginTop: '48px', fontSize: '10px', color: 'rgba(255,255,255,0.2)', letterSpacing: '1px', fontStyle: 'italic' }}>
            IngrediSure v1.0
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: require('prop-types').node.isRequired,
};

export default ErrorBoundary;
