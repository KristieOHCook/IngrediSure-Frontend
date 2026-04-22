import React from 'react';

export default function LoadingScreen({ bg }) {
  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: 'Georgia, serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background — same as the page so transition is seamless */}
      {bg && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0,
          backgroundImage: `url(${bg})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />
      )}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1,
        background: 'linear-gradient(135deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.65) 100%)',
      }} />

      {/* Skeleton content */}
      <div style={{
        position: 'relative', zIndex: 2,
        maxWidth: '800px', margin: '0 auto',
        padding: '40px 24px',
      }}>

        {/* Header skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <div style={skeletonStyle(80, 10, 8)} />
            <div style={skeletonStyle(240, 36, 12)} />
          </div>
          <div style={skeletonStyle(120, 40, 8)} />
        </div>

        {/* Content skeletons */}
        <div style={cardSkeletonStyle}>
          <div style={skeletonStyle(160, 12, 6)} />
          <div style={{ ...skeletonStyle('100%', 14, 8), marginTop: 12 }} />
          <div style={{ ...skeletonStyle('85%', 14, 8), marginTop: 8 }} />
          <div style={{ ...skeletonStyle('70%', 14, 8), marginTop: 8 }} />
        </div>

        <div style={cardSkeletonStyle}>
          <div style={skeletonStyle(200, 12, 6)} />
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            {[1,2,3].map(i => (
              <div key={i} style={skeletonStyle('32%', 80, 8)} />
            ))}
          </div>
        </div>

        <div style={cardSkeletonStyle}>
          <div style={skeletonStyle(180, 12, 6)} />
          <div style={{ ...skeletonStyle('100%', 14, 8), marginTop: 12 }} />
          <div style={{ ...skeletonStyle('90%', 14, 8), marginTop: 8 }} />
        </div>

      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
      `}</style>
    </div>
  );
}

const skeletonStyle = (width, height, borderRadius = 4) => ({
  width: typeof width === 'number' ? `${width}px` : width,
  height: `${height}px`,
  borderRadius: `${borderRadius}px`,
  background: 'linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 75%)',
  backgroundSize: '400px 100%',
  animation: 'shimmer 1.4s infinite linear',
});

const cardSkeletonStyle = {
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '4px',
  padding: '24px 28px',
  marginBottom: '20px',
};