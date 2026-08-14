import type { EvaluationResponse, CandidateResult } from '../types';
import { SummaryCards } from './SummaryCards';
import { ExportButton } from './ExportButton';

interface Props {
  response: EvaluationResponse;
  onSelectCandidate: (c: CandidateResult) => void;
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

function CandidateInitials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : name.slice(0, 2).toUpperCase();
  return (
    <div className="candidate-avatar" aria-hidden="true">
      {initials}
    </div>
  );
}

export const CandidateRanking: React.FC<Props> = ({ response, onSelectCandidate }) => {
  const successful = response.results.filter((r) => r.status === 'success');
  const failed = response.results.filter((r) => r.status === 'failed');
  const topMatch = successful[0];
  const otherRanked = successful.slice(1);

  return (
    <div className="flex flex-col w-full gap-6 animate-fade-up">

      {/* ── Page header ── */}
      <div className="flex justify-between items-start" style={{ paddingTop: 4 }}>
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
            Evaluation Results
          </h1>
          <p style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', color: '#5c5f60', marginTop: 4 }}>
            Role: <span style={{ color: '#1b1c1c', fontWeight: 500 }}>{response.job.role || 'Unspecified Role'}</span>
          </p>
        </div>
        <ExportButton response={response} />
      </div>

      {/* ── Summary cards ── */}
      <SummaryCards summary={response.summary} />

      {/* ── Top Match ── */}
      {topMatch && (
        <section aria-label="Top candidate">
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: '#888b8b',
              marginBottom: 12,
            }}
          >
            Top Candidate
          </p>

          {/* Top candidate — inverted card */}
          <div
            onClick={() => onSelectCandidate(topMatch)}
            style={{
              background: '#1b1b1b',
              borderRadius: 8,
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              cursor: 'pointer',
              transition: 'opacity 0.15s ease, transform 0.12s ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '0.93'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = '1'; }}
            onMouseDown={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(0.99)'; }}
            onMouseUp={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'; }}
            role="button"
            tabIndex={0}
            aria-label={`View ${topMatch.candidate_name} — top candidate`}
            onKeyDown={(e) => { if (e.key === 'Enter') onSelectCandidate(topMatch); }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontFamily: 'Source Serif 4, Georgia, serif',
                fontSize: 15,
                fontWeight: 600,
                color: '#ffffff',
              }}
            >
              {topMatch.candidate_name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 15, fontFamily: 'Source Serif 4, Georgia, serif', fontWeight: 600, color: '#ffffff', letterSpacing: '-0.005em' }} className="truncate">
                {topMatch.candidate_name}
              </p>
              <p style={{ fontSize: 12, fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.55)', marginTop: 2 }} className="truncate">
                {response.job.role || 'Candidate'}
              </p>
            </div>

            {/* Score */}
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <span
                style={{
                  background: 'rgba(255,255,255,0.92)',
                  color: '#1b1b1b',
                  borderRadius: 5,
                  padding: '4px 10px',
                  fontSize: 12,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '0.01em',
                }}
              >
                ✦ {Math.round(topMatch.score)}% Match
              </span>
              <span style={{ fontSize: 10, fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.04em' }}>
                TOP CANDIDATE
              </span>
            </div>
          </div>

          {/* Matching skills preview */}
          {topMatch.details?.matching_skills && topMatch.details.matching_skills.length > 0 && (
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {topMatch.details.matching_skills.slice(0, 6).map((skill, idx) => (
                <span key={idx} className="skill-pill">{skill}</span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Candidate Ranking ── */}
      {otherRanked.length > 0 && (
        <section aria-label="Candidate ranking">
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: '#888b8b',
              marginBottom: 4,
            }}
          >
            Candidate Ranking
          </p>

          <div
            style={{
              background: '#ffffff',
              border: '1px solid #dedad9',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            {otherRanked.map((c, i) => (
              <div
                key={c.file_name}
                onClick={() => onSelectCandidate(c)}
                role="button"
                tabIndex={0}
                aria-label={`View ${c.candidate_name} — rank #${c.rank}`}
                onKeyDown={(e) => { if (e.key === 'Enter') onSelectCandidate(c); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  borderTop: i > 0 ? '1px solid #dedad9' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#fafaf9'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                {/* Rank number */}
                <span
                  style={{
                    fontFamily: 'Source Serif 4, Georgia, serif',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#c8c5c3',
                    width: 20,
                    flexShrink: 0,
                    textAlign: 'center',
                  }}
                >
                  {c.rank ?? i + 2}
                </span>

                <CandidateInitials name={c.candidate_name} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#1b1c1c' }} className="truncate">
                    {c.candidate_name}
                  </p>
                  <p style={{ fontSize: 11, fontFamily: 'Inter, sans-serif', color: '#888b8b', marginTop: 2 }} className="truncate">
                    {getMatchLabel(c.score)}
                  </p>
                </div>

                <ScoreBadge score={c.score} />
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 14, marginLeft: 2 }}>
                  chevron_right
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Failed resumes ── */}
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
            Failed ({failed.length})
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
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  border: '1px solid rgba(186,26,26,0.2)',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#fff5f5'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#ffffff'; }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="material-symbols-outlined text-error shrink-0" style={{ fontSize: 18 }}>error</span>
                  <div className="flex flex-col min-w-0">
                    <span style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#1b1c1c' }} className="truncate">{c.file_name}</span>
                    <span style={{ fontSize: 11, fontFamily: 'Inter, sans-serif', color: '#ba1a1a' }} className="truncate">{c.error || 'Evaluation failed'}</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant shrink-0" style={{ fontSize: 14 }}>chevron_right</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
