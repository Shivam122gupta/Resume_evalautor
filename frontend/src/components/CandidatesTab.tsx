import type { EvaluationResponse, CandidateResult } from '../types';
import { EmptyState } from './EmptyState';
import { ExportButton } from './ExportButton';

interface Props {
  response: EvaluationResponse | null;
  onSelectCandidate: (c: CandidateResult) => void;
  onGoToDashboard: () => void;
}

function getMatchLabel(score: number): string {
  if (score >= 85) return 'Strong Match';
  if (score >= 65) return 'Good Match';
  if (score >= 45) return 'Needs Review';
  return 'Not Recommended';
}

function ScoreBadge({ score }: { score: number }) {
  const rounded = Math.round(score);
  if (rounded >= 85) return <span className="badge-strong">{rounded}%&nbsp;Match</span>;
  if (rounded >= 65) return <span className="badge-good">{rounded}%&nbsp;Match</span>;
  if (rounded >= 45) return <span className="badge-warn">{rounded}%&nbsp;Match</span>;
  return <span className="badge-low">{rounded}%&nbsp;Match</span>;
}

export const CandidatesTab: React.FC<Props> = ({ response, onSelectCandidate, onGoToDashboard }) => {
  if (!response || response.results.length === 0) {
    return <EmptyState type="no-results" onAction={onGoToDashboard} />;
  }

  const successful = response.results.filter((r) => r.status === 'success');
  const failed = response.results.filter((r) => r.status === 'failed');

  return (
    <div className="flex flex-col w-full gap-5 animate-fade-up">

      {/* Header */}
      <div style={{ paddingTop: 4 }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1
              style={{
                fontFamily: 'Source Serif 4, Georgia, serif',
                fontSize: 22,
                fontWeight: 600,
                color: '#1b1c1c',
                letterSpacing: '-0.01em',
              }}
            >
              Candidates
            </h1>
            <p style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', color: '#5c5f60', marginTop: 4 }}>
              {successful.length} evaluated · {response.job.role || 'Role'}
            </p>
          </div>
          <ExportButton response={response} />
        </div>
      </div>

      {/* Candidate cards */}
      {successful.length > 0 && (
        <section className="flex flex-col gap-3" aria-label="Evaluated candidates">
          {successful.map((c) => {
            const initials = c.candidate_name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
            return (
              <div
                key={c.file_name}
                onClick={() => onSelectCandidate(c)}
                role="button"
                tabIndex={0}
                aria-label={`View ${c.candidate_name} — ${getMatchLabel(c.score)}`}
                onKeyDown={(e) => { if (e.key === 'Enter') onSelectCandidate(c); }}
                style={{
                  background: '#ffffff',
                  borderRadius: 8,
                  border: '1px solid #dedad9',
                  padding: '18px 18px 16px',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.15s ease, transform 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(27,28,28,0.08)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
                onMouseDown={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'scale(0.995)';
                }}
                onMouseUp={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                }}
              >
                {/* Top row: avatar + name + score */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  {/* Avatar */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 8,
                      background: '#f5f3f2',
                      border: '1px solid #dedad9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontFamily: 'Source Serif 4, Georgia, serif',
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#444748',
                    }}
                  >
                    {initials}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      className="truncate"
                      style={{
                        fontSize: 15,
                        fontFamily: 'Source Serif 4, Georgia, serif',
                        fontWeight: 600,
                        color: '#1b1c1c',
                        letterSpacing: '-0.005em',
                      }}
                    >
                      {c.candidate_name}
                    </p>
                    <p
                      className="truncate"
                      style={{ fontSize: 12, fontFamily: 'Inter, sans-serif', color: '#5c5f60', marginTop: 3 }}
                    >
                      {getMatchLabel(c.score)}
                    </p>
                  </div>

                  <ScoreBadge score={c.score} />
                </div>

                {/* Skills row */}
                {c.details?.matching_skills && c.details.matching_skills.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 13 }}>
                    {c.details.matching_skills.slice(0, 4).map((skill, idx) => (
                      <span key={idx} className="skill-pill">{skill}</span>
                    ))}
                    {c.details.matching_skills.length > 4 && (
                      <span className="skill-pill" style={{ color: '#888b8b' }}>
                        +{c.details.matching_skills.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* View profile */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: 14,
                    paddingTop: 12,
                    borderTop: '1px solid #efeded',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 12,
                      fontFamily: 'Inter, sans-serif',
                      color: '#1b1c1c',
                      fontWeight: 500,
                    }}
                  >
                    View Profile
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
                  </span>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Failed evaluations */}
      {failed.length > 0 && (
        <section aria-label="Failed evaluations">
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: '#ba1a1a',
              marginBottom: 8,
            }}
          >
            Failed Evaluations
          </p>
          <div className="flex flex-col gap-2">
            {failed.map((c) => (
              <div
                key={c.file_name}
                onClick={() => onSelectCandidate(c)}
                role="button"
                tabIndex={0}
                aria-label={`View failed evaluation for ${c.file_name}`}
                onKeyDown={(e) => { if (e.key === 'Enter') onSelectCandidate(c); }}
                style={{
                  background: '#ffffff',
                  borderRadius: 6,
                  border: '1px solid rgba(186,26,26,0.2)',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#fff5f5'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#ffffff'; }}
              >
                <span className="material-symbols-outlined text-error shrink-0" style={{ fontSize: 16 }}>error</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#1b1c1c' }} className="truncate">
                    {c.file_name}
                  </p>
                  <p style={{ fontSize: 11, fontFamily: 'Inter, sans-serif', color: '#ba1a1a' }} className="truncate">
                    {c.error || 'Evaluation failed'}
                  </p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 14 }}>chevron_right</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
