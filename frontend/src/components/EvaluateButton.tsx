
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
    <div className="flex flex-col gap-sm w-full">
      <button
        onClick={onClick}
        disabled={disabled || loading}
        id="evaluate-btn"
        className="w-full bg-primary text-on-primary font-label-md py-md rounded-full shadow-md hover:bg-primary/90 hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-sm"
      >
        {loading ? (
          <>
            <span className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin"></span>
            <span>{progressMessage || 'Analyzing resumes...'}</span>
          </>
        ) : (
          <span>Evaluate Resumes</span>
        )}
      </button>
      
      <div className="flex items-center gap-xs justify-center text-center mt-xs">
        <span className="material-symbols-outlined text-outline text-sm">info</span>
        <span className="font-label-sm text-label-sm text-outline">
          Resume content is processed by the configured AI provider for evaluation.
        </span>
      </div>
    </div>
  );
};
