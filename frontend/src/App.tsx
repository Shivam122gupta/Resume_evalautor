import { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { JobDescriptionInput } from './components/JobDescriptionInput';
import { ResumeUpload } from './components/ResumeUpload';
import { EvaluateButton } from './components/EvaluateButton';
import { CandidateRanking } from './components/CandidateRanking';
import { CandidateDetails } from './components/CandidateDetails';
import { CandidatesTab } from './components/CandidatesTab';
import { EvaluationHistory } from './components/EvaluationHistory';
import type { EvaluationRecord } from './components/EvaluationHistory';
import { Navbar } from './components/Navbar';
import { evaluateResumes } from './api/client';
import type { EvaluationResponse, UploadedFile, CandidateResult } from './types';

let fileIdCounter = 0;

export default function App() {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'evaluations' | 'candidates'>('dashboard');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateResult | null>(null);

  // Form State
  const [jobDescription, setJobDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  
  // Pipeline State
  const [loading, setLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<EvaluationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // History State
  const [historyRecords, setHistoryRecords] = useState<EvaluationRecord[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('resume_evaluator_history');
      if (stored) {
        setHistoryRecords(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load history from localStorage', e);
    }
  }, []);

  // Save history helper
  const saveHistory = (newRecords: EvaluationRecord[]) => {
    setHistoryRecords(newRecords);
    try {
      localStorage.setItem('resume_evaluator_history', JSON.stringify(newRecords));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all evaluation history?')) {
      saveHistory([]);
    }
  };

  const handleAddFiles = useCallback((files: File[]) => {
    setUploadedFiles((prev) => [
      ...prev,
      ...files.map((f) => ({ file: f, id: `file-${++fileIdCounter}` })),
    ]);
  }, []);

  const handleRemoveFile = useCallback((id: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleEvaluate = async () => {
    setError(null);
    setResult(null);
    setSelectedCandidate(null);

    if (!jobDescription.trim()) {
      setError('Please enter a job description before evaluating.');
      return;
    }
    if (uploadedFiles.length === 0) {
      setError('Please upload at least one resume file (PDF or DOCX).');
      return;
    }

    setLoading(true);
    setProgressMessage('Connecting to evaluator...');

    try {
      const response = await evaluateResumes(
        jobDescription,
        uploadedFiles.map((f) => f.file),
        setProgressMessage
      );
      setResult(response);
      setProgressMessage('');
      
      // Save to history
      const newRecord: EvaluationRecord = {
        id: `eval-${Date.now()}`,
        date: new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        role: response.job.role || 'Software Engineer',
        response: response
      };
      saveHistory([newRecord, ...historyRecords]);

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isEvalDisabled =
    loading || !jobDescription.trim() || uploadedFiles.length === 0;

  // Header Title Resolver
  const getHeaderTitle = () => {
    if (selectedCandidate) {
      return 'Candidate Detail';
    }
    switch (currentTab) {
      case 'evaluations':
        return 'Evaluation History';
      case 'candidates':
        return 'Candidates';
      case 'dashboard':
      default:
        return result ? 'Evaluation Results' : 'Dashboard';
    }
  };

  // Back button resolver (only when looking at a candidate details view)
  const handleBack = selectedCandidate ? () => setSelectedCandidate(null) : undefined;

  return (
    <div className="bg-background min-h-screen text-on-surface font-body-md">
      {/* Sticky header */}
      <Header title={getHeaderTitle()} onBack={handleBack} />

      {/* Main container with bottom nav safe area padding */}
      <main className="relative w-full pt-20 pb-32 max-w-[1280px] mx-auto px-margin-mobile">
        
        {/* If selectedCandidate is active, render detailed profile view */}
        {selectedCandidate ? (
          <CandidateDetails 
            candidate={selectedCandidate} 
            onBack={() => setSelectedCandidate(null)} 
          />
        ) : (
          /* Render tabbed views */
          <>
            {currentTab === 'dashboard' && (
              <div className="flex flex-col gap-lg w-full">
                
                {/* Intro Title & Description when no results yet */}
                {!result && !loading && (
                  <div className="flex flex-col gap-sm pt-md">
                    <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
                      AI-powered resume screening
                    </h1>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Compare candidates against your job requirements and identify the strongest matches in minutes.
                    </p>
                  </div>
                )}

                {/* Main input form */}
                {!result && (
                  <div className="flex flex-col gap-lg">
                    <JobDescriptionInput
                      value={jobDescription}
                      onChange={setJobDescription}
                      disabled={loading}
                    />
                    <ResumeUpload
                      files={uploadedFiles}
                      onAdd={handleAddFiles}
                      onRemove={handleRemoveFile}
                      disabled={loading}
                    />
                    {error && (
                      <div className="bg-error-container/20 rounded-xl p-md border border-error/20 flex items-start gap-sm">
                        <span className="material-symbols-outlined text-error">warning</span>
                        <div className="flex flex-col gap-xs">
                          <span className="font-label-md text-error">Validation Error</span>
                          <span className="font-body-sm text-on-surface-variant">{error}</span>
                        </div>
                      </div>
                    )}
                    <EvaluateButton
                      loading={loading}
                      disabled={isEvalDisabled}
                      progressMessage={progressMessage}
                      onClick={handleEvaluate}
                    />
                  </div>
                )}

                {/* If results exist, display the results ranking view */}
                {result && !loading && (
                  <div className="flex flex-col gap-md">
                    <div className="flex justify-between items-center mb-xs">
                      <button 
                        onClick={() => {
                          setResult(null);
                          setUploadedFiles([]);
                        }}
                        className="flex items-center gap-xs text-primary font-label-md hover:underline bg-none border-none p-0 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">add_circle</span>
                        <span>Start New Evaluation</span>
                      </button>
                    </div>
                    <CandidateRanking 
                      response={result} 
                      onSelectCandidate={(c) => setSelectedCandidate(c)} 
                    />
                  </div>
                )}
              </div>
            )}

            {currentTab === 'evaluations' && (
              <EvaluationHistory
                records={historyRecords}
                onClearHistory={handleClearHistory}
                onSelectRecord={(rec) => {
                  setResult(rec.response);
                  setJobDescription(rec.response.job.responsibilities.join('\n'));
                  setCurrentTab('dashboard');
                }}
              />
            )}

            {currentTab === 'candidates' && (
              <CandidatesTab
                response={result}
                onSelectCandidate={(c) => setSelectedCandidate(c)}
                onGoToDashboard={() => setCurrentTab('dashboard')}
              />
            )}
          </>
        )}
      </main>

      {/* Persistent Bottom navigation */}
      <Navbar currentTab={currentTab} onTabChange={(tab) => {
        setSelectedCandidate(null);
        setCurrentTab(tab);
      }} />
    </div>
  );
}
