import type { EvaluationResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export async function checkHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error('Backend unreachable');
  return res.json();
}

export async function evaluateResumes(
  jobDescription: string,
  files: File[],
  onProgress?: (msg: string) => void
): Promise<EvaluationResponse> {
  const formData = new FormData();
  formData.append('job_description', jobDescription);

  files.forEach((file) => {
    formData.append('files', file, file.name);
  });

  onProgress?.(`Sending ${files.length} resume(s) to evaluator...`);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/evaluations`, {
      method: 'POST',
      body: formData,
    });
  } catch (err) {
    throw new Error(
      'Unable to connect to the evaluation server. Please make sure the backend is running.'
    );
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: 'Unknown error' }));
    const message =
      typeof errorBody.detail === 'string'
        ? errorBody.detail
        : JSON.stringify(errorBody.detail);
    throw new Error(message || `HTTP ${res.status}`);
  }

  return res.json();
}

export function generateCSV(results: EvaluationResponse['results']): string {
  const headers = [
    'rank',
    'candidate_name',
    'score',
    'file_name',
    'matching_skills',
    'missing_important_skills',
    'experience_requirement_met',
    'final_verdict',
    'status',
    'error',
  ];

  const rows = results.map((r) => [
    r.rank ?? '',
    r.candidate_name,
    r.score,
    r.file_name,
    r.details?.matching_skills.join('; ') ?? '',
    r.details?.missing_important_skills.join('; ') ?? '',
    r.details?.experience_requirement_met ?? '',
    r.details?.final_verdict ?? '',
    r.status,
    r.error ?? '',
  ]);

  const escape = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n');
  return csv;
}

export function downloadCSV(csv: string, filename = 'evaluation_results.csv') {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
