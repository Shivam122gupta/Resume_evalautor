
interface Props {
  currentTab: 'dashboard' | 'evaluations' | 'candidates';
  onTabChange: (tab: 'dashboard' | 'evaluations' | 'candidates') => void;
}

export const Navbar: React.FC<Props> = ({ currentTab, onTabChange }) => {
  const handleTabClick = (e: React.MouseEvent, tab: 'dashboard' | 'evaluations' | 'candidates') => {
    e.preventDefault();
    onTabChange(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-xl pb-safe shadow-[0_-1px_8px_rgba(0,0,0,0.04)] border-t border-outline-variant/30">
      <div className="flex justify-around items-center h-16 max-w-[1280px] mx-auto px-margin-mobile">
        <a 
          href="#"
          onClick={(e) => handleTabClick(e, 'dashboard')}
          className={`flex flex-col items-center justify-center gap-xs w-20 h-full transition-colors ${
            currentTab === 'dashboard' ? 'text-primary' : 'text-on-surface-variant hover:text-primary/70'
          }`}
        >
          <span className="material-symbols-outlined font-semibold">home</span>
          <span className="font-label-sm text-label-sm">Dashboard</span>
        </a>

        <a 
          href="#"
          onClick={(e) => handleTabClick(e, 'evaluations')}
          className={`flex flex-col items-center justify-center gap-xs w-20 h-full transition-colors ${
            currentTab === 'evaluations' ? 'text-primary' : 'text-on-surface-variant hover:text-primary/70'
          }`}
        >
          <span className="material-symbols-outlined font-semibold">history_edu</span>
          <span className="font-label-sm text-label-sm font-medium">Evaluations</span>
        </a>

        <a 
          href="#"
          onClick={(e) => handleTabClick(e, 'candidates')}
          className={`flex flex-col items-center justify-center gap-xs w-20 h-full transition-colors ${
            currentTab === 'candidates' ? 'text-primary' : 'text-on-surface-variant hover:text-primary/70'
          }`}
        >
          <span className="material-symbols-outlined font-semibold">group</span>
          <span className="font-label-sm text-label-sm font-medium">Candidates</span>
        </a>
      </div>
    </nav>
  );
};
