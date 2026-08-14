import React, { useEffect } from 'react';
import { Logo } from './Logo';

interface Props {
  onComplete: () => void;
}

export const SplashScreen: React.FC<Props> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000); // Strict 3 second duration

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'var(--color-background)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
      className="splash-container"
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {/* Large Centered Logo Symbol (no text inline) */}
        <div className="splash-logo" style={{ marginBottom: 24 }}>
          <Logo showText={false} size={96} />
        </div>

        {/* Wordmark Title */}
        <h1
          className="splash-wordmark"
          style={{
            fontFamily: 'Source Serif 4, Georgia, serif',
            fontSize: 'min(36px, 8dvw)',
            fontWeight: 600,
            color: 'var(--color-primary)',
            letterSpacing: '-0.015em',
            lineHeight: 1,
            margin: '0 0 10px 0',
          }}
        >
          HireLens
        </h1>

        {/* Tagline */}
        <p
          className="splash-tagline"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 'min(13px, 3.5dvw)',
            fontWeight: 500,
            color: 'var(--color-on-surface-variant)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          AI-Powered Candidate Intelligence
        </p>
      </div>
    </div>
  );
};
