import type { EvaluationResponse } from '../types';
import { generateCSV, downloadCSV } from '../api/client';

interface Props {
  response: EvaluationResponse;
}

export const ExportButton: React.FC<Props> = ({ response }) => {
  const handleExport = (e: React.MouseEvent) => {
    e.stopPropagation();
    const csv = generateCSV(response.results);
    const ts = new Date().toISOString().slice(0, 10);
    downloadCSV(csv, `resume_evaluation_${ts}.csv`);
  };

  return (
    <button
      id="export-csv-btn"
      onClick={handleExport}
      className="flex items-center gap-xs bg-surface text-on-surface font-label-sm text-label-sm px-md py-sm rounded-full shadow-sm hover:bg-surface-container transition-colors border border-outline-variant/60"
      title="Download results as CSV"
    >
      <span className="material-symbols-outlined text-[18px]">download</span>
      <span>Export CSV</span>
    </button>
  );
};
