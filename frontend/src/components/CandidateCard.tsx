import React, { useState } from 'react';
import type { CandidateResult } from '../types';

interface Props {
  candidate: CandidateResult;
}

function getScoreClass(score: number): string {
  if (score >= 70) return 'score-badge score-high';
  if (score >= 40) return 'score-badge score-mid';
  return 'score-badge score-low';
}

function getRankClass(rank: number | null): string {
  if (rank === 1) return 'rank-badge rank-1';
  if (rank === 2) return 'rank-badge rank-2';
  if (rank === 3) return 'rank-badge rank-3';
  return 'rank-badge rank-other';
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div className="progress-bar" style={{ width: 80 }}>
      <div
        className="progress-fill"
        style={{ width: `${score}%`, background: color }}
      />
    </div>
  );
}

export const CandidateCard: React.FC<Props> = ({ candidate }) => {
  const [expanded, setExpanded] = useState(false);
  const d = candidate.details;

  return (
    <div
      className="glass-card animate-fade-up"
      style={{
        padding: 0, overflow: 'hidden',
        opacity: candidate.status === 'failed' ? 0.7 : 1,
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '18px 24px', cursor: 'pointer',
        }}
        onClick={() => setExpanded((e) => !e)}
        id={`candidate-${candidate.file_name.replace(/\s+/g, '-')}`}
      >
        {/* Rank */}
        <div className={getRankClass(candidate.rank)}>
          {candidate.rank ?? '—'}
        </div>

        {/* Name + file */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>
            {candidate.candidate_name}
          </p>
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
            {candidate.file_name}
          </p>
        </div>

        {/* Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {candidate.status === 'success' && (
            <>
              <ScoreBar score={candidate.score} />
              <span className={getScoreClass(candidate.score)}>
                {candidate.score}%
              </span>
            </>
          )}
          {candidate.status === 'failed' && (
            <span style={{
              background: 'rgba(239,68,68,0.12)', color: '#f87171',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600,
            }}>
              Failed
            </span>
          )}
          <span style={{
            color: '#64748b', fontSize: 18, transition: 'transform 0.2s',
            transform: expanded ? 'rotate(180deg)' : 'none',
          }}>
            ▾
          </span>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{
          borderTop: '1px solid rgba(99,102,241,0.12)',
          padding: '20px 24px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 20,
        }}>
          {candidate.status === 'failed' ? (
            <div style={{
              gridColumn: '1 / -1',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 10, padding: 16,
            }}>
              <p style={{ color: '#f87171', fontWeight: 600, marginBottom: 4 }}>
                ⚠️ Processing Failed
              </p>
              <p style={{ color: '#94a3b8', fontSize: 13 }}>{candidate.error}</p>
            </div>
          ) : d ? (
            <>
              {/* Contact */}
              <div>
                <p className="section-label" style={{ marginBottom: 10 }}>Contact</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {d.email && <p style={{ fontSize: 13, color: '#cbd5e1' }}>✉️ {d.email}</p>}
                  {d.phone && <p style={{ fontSize: 13, color: '#cbd5e1' }}>📞 {d.phone}</p>}
                  {d.total_experience_years !== null && d.total_experience_years !== undefined && (
                    <p style={{ fontSize: 13, color: '#cbd5e1' }}>
                      💼 {d.total_experience_years} year{d.total_experience_years !== 1 ? 's' : ''} experience
                    </p>
                  )}
                  <p style={{ fontSize: 13, color: d.experience_requirement_met ? '#10b981' : '#ef4444', fontWeight: 500 }}>
                    {d.experience_requirement_met ? '✅' : '❌'} Experience requirement{' '}
                    {d.experience_requirement_met ? 'met' : 'not met'}
                  </p>
                </div>
              </div>

              {/* Matching skills */}
              <div>
                <p className="section-label" style={{ marginBottom: 10 }}>✅ Matching Skills</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {d.matching_skills.length ? (
                    d.matching_skills.map((s, i) => (
                      <span key={i} className="tag tag-match">{s}</span>
                    ))
                  ) : (
                    <span style={{ color: '#64748b', fontSize: 13 }}>None identified</span>
                  )}
                </div>
              </div>

              {/* Missing skills */}
              <div>
                <p className="section-label" style={{ marginBottom: 10 }}>❌ Missing Skills</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {d.missing_important_skills.length ? (
                    d.missing_important_skills.map((s, i) => (
                      <span key={i} className="tag tag-missing">{s}</span>
                    ))
                  ) : (
                    <span style={{ color: '#64748b', fontSize: 13 }}>None — great match!</span>
                  )}
                </div>
              </div>

              {/* Education */}
              {d.education.length > 0 && (
                <div>
                  <p className="section-label" style={{ marginBottom: 10 }}>🎓 Education</p>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {d.education.map((e, i) => (
                      <li key={i} style={{ fontSize: 13, color: '#cbd5e1' }}>• {e}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Projects */}
              {d.projects.length > 0 && (
                <div>
                  <p className="section-label" style={{ marginBottom: 10 }}>🛠️ Projects</p>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {d.projects.map((p, i) => (
                      <li key={i} style={{ fontSize: 13, color: '#cbd5e1' }}>• {p}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Certifications */}
              {d.certifications.length > 0 && (
                <div>
                  <p className="section-label" style={{ marginBottom: 10 }}>🏆 Certifications</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {d.certifications.map((c, i) => (
                      <span key={i} className="tag tag-neutral">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Final verdict */}
              {d.final_verdict && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <p className="section-label" style={{ marginBottom: 10 }}>💬 Final Verdict</p>
                  <div style={{
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: 10, padding: '14px 16px',
                    fontSize: 14, color: '#cbd5e1', lineHeight: 1.6,
                    fontStyle: 'italic',
                  }}>
                    "{d.final_verdict}"
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};
