import { useState } from 'react';
import type { EvaluationResponse } from '../types';

export interface EvaluationRecord {
  id: string;
  date: string;
  role: string;
  response: EvaluationResponse;
}

interface Props {
  records: EvaluationRecord[];
  onSelectRecord: (record: EvaluationRecord) => void;
  onClearHistory?: () => void;
}

export const EvaluationHistory: React.FC<Props> = ({ records, onSelectRecord, onClearHistory }) => {
  const [search, setSearch] = useState('');

  const filteredRecords = records.filter(
    (r) =>
      r.role.toLowerCase().includes(search.toLowerCase()) ||
      r.response.results.some((candidate) =>
        candidate.candidate_name.toLowerCase().includes(search.toLowerCase())
      )
  );

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
              History
            </h1>
            <p style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', color: '#5c5f60', marginTop: 4 }}>
              {records.length === 0
                ? 'No evaluations yet'
                : `${records.length} evaluation${records.length !== 1 ? 's' : ''} completed`}
            </p>
          </div>
          {records.length > 0 && onClearHistory && (
            <button
              onClick={onClearHistory}
              className="btn-danger"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete_sweep</span>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      {records.length > 0 && (
        <div style={{ position: 'relative' }}>
          <span
            className="material-symbols-outlined absolute top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
            style={{ fontSize: 16, left: 12 }}
          >
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by role or candidate…"
            aria-label="Search evaluation history"
            style={{
              width: '100%',
              height: 40,
              paddingLeft: 36,
              paddingRight: 14,
              borderRadius: 6,
              background: '#ffffff',
              border: '1px solid #dedad9',
              fontSize: 13,
              fontFamily: 'Inter, sans-serif',
              color: '#1b1c1c',
              outline: 'none',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#1b1b1b'; e.target.style.boxShadow = '0 0 0 3px rgba(27,27,27,0.07)'; }}
            onBlur={(e) => { e.target.style.borderColor = '#dedad9'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
      )}

      {/* Record list */}
      {filteredRecords.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredRecords.map((record) => {
            const topCandidate = record.response.results.find((c) => c.rank === 1);
            const avgScore = Math.round(record.response.summary.average_score);
            const totalCandidates = record.response.summary.total;

            return (
              <div
                key={record.id}
                onClick={() => onSelectRecord(record)}
                role="button"
                tabIndex={0}
                aria-label={`View evaluation for ${record.role} on ${record.date}`}
                onKeyDown={(e) => { if (e.key === 'Enter') onSelectRecord(record); }}
                style={{
                  background: '#ffffff',
                  borderRadius: 8,
                  border: '1px solid #dedad9',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(27,28,28,0.08)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
                onMouseDown={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
              >
                {/* Left accent strip + content */}
                <div style={{ display: 'flex' }}>
                  <div style={{ width: 3, background: '#1b1b1b', flexShrink: 0 }} />
                  <div style={{ flex: 1, padding: '18px 18px 16px' }}>

                    {/* Top row */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
                      <div>
                        <h3
                          style={{
                            fontFamily: 'Source Serif 4, Georgia, serif',
                            fontSize: 16,
                            fontWeight: 600,
                            color: '#1b1c1c',
                            letterSpacing: '-0.005em',
                          }}
                        >
                          {record.role}
                        </h3>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            marginTop: 4,
                            fontSize: 12,
                            fontFamily: 'Inter, sans-serif',
                            color: '#888b8b',
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 13 }}>calendar_today</span>
                          {record.date}
                        </div>
                      </div>
                      <span
                        style={{
                          flexShrink: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '3px 9px',
                          borderRadius: 4,
                          background: '#f5f3f2',
                          border: '1px solid #dedad9',
                          fontSize: 10,
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 600,
                          color: '#5c5f60',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 11, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        Done
                      </span>
                    </div>

                    {/* Stats row */}
                    <div
                      style={{
                        display: 'flex',
                        gap: 24,
                        paddingTop: 12,
                        paddingBottom: 14,
                        borderTop: '1px solid #efeded',
                        borderBottom: '1px solid #efeded',
                        marginBottom: 14,
                      }}
                    >
                      <div>
                        <p style={{ fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888b8b', marginBottom: 4 }}>
                          Candidates
                        </p>
                        <p style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 22, fontWeight: 700, color: '#1b1c1c', lineHeight: 1, letterSpacing: '-0.02em' }}>
                          {totalCandidates}
                        </p>
                      </div>
                      <div style={{ width: 1, background: '#dedad9' }} />
                      <div>
                        <p style={{ fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888b8b', marginBottom: 4 }}>
                          Avg Score
                        </p>
                        <p style={{ fontFamily: 'Source Serif 4, Georgia, serif', fontSize: 22, fontWeight: 700, color: '#1b1c1c', lineHeight: 1, letterSpacing: '-0.02em' }}>
                          {avgScore}%
                        </p>
                      </div>
                    </div>

                    {/* Top candidate */}
                    {topCandidate && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: '10px 12px',
                          background: '#f5f3f2',
                          borderRadius: 6,
                        }}
                      >
                        <span style={{ fontSize: 16, lineHeight: 1 }}>🏆</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 10, fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#888b8b', marginBottom: 3 }}>
                            Top Match
                          </p>
                          <p style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 500, color: '#1b1c1c' }} className="truncate">
                            {topCandidate.candidate_name}
                            <span style={{ color: '#5c5f60', fontWeight: 400, marginLeft: 6 }}>
                              {Math.round(topCandidate.score)}%
                            </span>
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-on-surface-variant shrink-0" style={{ fontSize: 14 }}>
                          chevron_right
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 64,
            paddingBottom: 64,
            gap: 14,
            textAlign: 'center',
          }}
        >
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 40 }}>history</span>
          <div>
            <p style={{ fontSize: 15, fontFamily: 'Source Serif 4, Georgia, serif', fontWeight: 600, color: '#1b1c1c', marginBottom: 6 }}>
              {records.length === 0 ? 'No evaluations yet' : 'No results found'}
            </p>
            <p style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', color: '#888b8b', maxWidth: 220 }}>
              {records.length === 0
                ? 'Complete your first evaluation to see it here.'
                : 'Try adjusting your search term.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
