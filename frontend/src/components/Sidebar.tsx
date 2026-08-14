type Tab = 'dashboard' | 'evaluations' | 'candidates' | 'history';

interface Props {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const NAV_ITEMS: { tab: Tab; icon: string; label: string }[] = [
  { tab: 'dashboard',   icon: 'dashboard',              label: 'Dashboard' },
  { tab: 'evaluations', icon: 'add_circle',              label: 'Evaluate' },
  { tab: 'candidates',  icon: 'supervised_user_circle',  label: 'Candidates' },
  { tab: 'history',     icon: 'history',                 label: 'History' },
];

export const Sidebar: React.FC<Props> = ({ currentTab, onTabChange }) => {
  return (
    <aside
      className="sidebar flex-col bg-surface-container-lowest border-r border-outline-variant h-full min-h-screen fixed top-0 left-0 w-[256px] z-40"
      style={{ borderRight: '1px solid #dedad9' }}
      aria-label="Sidebar navigation"
    >
      {/* Brand */}
      <div
        className="flex items-center gap-2.5 px-6 shrink-0"
        style={{ height: 60, borderBottom: '1px solid #dedad9' }}
      >
        <span
          className="material-symbols-outlined text-on-surface"
          style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}
        >
          bar_chart_4_bars
        </span>
        <span
          style={{
            fontFamily: 'Source Serif 4, Georgia, serif',
            fontSize: 17,
            fontWeight: 600,
            color: '#1b1c1c',
            letterSpacing: '-0.01em',
          }}
        >
          HireLens
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col px-3 pt-5 gap-0.5 flex-1" aria-label="Primary navigation">
        {NAV_ITEMS.map(({ tab, icon, label }) => {
          const active = currentTab === tab;
          return (
            <a
              key={tab}
              href="#"
              role="tab"
              aria-selected={active}
              onClick={(e) => { e.preventDefault(); onTabChange(tab); }}
              className={`flex items-center gap-3 px-3 rounded-md transition-all ${
                active
                  ? 'bg-on-surface text-surface'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
              style={{
                height: 38,
                fontSize: 13,
                fontFamily: 'Inter, sans-serif',
                fontWeight: active ? 500 : 400,
                textDecoration: 'none',
              }}
            >
              <span
                className="material-symbols-outlined shrink-0"
                style={{
                  fontSize: 18,
                  fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {icon}
              </span>
              <span>{label}</span>
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-5 mt-auto shrink-0"
        style={{ borderTop: '1px solid #dedad9', paddingTop: 16, paddingBottom: 20 }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full bg-on-surface flex items-center justify-center shrink-0"
          >
            <span
              className="material-symbols-outlined text-surface"
              style={{ fontSize: 15, fontVariationSettings: "'FILL' 1" }}
            >
              person
            </span>
          </div>
          <div className="min-w-0">
            <p style={{ fontSize: 13, fontWeight: 500, fontFamily: 'Inter, sans-serif', color: '#1b1c1c' }} className="truncate">
              Recruiter
            </p>
            <p style={{ fontSize: 11, fontFamily: 'Inter, sans-serif', color: '#5c5f60' }} className="truncate">
              HireLens AI
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
