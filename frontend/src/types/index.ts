// Types matching the backend API response schema exactly

export interface JobDetails {
  role: string;
  required_skills: string[];
  preferred_skills: string[];
  minimum_experience: number | null;
  education_requirements: string[];
  responsibilities: string[];
}

export interface CandidateDetails {
  matching_skills: string[];
  missing_important_skills: string[];
  experience_requirement_met: boolean;
  overall_match_percentage: number;
  final_verdict: string;
  // Extra fields from parsed resume
  email: string | null;
  phone: string | null;
  total_experience_years: number | null;
  education: string[];
  projects: string[];
  certifications: string[];
  all_skills: string[];
}

export interface CandidateResult {
  rank: number | null;
  candidate_name: string;
  score: number;
  file_name: string;
  status: 'success' | 'failed';
  details: CandidateDetails | null;
  error?: string;
}

export interface EvaluationSummary {
  total: number;
  successful: number;
  failed: number;
  average_score: number;
}

export interface EvaluationResponse {
  job: JobDetails;
  results: CandidateResult[];
  summary: EvaluationSummary;
}

export interface UploadedFile {
  file: File;
  id: string;
}
