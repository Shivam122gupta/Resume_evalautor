
interface Props {
  type: 'dashboard' | 'history' | 'no-resumes' | 'no-results';
  onAction?: () => void;
}

export const EmptyState: React.FC<Props> = ({ type, onAction }) => {
  const getDetails = () => {
    switch (type) {
      case 'dashboard':
        return {
          icon: 'rocket_launch',
          title: 'Start your first evaluation',
          desc: 'Paste a job description and upload candidate resumes to screen them with AI.',
          btn: 'Get Started'
        };
      case 'history':
        return {
          icon: 'history',
          title: 'No evaluation history',
          desc: 'Completed evaluations will be saved here so you can access them later.',
          btn: null
        };
      case 'no-resumes':
        return {
          icon: 'upload_file',
          title: 'No resumes uploaded',
          desc: 'Please upload at least one PDF or DOCX resume to perform an evaluation.',
          btn: null
        };
      case 'no-results':
      default:
        return {
          icon: 'group_off',
          title: 'No candidates evaluated yet',
          desc: 'Perform an evaluation on the Dashboard to see candidate match scores.',
          btn: 'Go to Dashboard'
        };
    }
  };

  const details = getDetails();

  return (
    <div className="flex flex-col items-center justify-center py-2xl px-lg text-center bg-surface-container rounded-xl shadow-sm border border-outline-variant/30 animate-fade-up max-w-lg mx-auto mt-md">
      <span className="material-symbols-outlined text-[48px] text-primary mb-md">
        {details.icon}
      </span>
      <h3 className="font-headline-md text-[20px] font-semibold text-on-surface mb-xs">
        {details.title}
      </h3>
      <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs mb-md leading-relaxed">
        {details.desc}
      </p>
      {details.btn && onAction && (
        <button 
          onClick={onAction}
          className="bg-primary text-on-primary font-label-md px-md py-sm rounded-full shadow-sm hover:bg-primary/95 transition-all active:scale-[0.98] font-semibold"
        >
          {details.btn}
        </button>
      )}
    </div>
  );
};
