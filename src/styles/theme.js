/**
 * IngrediSure Theme
 * Centralized styles used across all components
 * Import and use these instead of defining inline styles repeatedly
 */

// Core colors
export const COLORS = {
  gold: '#e8c49a',
  goldLight: 'rgba(232,196,154,0.85)',
  goldBorder: 'rgba(232,196,154,0.4)',
  goldBg: 'rgba(232,196,154,0.15)',
  green: '#7dd97f',
  greenBg: 'rgba(93,187,99,0.15)',
  greenBorder: 'rgba(93,187,99,0.4)',
  yellow: '#f0c040',
  yellowBg: 'rgba(240,192,64,0.15)',
  yellowBorder: 'rgba(240,192,64,0.4)',
  red: '#ff6b6b',
  redBg: 'rgba(255,107,107,0.15)',
  redBorder: 'rgba(255,107,107,0.4)',
  blue: '#74b9ff',
  blueBg: 'rgba(116,185,255,0.15)',
  blueBorder: 'rgba(116,185,255,0.4)',
  purple: 'rgba(162,155,254,0.9)',
  purpleBg: 'rgba(162,155,254,0.15)',
  purpleBorder: 'rgba(162,155,254,0.4)',
  orange: 'rgba(255,107,53,0.9)',
  orangeBg: 'rgba(255,107,53,0.15)',
  orangeBorder: 'rgba(255,107,53,0.4)',
  white: '#ffffff',
  whiteSubtle: 'rgba(255,255,255,0.85)',
  whiteMuted: 'rgba(255,255,255,0.5)',
  whiteDim: 'rgba(255,255,255,0.3)',
};

// Glass card container
export const glassCard = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '8px',
  padding: '24px 28px',
  marginBottom: '20px',
};

// Strong glass card
export const glassCardStrong = {
  background: 'rgba(255,255,255,0.1)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: '8px',
  padding: '24px 28px',
  marginBottom: '20px',
};

// Input field
export const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '4px',
  color: '#ffffff',
  fontFamily: 'Georgia, serif',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
};

// Primary button (gold)
export const btnPrimary = {
  padding: '10px 24px',
  background: 'rgba(232,196,154,0.15)',
  border: '1px solid rgba(232,196,154,0.5)',
  borderRadius: '4px',
  color: '#e8c49a',
  cursor: 'pointer',
  fontFamily: 'Georgia, serif',
  fontSize: '11px',
  letterSpacing: '1.5px',
  transition: 'all 0.25s',
};

// Success button (green)
export const btnSuccess = {
  padding: '10px 24px',
  background: 'rgba(93,187,99,0.15)',
  border: '1px solid rgba(93,187,99,0.4)',
  borderRadius: '4px',
  color: '#7dd97f',
  cursor: 'pointer',
  fontFamily: 'Georgia, serif',
  fontSize: '11px',
  letterSpacing: '1.5px',
  transition: 'all 0.25s',
};

// Danger button (red)
export const btnDanger = {
  padding: '10px 24px',
  background: 'rgba(255,107,107,0.15)',
  border: '1px solid rgba(255,107,107,0.4)',
  borderRadius: '4px',
  color: '#ff6b6b',
  cursor: 'pointer',
  fontFamily: 'Georgia, serif',
  fontSize: '11px',
  letterSpacing: '1.5px',
  transition: 'all 0.25s',
};

// Section label
export const sectionLabel = {
  fontSize: '10px',
  color: 'rgba(255,255,255,0.4)',
  letterSpacing: '3px',
  marginBottom: '14px',
  fontFamily: 'Georgia, serif',
};

// Gold section label
export const sectionLabelGold = {
  fontSize: '10px',
  color: '#e8c49a',
  letterSpacing: '3px',
  marginBottom: '14px',
  fontFamily: 'Georgia, serif',
};

// Chip/badge base style
export const chip = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '12px',
  fontFamily: 'Georgia, serif',
};

// Page container
export const pageContainer = {
  minHeight: '100vh',
  fontFamily: 'Georgia, serif',
  position: 'relative',
  overflow: 'hidden',
};

// Content wrapper
export const contentWrapper = {
  position: 'relative',
  zIndex: 2,
  maxWidth: '800px',
  margin: '0 auto',
  padding: '40px 24px',
};

// Background overlay
export const bgOverlay = {
  position: 'fixed',
  inset: 0,
  zIndex: 1,
  background: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.65) 100%)',
};

// Page header back button
export const backButton = {
  background: 'transparent',
  color: 'rgba(255,255,255,0.85)',
  border: '1px solid rgba(255,255,255,0.4)',
  padding: '10px 24px',
  borderRadius: '2px',
  cursor: 'pointer',
  fontFamily: 'Georgia, serif',
  fontSize: '12px',
  letterSpacing: '2px',
};

// Font family constant
export const FONT = 'Georgia, serif';