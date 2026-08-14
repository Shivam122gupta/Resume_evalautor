import { Logo } from './Logo';

interface Props {
  title?: string;
  onBack?: () => void;
  currentTab?: string;
}

export const Header: React.FC<Props> = ({ title = 'HireLens', onBack }) => {
  return (
    <header
      className="mobile-header fixed top-0 left-0 w-full z-50 bg-surface-container-lowest pt-safe"
      style={{
        borderBottom: '1px solid #dedad9',
        boxShadow: '0 1px 0 #dedad9',
      }}
    >
      <div
        className="px-4 flex items-center justify-between"
        style={{ height: 56 }}
      >
        {/* Left: back or brand */}
        <div className="flex items-center gap-2 min-w-0">
          {onBack ? (
            <button
              onClick={onBack}
              aria-label="Go back"
              className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface transition-colors"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back_ios_new</span>
              <span
                className="text-on-surface truncate max-w-[180px]"
                style={{
                  fontFamily: 'Source Serif 4, Georgia, serif',
                  fontSize: 17,
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                }}
              >
                {title}
              </span>
            </button>
          ) : (
            <Logo />
          )}
        </div>

        {/* Right: notification + avatar */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            aria-label="Notifications"
            className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors rounded-md hover:bg-surface-container"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>notifications</span>
          </button>
          <div
            className="w-8 h-8 rounded-full bg-on-surface flex items-center justify-center shrink-0"
            aria-label="Profile"
          >
            <span
              className="material-symbols-outlined text-surface"
              style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}
            >
              person
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
