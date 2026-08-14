import type { CandidateResult } from '../types';

interface Props {
  candidate: CandidateResult;
  onBack: () => void;
}

function getMatchLabel(score: number): { label: string; color: string; bg: string } {
  if (score >= 85) return { label: 'Strong Match', color: '#1b1b1b', bg: '#1b1b1b' };
  if (score >= 65) return { label: 'Good Match', color: '#1b1c1c', bg: '#efeded' };
  if (score >= 45) return { label: 'Needs Review', color: '#7a5800', bg: '#fef9ec' };
  return { label: 'Not Recommended', color: '#93000a', bg: '#fff5f5' };
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
    </p>
  );
}

function ScoreRing({ score }: { score: number }) {
  const fillAmount = Math.min(score, 100);
  return (
    <div style={{ position: 'relative', width: 72, height: 72, flexShrink: 0 }}>
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
        viewBox="0 0 36 36"
        aria-hidden="true"
      >
        <path
          className="score-ring-track"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          className="score-ring-fill"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="currentColor"
          strokeDasharray={`${fillAmount}, 100`}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span
          style={{
            fontFamily: 'Source Serif 4, Georgia, serif',
            fontSize: 17,
            fontWeight: 700,
            color: '#1b1c1c',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          {score}
          <span style={{ fontSize: 10, fontWeight: 500 }}>%</span>
        </span>
      </div>
    </div>
  );
}

export const CandidateDetails: React.FC<Props> = ({ candidate, onBack: _onBack }) => {
  const d = candidate.details;
  const score = Math.round(candidate.score || 0);
  const match = getMatchLabel(score);

  // Initials
  const parts = candidate.candidate_name.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : candidate.candidate_name.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col w-full gap-6 animate-fade-up" style={{ paddingBottom: 32 }}>

      {/* ── Candidate hero ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, paddingTop: 4 }}>
        {/* Initials avatar — large */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 8,
            background: '#f5f3f2',
            border: '1px solid #dedad9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontFamily: 'Source Serif 4, Georgia, serif',
            fontSize: 20,
            fontWeight: 600,
            color: '#444748',
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              fontFamily: 'Source Serif 4, Georgia, serif',
              fontSize: 22,
              fontWeight: 600,
              color: '#1b1c1c',
              letterSpacing: '-0.01em',
            }}
            className="truncate"
          >
            {candidate.candidate_name || 'Unknown Candidate'}
          </h1>
          <p style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', color: '#5c5f60', marginTop: 4 }}>
            {d?.total_experience_years !== null && d?.total_experience_years !== undefined
              ? `${d.total_experience_years} years experience`
              : 'Experience not specified'}
          </p>
          {/* Contact info inline */}
          {d && (d.email || d.phone) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px', marginTop: 8 }}>
              {d.email && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontFamily: 'Inter, sans-serif', color: '#5c5f60' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#888b8b' }}>mail</span>
                  {d.email}
                </span>
              )}
              {d.phone && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontFamily: 'Inter, sans-serif', color: '#5c5f60' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#888b8b' }}>phone</span>
                  {d.phone}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Score card ── */}
      {candidate.status === 'success' && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #dedad9',
            borderRadius: 8,
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <ScoreRing score={score} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                color: '#888b8b',
                marginBottom: 6,
              }}
            >
              Overall Score
            </p>
            <p
              style={{
                fontFamily: 'Source Serif 4, Georgia, serif',
                fontSize: 17,
                fontWeight: 600,
                color: match.color === '#1b1b1b' ? '#1b1c1c' : match.color,
                letterSpacing: '-0.005em',
                marginBottom: 8,
              }}
            >
              {match.label}
            </p>
            {d?.final_verdict && (
              <p
                style={{
                  fontSize: 12,
                  fontFamily: 'Inter, sans-serif',
                  color: '#5c5f60',
                  lineHeight: 1.55,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {d.final_verdict}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Failed badge */}
      {candidate.status === 'failed' && (
        <div
          style={{
            background: 'rgba(186,26,26,0.05)',
            borderRadius: 8,
            border: '1px solid rgba(186,26,26,0.2)',
            padding: '16px 20px',
            display: 'flex',
            gap: 12,
          }}
        >
          <span className="material-symbols-outlined text-error shrink-0" style={{ fontSize: 20, marginTop: 1 }}>error</span>
          <div>
            <p style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#ba1a1a' }}>Processing Failed</p>
            <p style={{ fontSize: 12, fontFamily: 'Inter, sans-serif', color: '#5c5f60', marginTop: 4, lineHeight: 1.5 }}>
              {candidate.error || 'An error occurred during resume evaluation. Please check the file formatting.'}
            </p>
          </div>
        </div>
      )}

      {/* ── Match Overview ── */}
      {d && candidate.status === 'success' && (
        <div>
          <SectionLabel>Match Overview</SectionLabel>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #dedad9',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            {[
              {
                label: 'Experience Requirement',
                value: d.experience_requirement_met
                  ? `${d.total_experience_years ?? '?'} yrs — Met`
                  : 'Not Met',
                met: d.experience_requirement_met,
              },
              {
                label: 'Skills Match',
                value: `${d.matching_skills?.length ?? 0} of ${(d.matching_skills?.length ?? 0) + (d.missing_important_skills?.length ?? 0)} core skills`,
                met: null,
              },
              {
                label: 'Overall Score',
                value: `${score}%`,
                met: null,
              },
            ].map((row, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '13px 18px',
                  borderTop: i > 0 ? '1px solid #dedad9' : 'none',
                }}
              >
                <span style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', color: '#5c5f60' }}>{row.label}</span>
                <span
                  style={{
                    fontSize: 13,
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    color: row.met === false ? '#ba1a1a' : row.met === true ? '#166534' : '#1b1c1c',
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Matching Skills ── */}
      {d && candidate.status === 'success' && d.matching_skills && d.matching_skills.length > 0 && (
        <div>
          <SectionLabel>Matching Skills</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {d.matching_skills.map((skill, idx) => (
              <span key={idx} className="skill-pill skill-pill-match">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Missing Skills ── */}
      {d && candidate.status === 'success' && d.missing_important_skills && d.missing_important_skills.length > 0 && (
        <div>
          <SectionLabel>Missing Skills</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {d.missing_important_skills.map((skill, idx) => (
              <span key={idx} className="skill-pill skill-pill-missing">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Experience Assessment ── */}
      {d && candidate.status === 'success' && (
        <div>
          <SectionLabel>Experience Assessment</SectionLabel>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #dedad9',
              borderRadius: 8,
              padding: '16px 18px',
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
            }}
          >
            <span
              className="material-symbols-outlined shrink-0"
              style={{
                fontSize: 18,
                marginTop: 1,
                color: d.experience_requirement_met ? '#166534' : '#ba1a1a',
                fontVariationSettings: "'FILL' 1",
              }}
            >
              {d.experience_requirement_met ? 'check_circle' : 'cancel'}
            </span>
            <div>
              <p
                style={{
                  fontSize: 13,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  color: d.experience_requirement_met ? '#166534' : '#ba1a1a',
                }}
              >
                {d.experience_requirement_met ? 'Meets Requirements' : 'Does Not Meet Requirements'}
              </p>
              <p style={{ fontSize: 12, fontFamily: 'Inter, sans-serif', color: '#5c5f60', marginTop: 5, lineHeight: 1.55 }}>
                {d.total_experience_years !== null && d.total_experience_years !== undefined
                  ? `Candidate has ${d.total_experience_years} year${d.total_experience_years !== 1 ? 's' : ''} of experience.`
                  : 'Experience information could not be determined from the resume.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── All Skills ── */}
      {d && d.all_skills && d.all_skills.length > 0 && (
        <div>
          <SectionLabel>All Extracted Skills</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {d.all_skills.map((skill, idx) => (
              <span key={idx} className="skill-pill">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {/* ── Education ── */}
      {d && d.education && d.education.length > 0 && (
        <div>
          <SectionLabel>Education</SectionLabel>
          <div className="flex flex-col gap-2">
            {d.education.map((edu, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  background: '#ffffff',
                  border: '1px solid #dedad9',
                  borderRadius: 6,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: '#f5f3f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 16 }}>school</span>
                </div>
                <p style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', color: '#1b1c1c' }}>{edu}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Projects ── */}
      {d && d.projects && d.projects.length > 0 && (
        <div>
          <SectionLabel>Projects</SectionLabel>
          <div className="flex flex-col gap-2">
            {d.projects.map((proj, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  background: '#ffffff',
                  border: '1px solid #dedad9',
                  borderRadius: 6,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: '#f5f3f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 16 }}>code</span>
                </div>
                <p style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', color: '#1b1c1c' }}>{proj}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Certifications ── */}
      {d && d.certifications && d.certifications.length > 0 && (
        <div>
          <SectionLabel>Certifications</SectionLabel>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {d.certifications.map((cert, idx) => (
              <span key={idx} className="skill-pill">
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 12, marginRight: 4 }}>emoji_events</span>
                {cert}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Final Verdict ── */}
      {d && candidate.status === 'success' && d.final_verdict && (
        <div>
          <SectionLabel>AI Recommendation</SectionLabel>
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #dedad9',
              borderRadius: 8,
              padding: '20px 22px',
            }}
          >
            <p
              style={{
                fontFamily: 'Source Serif 4, Georgia, serif',
                fontSize: 15,
                fontStyle: 'italic',
                color: '#1b1c1c',
                lineHeight: 1.7,
                letterSpacing: '-0.005em',
              }}
            >
              "{d.final_verdict}"
            </p>
            <p
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                marginTop: 14,
                fontSize: 11,
                fontFamily: 'Inter, sans-serif',
                color: '#888b8b',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 12 }}>info</span>
              Generated by AI · Verify independently before making decisions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
