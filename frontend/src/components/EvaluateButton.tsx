interface Props {
  loading: boolean;
  disabled: boolean;
  progressMessage: string;
  onClick: () => void;
}

export const EvaluateButton: React.FC<Props> = ({
  loading,
  disabled,
  progressMessage,
  onClick,
}) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      <button
        onClick={onClick}
        disabled={disabled || loading}
        id="evaluate-btn"
        aria-label={loading ? 'Evaluating resumes, please wait...' : 'Evaluate resumes'}
        aria-busy={loading}
        className="btn-primary"
      >
        {loading ? (
          <>
            <span
              className="w-4 h-4 border-[1.5px] rounded-full animate-spin shrink-0"
              style={{ borderColor: 'rgba(255,255,255,0.25)', borderTopColor: '#ffffff' }}
              aria-hidden="true"
            />
            <span>{progressMessage || 'Analyzing resumes…'}</span>
          </>
        ) : (
          <>
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}
              aria-hidden="true"
            >
              play_arrow
            </span>
            <span>Evaluate Resumes</span>
          </>
        )}
      </button>

      {/* Disclaimer */}
      <div className="flex items-center gap-1.5 justify-center">
        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 12 }}>info</span>
        <span style={{ fontSize: 11, fontFamily: 'Inter, sans-serif', color: '#888b8b' }}>
          Resume content is processed by your configured AI provider.
        </span>
      </div>
    </div>
  );
};
