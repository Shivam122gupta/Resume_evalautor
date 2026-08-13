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
    <div className="flex flex-col w-full gap-lg animate-fade-up">
      {/* Title */}
      <div className="flex justify-between items-center pt-md">
        <div>
          <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile text-on-surface">
            Evaluation History
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Review past screenings and candidates.
          </p>
        </div>
        {records.length > 0 && onClearHistory && (
          <button 
            onClick={onClearHistory}
            className="flex items-center gap-xs bg-error-container/20 text-error font-label-sm text-label-sm px-md py-sm rounded-full shadow-sm hover:bg-error-container/30 transition-colors border border-error/20"
          >
            <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant">
          search
        </span>
        <input 
          type="text" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search evaluations by role or candidate name..."
          className="w-full h-12 pl-10 pr-sm rounded-lg bg-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow font-body-md placeholder:text-on-surface-variant/70 border border-outline-variant/30"
        />
      </div>

      {/* List */}
      {filteredRecords.length > 0 ? (
        <div className="flex flex-col gap-md">
          {filteredRecords.map((record) => {
            const topCandidate = record.response.results.find((c) => c.rank === 1);
            return (
              <div 
                key={record.id}
                onClick={() => onSelectRecord(record)}
                className="bg-surface-container flex flex-col p-md rounded-xl shadow-sm relative overflow-hidden group hover:shadow-md transition-all cursor-pointer border border-outline-variant/15 active:bg-surface-container-high"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                <div className="flex justify-between items-start mb-sm">
                  <div className="flex flex-col gap-xs">
                    <h3 className="font-headline-md text-[20px] font-semibold text-on-surface">
                      {record.role}
                    </h3>
                    <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                      {record.date}
                    </span>
                  </div>
                  <div className="px-sm py-xs bg-tertiary-fixed rounded-md text-on-tertiary-fixed font-label-sm uppercase tracking-wider flex items-center gap-xs shrink-0">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    Completed
                  </div>
                </div>

                <div className="flex gap-lg my-md py-md border-y border-outline-variant/30 text-body-sm">
                  <div className="flex flex-col gap-xs flex-1">
                    <span className="font-label-sm text-on-surface-variant">Candidates</span>
                    <span className="font-headline-md text-[22px] font-semibold text-on-surface flex items-baseline gap-xs">
                      {record.response.summary.total}
                      <span className="material-symbols-outlined text-[16px] text-primary">group</span>
                    </span>
                  </div>
                  <div className="w-[1px] bg-outline-variant/30"></div>
                  <div className="flex flex-col gap-xs flex-1">
                    <span className="font-label-sm text-on-surface-variant">Avg Score</span>
                    <div className="flex items-center gap-sm">
                      <span className="font-headline-md text-[22px] font-semibold text-on-surface">
                        {Math.round(record.response.summary.average_score)}%
                      </span>
                    </div>
                  </div>
                </div>

                {topCandidate && (
                  <div className="flex items-center gap-sm bg-surface-container-high p-sm rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                      🏆
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-label-sm text-on-surface-variant">Top Match</span>
                      <span className="font-body-md text-body-md text-on-surface font-semibold truncate">
                        {topCandidate.candidate_name} ({Math.round(topCandidate.score)}%)
                      </span>
                    </div>
                    <span className="material-symbols-outlined text-[20px] text-primary ml-auto">
                      chevron_right
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-2xl opacity-60">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-md">history</span>
          <p className="font-body-md text-on-surface-variant text-center max-w-[200px]">
            {records.length === 0 ? 'No evaluations completed yet.' : 'No evaluations found matching search.'}
          </p>
        </div>
      )}
    </div>
  );
};
