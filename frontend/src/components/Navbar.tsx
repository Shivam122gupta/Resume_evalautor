type Tab = 'landing' | 'dashboard' | 'evaluations' | 'candidates' | 'history';

interface Props {
  currentTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const NAV_ITEMS: { tab: Tab; icon: string; label: string }[] = [
  { tab: 'landing',     icon: 'home',                   label: 'Home' },
  { tab: 'dashboard',   icon: 'dashboard',              label: 'Dashboard' },
  { tab: 'evaluations', icon: 'add_circle',              label: 'Evaluate' },
  { tab: 'candidates',  icon: 'supervised_user_circle',  label: 'Candidates' },
  { tab: 'history',     icon: 'history',                 label: 'History' },
];

export const Navbar: React.FC<Props> = ({ currentTab, onTabChange }) => {
  return (
    <nav
      className="bottom-nav fixed bottom-0 left-0 w-full z-50 bg-surface-container-lowest pb-safe"
      style={{ borderTop: '1px solid #dedad9' }}
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center h-16 max-w-[640px] mx-auto px-2">
        {NAV_ITEMS.map(({ tab, icon, label }) => {
          const active = currentTab === tab;
          return (
            <a
              key={tab}
              href="#"
              role="tab"
              aria-selected={active}
              aria-label={label}
              onClick={(e) => { e.preventDefault(); onTabChange(tab); }}
              className={`flex flex-col items-center justify-center gap-1 py-2 transition-all rounded-lg ${
                active ? 'text-on-surface' : 'text-on-surface-variant'
              }`}
              style={{ minWidth: 56, textDecoration: 'none' }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: 22,
                  fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {icon}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: active ? 600 : 500,
                  letterSpacing: '0.02em',
                }}
              >
                {label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
};
