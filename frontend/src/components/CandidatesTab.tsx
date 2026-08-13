import type { EvaluationResponse, CandidateResult } from '../types';
import { EmptyState } from './EmptyState';

interface Props {
  response: EvaluationResponse | null;
  onSelectCandidate: (c: CandidateResult) => void;
  onGoToDashboard: () => void;
}

export const CandidatesTab: React.FC<Props> = ({ response, onSelectCandidate, onGoToDashboard }) => {
  if (!response || response.results.length === 0) {
    return <EmptyState type="no-results" onAction={onGoToDashboard} />;
  }

  const successful = response.results.filter((r) => r.status === 'success');
  const failed = response.results.filter((r) => r.status === 'failed');

  const getMatchStrength = (score: number) => {
    if (score >= 85) return 'Strong Match';
    if (score >= 65) return 'Moderate Match';
    return 'Low Match';
  };

  return (
    <div className="flex flex-col w-full gap-lg animate-fade-up">
      <div>
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile text-on-surface">
          All Candidates
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
          Role: <strong>{response.job.role || 'Unspecified Role'}</strong> · {response.results.length} total candidates
        </p>
      </div>

      {successful.length > 0 && (
        <section className="flex flex-col gap-sm">
          <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            Evaluated Candidates
          </h2>
          <div className="flex flex-col gap-sm">
            {successful.map((c) => (
              <div 
                key={c.file_name}
                onClick={() => onSelectCandidate(c)}
                className="bg-surface-container rounded-xl p-md flex items-center justify-between shadow-sm hover:shadow-md transition-all cursor-pointer border border-outline-variant/10"
              >
                <div className="flex items-center gap-md min-w-0 pr-md">
                  <span className="material-symbols-outlined text-primary shrink-0">person</span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-body-lg text-body-lg text-on-surface font-semibold truncate">
                      {c.candidate_name}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant truncate mt-0.5">
                      {getMatchStrength(c.score)} ({c.score}%) · {c.file_name}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {failed.length > 0 && (
        <section className="flex flex-col gap-sm">
          <h2 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
            Failed Evaluations
          </h2>
          <div className="flex flex-col gap-sm">
            {failed.map((c) => (
              <div 
                key={c.file_name}
                onClick={() => onSelectCandidate(c)}
                className="bg-surface-container rounded-xl p-md flex items-center justify-between shadow-sm hover:shadow-md transition-all cursor-pointer border border-error/10 opacity-80"
              >
                <div className="flex items-center gap-md min-w-0">
                  <span className="material-symbols-outlined text-error shrink-0">error</span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-body-lg text-body-lg text-on-surface font-semibold truncate">
                      {c.file_name}
                    </span>
                    <span className="font-body-sm text-body-sm text-error truncate mt-0.5">
                      {c.error || 'Evaluation failed'}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
