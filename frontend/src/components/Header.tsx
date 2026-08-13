
interface Props {
  title?: string;
  onBack?: () => void;
}

export const Header: React.FC<Props> = ({ title = 'Dashboard', onBack }) => {
  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/30">
      <div className="h-16 px-margin-mobile flex items-center justify-between">
        <div className="flex items-center gap-sm">
          {onBack ? (
            <button 
              onClick={onBack}
              className="w-10 h-10 mr-xs flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-[20px] font-bold">arrow_back_ios_new</span>
            </button>
          ) : (
            <img 
              alt="Resume Evaluator Logo" 
              className="h-8 w-auto object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9ScI3ivaVDCduz0mZXfGENP4zw_h8dWEixXfFZ_dPCJSUbxyzOz-9qww2aGWdiXd7z4Aks4UlRb2XGsG6kZ-32GU_Q2LxtACIKCxPepYRpfojmfM86QbxViSDhIlnV8CkPqQN-3cTDdqqGEMGFqTgFczDODhV8L1OYuMvDblfbeo_vsabBolZuMy79m4ZbIYADygTUTqeRPaT1ZYoTTQUlXOfS9JzTY_RmgDD4EwYuf89AvuGe1Oq"
            />
          )}
          <span className="font-headline-md text-headline-md text-primary truncate max-w-[200px] md:max-w-none">
            {title}
          </span>
        </div>
        
        <div className="flex items-center gap-md">
          <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <img 
            alt="Profile" 
            className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/10" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4Qev0jjYy1b51EL70X1HKwedcBvGwXgUE9bnxhvfaOFgNMJwq-yGyjCjgEHMPTAush_l9vrjC0qrZZOuo8HYTk_N3ioziqtlF4OAghM8G2Zn3TRzXus68-_N1IROoTaVSkQG0i7ZgvRu-a2QizNFa3smsiKoztIgiolcRUYmlZwfb4GzYkBoG8rRcHvI2E0dsJ4IaBpGvO3er67TEo658qIF4SkO_GNXQGUL500PrkNSOTRXGpSnR"
          />
        </div>
      </div>
    </header>
  );
};
