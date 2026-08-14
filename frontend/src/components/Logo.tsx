import React from 'react';

interface Props {
  showText?: boolean;
  size?: number;
}

export const Logo: React.FC<Props> = ({ showText = true, size = 24 }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      {/* SVG Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
        className="hover:scale-105"
      >
        {/* Outer Aperture/Lens Ring - Claude Rust Accent */}
        <circle cx="64" cy="64" r="54" stroke="var(--color-secondary)" strokeWidth="6" fill="none" stroke-linecap="round" stroke-dasharray="32 12 64 12" />
        
        {/* Outer Eye Shape Arcs - Deep slate color */}
        <path d="M18 64 C 40 28, 88 28, 110 64 C 88 100, 40 100, 18 64 Z" stroke="var(--color-primary)" strokeWidth="5" fill="none" stroke-linejoin="round" />
        
        {/* Focus Target Corners */}
        <path d="M40 40 L34 40 L34 46" stroke="var(--color-primary)" strokeWidth="3" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        <path d="M88 40 L94 40 L94 46" stroke="var(--color-primary)" strokeWidth="3" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        <path d="M40 88 L34 88 L34 82" stroke="var(--color-primary)" strokeWidth="3" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        <path d="M88 88 L94 88 L94 82" stroke="var(--color-primary)" strokeWidth="3" stroke-linecap="round" stroke-linejoin="round" fill="none" />

        {/* Candidate Avatar Profile */}
        <circle cx="64" cy="54" r="12" fill="var(--color-primary)" />
        <path d="M46 80 C 46 70, 52 68, 64 68 C 76 68, 82 70, 82 80" stroke="var(--color-primary)" strokeWidth="4.5" fill="none" stroke-linecap="round" />
        
        {/* Evaluation Checkmark */}
        <path d="M68 64 L72 68 L80 60" stroke="var(--color-secondary)" strokeWidth="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
      </svg>

      {/* Brand Text */}
      {showText && (
        <span
          style={{
            fontFamily: 'Source Serif 4, Georgia, serif',
            fontSize: 17,
            fontWeight: 600,
            color: 'var(--color-primary)',
            letterSpacing: '-0.015em',
            lineHeight: 1,
          }}
        >
          HireLens
        </span>
      )}
    </div>
  );
};
