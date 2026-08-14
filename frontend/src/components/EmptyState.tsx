
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
          btn: 'Get Started',
        };
      case 'history':
        return {
          icon: 'history',
          title: 'No evaluation history',
          desc: 'Completed evaluations will be saved here so you can access them later.',
          btn: null,
        };
      case 'no-resumes':
        return {
          icon: 'upload_file',
          title: 'No resumes uploaded',
          desc: 'Please upload at least one PDF or DOCX resume to perform an evaluation.',
          btn: null,
        };
      case 'no-results':
      default:
        return {
          icon: 'group_off',
          title: 'No candidates evaluated yet',
          desc: 'Perform an evaluation on the Evaluate tab to see candidate match scores here.',
          btn: 'Go to Evaluate',
        };
    }
  };

  const details = getDetails();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px',
        textAlign: 'center',
        maxWidth: 320,
        margin: '0 auto',
      }}
      className="animate-fade-up"
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 10,
          background: '#f5f3f2',
          border: '1px solid #dedad9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 18,
        }}
      >
        <span
          className="material-symbols-outlined text-on-surface-variant"
          style={{ fontSize: 24 }}
        >
          {details.icon}
        </span>
      </div>
      <h3
        style={{
          fontFamily: 'Source Serif 4, Georgia, serif',
          fontSize: 17,
          fontWeight: 600,
          color: '#1b1c1c',
          letterSpacing: '-0.005em',
          marginBottom: 8,
        }}
      >
        {details.title}
      </h3>
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 13,
          color: '#5c5f60',
          lineHeight: 1.6,
          marginBottom: 24,
        }}
      >
        {details.desc}
      </p>
      {details.btn && onAction && (
        <button
          onClick={onAction}
          className="btn-primary"
          style={{ width: 'auto', padding: '12px 28px', fontSize: 14, minHeight: 44 }}
        >
          {details.btn}
        </button>
      )}
    </div>
  );
};
