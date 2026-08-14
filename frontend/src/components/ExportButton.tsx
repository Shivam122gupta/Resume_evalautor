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
      aria-label="Export results as CSV"
      className="btn-secondary shrink-0"
      title="Download results as CSV"
    >
      <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 14 }}>download</span>
      <span>Export CSV</span>
    </button>
  );
};
