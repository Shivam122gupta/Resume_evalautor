import type { EvaluationSummary } from '../types';

interface Props {
  summary: EvaluationSummary;
}

export const SummaryCards: React.FC<Props> = ({ summary }) => {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-sm">
      <div className="bg-surface-container rounded-xl p-md flex flex-col gap-xs shadow-sm border border-outline-variant/20">
        <div className="flex items-center gap-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-[20px]">description</span>
          <span className="font-label-md text-label-md">Total Resumes</span>
        </div>
        <span className="font-headline-md text-headline-md text-on-surface">{summary.total}</span>
      </div>

      <div className="bg-surface-container rounded-xl p-md flex flex-col gap-xs shadow-sm border border-outline-variant/20">
        <div className="flex items-center gap-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-[20px] text-green-600">check_circle</span>
          <span className="font-label-md text-label-md">Evaluated</span>
        </div>
        <span className="font-headline-md text-headline-md text-on-surface">{summary.successful}</span>
      </div>

      <div className="bg-surface-container rounded-xl p-md flex flex-col gap-xs shadow-sm border border-outline-variant/20">
        <div className="flex items-center gap-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-[20px] text-error">error</span>
          <span className="font-label-md text-label-md">Failed</span>
        </div>
        <span className="font-headline-md text-headline-md text-on-surface">{summary.failed}</span>
      </div>

      <div className="bg-surface-container rounded-xl p-md flex flex-col gap-xs shadow-sm border border-outline-variant/20">
        <div className="flex items-center gap-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-[20px] text-primary">analytics</span>
          <span className="font-label-md text-label-md">Avg Match</span>
        </div>
        <span className="font-headline-md text-headline-md text-on-surface">
          {Math.round(summary.average_score)}%
        </span>
      </div>
    </section>
  );
};
