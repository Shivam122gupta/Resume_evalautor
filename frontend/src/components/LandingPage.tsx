import { Logo } from './Logo';

interface Props {
  onStart: () => void;
}

export const LandingPage: React.FC<Props> = ({ onStart }) => {
  return (
    <div
      style={{
        background: 'var(--color-background)',
        color: 'var(--color-primary)',
        fontFamily: 'Inter, sans-serif',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
      }}
      className="animate-fade-up"
    >
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid var(--color-outline-variant)',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        <Logo />
        <button
          onClick={onStart}
          className="btn-secondary"
          style={{ fontSize: 12, padding: '6px 14px' }}
        >
          Launch App
        </button>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 10,
            fontWeight: 600,
            color: 'var(--color-secondary)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 16,
            display: 'inline-block',
          }}
        >
          AI-Powered Candidate Screening
        </span>
        <h1
          style={{
            fontFamily: 'Source Serif 4, Georgia, serif',
            fontSize: 'min(48px, 9dvw)',
            fontWeight: 600,
            lineHeight: 1.15,
            color: 'var(--color-primary)',
            letterSpacing: '-0.02em',
            marginBottom: 20,
          }}
        >
          Identify top talent with editorial precision.
        </h1>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 15,
            color: 'var(--color-on-surface-variant)',
            lineHeight: 1.6,
            maxWidth: 580,
            marginBottom: 36,
          }}
        >
          Upload batch resumes and match them instantly against your job description. Get detailed skill breakdowns, experience assessments, and intelligent candidate rankings.
        </p>

        <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 360, justifyContent: 'center' }}>
          <button
            onClick={onStart}
            className="btn-primary"
            style={{ flex: 1, minHeight: 48, fontSize: 15 }}
          >
            Start Evaluating
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
            width: '100%',
            marginTop: 64,
          }}
        >
          {[
            {
              icon: 'query_stats',
              title: 'Instant Ranking',
              desc: 'Evaluate dozens of resumes in seconds and see candidates sorted by precision match scores.',
            },
            {
              icon: 'checklist',
              title: 'Skill Breakdown',
              desc: 'Map matching and missing qualifications automatically to skip manual screening.',
            },
            {
              icon: 'verified_user',
              title: 'Secure & Private',
              desc: 'Your candidate data is protected and evaluated strictly within your secure workspace.',
            },
          ].map((feat, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--color-surface-bright)',
                border: '1px solid var(--color-outline-variant)',
                borderRadius: 8,
                padding: '24px 20px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 6,
                  background: 'var(--color-surface-variant)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-secondary)' }}>{feat.icon}</span>
              </div>
              <h3 style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 16, fontWeight: 600, color: 'var(--color-primary)' }}>
                {feat.title}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', lineHeight: 1.5 }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom banner */}
        <div style={{ marginTop: 64, borderTop: '1px solid var(--color-outline-variant)', paddingTop: 24, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <p style={{ fontSize: 12, color: 'var(--color-outline)' }}>
            Built for modern recruitment teams · Driven by custom intelligence
          </p>
          <p style={{ fontSize: 11, color: 'var(--color-on-surface-variant)' }}>
            Designed & Developed by{' '}
            <a
              href="https://github.com/Shivam122gupta"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-secondary)', textDecoration: 'none', fontWeight: 600 }}
              className="hover:underline"
            >
              Shivam Gupta
            </a>
          </p>
        </div>
      </main>
    </div>
  );
};
