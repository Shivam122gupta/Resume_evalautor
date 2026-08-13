import type { EvaluationResponse, CandidateResult } from '../types';
import { SummaryCards } from './SummaryCards';
import { ExportButton } from './ExportButton';

interface Props {
  response: EvaluationResponse;
  onSelectCandidate: (c: CandidateResult) => void;
}

export const CandidateRanking: React.FC<Props> = ({ response, onSelectCandidate }) => {
  const successful = response.results.filter((r) => r.status === 'success');
  const failed = response.results.filter((r) => r.status === 'failed');

  const topMatch = successful[0];
  const otherRanked = successful.slice(1);

  const getMatchStrength = (score: number) => {
    if (score >= 85) return 'Strong Match';
    if (score >= 65) return 'Moderate Match';
    return 'Low Match';
  };

  const getStatusBadge = (score: number) => {
    if (score >= 85) {
      return (
        <div className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full flex items-center gap-1 shrink-0">
          <span className="material-symbols-outlined text-[16px]">check</span>
          <span className="font-label-sm text-label-sm">{score}%</span>
        </div>
      );
    } else if (score >= 65) {
      return (
        <div className="bg-tertiary-container/10 text-on-tertiary-fixed-variant px-3 py-1 rounded-full flex items-center gap-1 shrink-0">
          <span className="material-symbols-outlined text-[16px]">trending_flat</span>
          <span className="font-label-sm text-label-sm">{score}%</span>
        </div>
      );
    } else {
      return (
        <div className="bg-error-container/40 text-error px-3 py-1 rounded-full flex items-center gap-1 shrink-0">
          <span className="material-symbols-outlined text-[16px]">close</span>
          <span className="font-label-sm text-label-sm">{score}%</span>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col w-full gap-xl animate-fade-up">
      {/* Title section */}
      <section className="flex justify-between items-end pt-md">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile text-on-surface">
            Evaluation Results
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Evaluating for: <strong>{response.job.role || 'Unspecified Role'}</strong>
          </p>
        </div>
        <ExportButton response={response} />
      </section>

      {/* Summary grid */}
      <SummaryCards summary={response.summary} />

      {/* Top Match Hero */}
      {topMatch && (
        <section className="flex flex-col gap-md">
          <h2 className="font-headline-md text-[20px] font-semibold text-on-surface">Top Match</h2>
          <div className="bg-primary text-on-primary rounded-xl p-lg flex flex-col gap-md shadow-md relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-on-primary opacity-10 rounded-full blur-2xl"></div>
            
            <div className="flex justify-between items-start z-10">
              <div className="flex flex-col gap-xs">
                <span className="font-label-sm text-label-sm bg-on-primary/20 text-on-primary px-2.5 py-1 rounded-full w-max backdrop-blur-sm font-semibold">
                  Rank #1
                </span>
                <h3 className="font-headline-md text-[24px] font-semibold mt-1">
                  {topMatch.candidate_name}
                </h3>
              </div>
              <div className="flex flex-col items-center justify-center bg-white text-primary rounded-full w-14 h-14 shadow-sm shrink-0">
                <span className="font-label-md text-[18px] font-bold">
                  {Math.round(topMatch.score)}%
                </span>
              </div>
            </div>

            {topMatch.details && topMatch.details.matching_skills && topMatch.details.matching_skills.length > 0 && (
              <div className="z-10 mt-1">
                <p className="font-body-sm text-body-sm text-on-primary/80 mb-2 font-medium">Matched Skills</p>
                <div className="flex flex-wrap gap-xs">
                  {topMatch.details.matching_skills.slice(0, 8).map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-on-primary/15 rounded-full font-label-sm text-label-sm backdrop-blur-sm border border-on-primary/10"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={() => onSelectCandidate(topMatch)}
              className="z-10 mt-2 bg-white text-primary font-label-md py-3 rounded-full w-full hover:bg-opacity-95 transition-all shadow-sm active:scale-[0.98] font-semibold text-center"
            >
              View Candidate Profile
            </button>
          </div>
        </section>
      )}

      {/* Rankings List */}
      {otherRanked.length > 0 && (
        <section className="flex flex-col gap-md">
          <div className="flex justify-between items-end">
            <h2 className="font-headline-md text-[20px] font-semibold text-on-surface">Rankings</h2>
          </div>
          
          <div className="flex flex-col gap-sm">
            {otherRanked.map((c, index) => (
              <div 
                key={c.file_name}
                onClick={() => onSelectCandidate(c)}
                className="bg-surface-container rounded-xl p-md flex items-center justify-between shadow-sm hover:shadow-md transition-all active:bg-surface-container-high cursor-pointer border border-outline-variant/10"
              >
                <div className="flex items-center gap-md min-w-0 pr-md">
                  <div className="font-label-md text-label-md text-on-surface-variant w-6 text-center">
                    #{index + 2}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-body-lg text-body-lg text-on-surface font-semibold truncate">
                      {c.candidate_name}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant line-clamp-1 truncate mt-0.5">
                      {getMatchStrength(c.score)} · {c.file_name}
                    </span>
                  </div>
                </div>
                {getStatusBadge(Math.round(c.score))}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Failed Resumes */}
      {failed.length > 0 && (
        <section className="flex flex-col gap-md">
          <h2 className="font-headline-md text-[18px] font-semibold text-error flex items-center gap-xs">
            <span className="material-symbols-outlined text-[20px]">warning</span>
            Failed Evaluations ({failed.length})
          </h2>
          <div className="flex flex-col gap-sm">
            {failed.map((c) => (
              <div 
                key={c.file_name}
                onClick={() => onSelectCandidate(c)}
                className="bg-surface-container rounded-xl p-md flex items-center justify-between shadow-sm hover:shadow-md transition-all cursor-pointer border border-error/15 opacity-80"
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
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">chevron_right</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
