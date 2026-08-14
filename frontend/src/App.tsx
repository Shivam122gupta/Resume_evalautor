import { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { JobDescriptionInput } from './components/JobDescriptionInput';
import { ResumeUpload } from './components/ResumeUpload';
import { EvaluateButton } from './components/EvaluateButton';
import { CandidateRanking } from './components/CandidateRanking';
import { CandidateDetails } from './components/CandidateDetails';
import { CandidatesTab } from './components/CandidatesTab';
import { EvaluationHistory } from './components/EvaluationHistory';
import type { EvaluationRecord } from './components/EvaluationHistory';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { SplashScreen } from './components/SplashScreen';
import { evaluateResumes } from './api/client';
import type { EvaluationResponse, UploadedFile, CandidateResult } from './types';

type Tab = 'landing' | 'dashboard' | 'evaluations' | 'candidates' | 'history';

let fileIdCounter = 0;

// ─── Dashboard page (evaluation form + results) ────────────────────────────
function DashboardPage({
  jobDescription,
  setJobDescription,
  uploadedFiles,
  handleAddFiles,
  handleRemoveFile,
  loading,
  progressMessage,
  error,
  result,
  isEvalDisabled,
  handleEvaluate,
  onSelectCandidate,
  onNewEvaluation,
}: {
  jobDescription: string;
  setJobDescription: (v: string) => void;
  uploadedFiles: UploadedFile[];
  handleAddFiles: (files: File[]) => void;
  handleRemoveFile: (id: string) => void;
  loading: boolean;
  progressMessage: string;
  error: string | null;
  result: EvaluationResponse | null;
  isEvalDisabled: boolean;
  handleEvaluate: () => void;
  onSelectCandidate: (c: CandidateResult) => void;
  onNewEvaluation: () => void;
}) {
  if (result && !loading) {
    return (
      <div className="flex flex-col gap-6 animate-fade-up">
        {/* "New evaluation" link */}
        <div className="flex justify-end">
          <button
            onClick={onNewEvaluation}
            className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface transition-colors"
            style={{
              fontSize: 12,
              fontFamily: 'Inter, sans-serif',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>add_circle</span>
            New Evaluation
          </button>
        </div>
        <CandidateRanking response={result} onSelectCandidate={onSelectCandidate} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 animate-fade-up">
      {/* Intro header */}
      {!loading && (
        <div style={{ paddingTop: 4 }}>
          <h1
            style={{
              fontFamily: 'Source Serif 4, Georgia, serif',
              fontSize: 22,
              fontWeight: 600,
              color: '#1b1c1c',
              letterSpacing: '-0.01em',
            }}
          >
            Evaluate Candidates
          </h1>
          <p style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', color: '#5c5f60', marginTop: 5 }}>
            Analyze resumes against your job requirements using AI.
          </p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 0',
            gap: 18,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: '#1b1b1b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              className="animate-spin"
              style={{
                width: 24,
                height: 24,
                border: '2px solid rgba(255,255,255,0.2)',
                borderTopColor: '#ffffff',
                borderRadius: '50%',
                display: 'block',
              }}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                fontFamily: 'Source Serif 4, Georgia, serif',
                fontSize: 16,
                fontWeight: 600,
                color: '#1b1c1c',
                letterSpacing: '-0.005em',
              }}
            >
              Evaluating resumes…
            </p>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#888b8b', marginTop: 5 }}>
              {progressMessage || 'Connecting to AI evaluator…'}
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      {!loading && (
        <>
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

          {/* Error */}
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '14px 16px',
                borderRadius: 8,
                background: 'rgba(186,26,26,0.05)',
                border: '1px solid rgba(186,26,26,0.2)',
              }}
            >
              <span className="material-symbols-outlined text-error shrink-0" style={{ fontSize: 16, marginTop: 1 }}>warning</span>
              <div>
                <p style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#ba1a1a' }}>
                  Validation Error
                </p>
                <p style={{ fontSize: 12, fontFamily: 'Inter, sans-serif', color: '#5c5f60', marginTop: 3 }}>
                  {error}
                </p>
              </div>
            </div>
          )}

          <EvaluateButton
            loading={loading}
            disabled={isEvalDisabled}
            progressMessage={progressMessage}
            onClick={handleEvaluate}
          />
        </>
      )}
    </div>
  );
}

// ─── App Shell ─────────────────────────────────────────────────────────────
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  // Navigation
  const [currentTab, setCurrentTab] = useState<Tab>('landing');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateResult | null>(null);

  // Form state
  const [jobDescription, setJobDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Pipeline state
  const [loading, setLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState('');
  const [result, setResult] = useState<EvaluationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // History
  const [historyRecords, setHistoryRecords] = useState<EvaluationRecord[]>([]);

  // Load history
  useEffect(() => {
    try {
      const stored = localStorage.getItem('resume_evaluator_history');
      if (stored) setHistoryRecords(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }, []);

  const saveHistory = (newRecords: EvaluationRecord[]) => {
    setHistoryRecords(newRecords);
    try {
      localStorage.setItem('resume_evaluator_history', JSON.stringify(newRecords));
    } catch (e) {
      console.error('Failed to save history', e);
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
    setProgressMessage('Connecting to evaluator…');

    try {
      const response = await evaluateResumes(
        jobDescription,
        uploadedFiles.map((f) => f.file),
        setProgressMessage
      );
      setResult(response);
      setProgressMessage('');

      const newRecord: EvaluationRecord = {
        id: `eval-${Date.now()}`,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        role: response.job.role || 'Software Engineer',
        response,
      };
      saveHistory([newRecord, ...historyRecords]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const isEvalDisabled = loading || !jobDescription.trim() || uploadedFiles.length === 0;

  const handleTabChange = (tab: Tab) => {
    setSelectedCandidate(null);
    setCurrentTab(tab);
  };

  const handleNewEvaluation = () => {
    setResult(null);
    setUploadedFiles([]);
    setError(null);
  };

  // ── Candidate detail view ────────────────────────────────────────────────
  if (selectedCandidate) {
    return (
      <div className="app-shell bg-background">
        {/* Desktop sidebar */}
        <Sidebar currentTab={currentTab} onTabChange={handleTabChange} />

        {/* Mobile header */}
        <Header onBack={() => setSelectedCandidate(null)} title="Candidate Profile" />

        {/* Content */}
        <main className="main-content w-full">
          <div
            style={{
              paddingLeft: 'max(16px, env(safe-area-inset-left))',
              paddingRight: 'max(16px, env(safe-area-inset-right))',
              maxWidth: 720,
              margin: '0 auto',
            }}
            className="lg:pl-10 lg:pr-8 lg:pt-10"
          >
            {/* Desktop back button */}
            <div className="hidden lg:block mb-5">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface transition-colors"
                style={{
                  fontSize: 13,
                  fontFamily: 'Inter, sans-serif',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
                Back to Results
              </button>
            </div>
            <CandidateDetails
              candidate={selectedCandidate}
              onBack={() => setSelectedCandidate(null)}
            />
          </div>
        </main>

        {/* Mobile bottom nav */}
        <Navbar currentTab={currentTab} onTabChange={handleTabChange} />
      </div>
    );
  }

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (currentTab === 'landing') {
    return <LandingPage onStart={() => setCurrentTab('evaluations')} />;
  }

  // ── Main app shell ────────────────────────────────────────────────────────
  return (
    <div className="app-shell bg-background min-h-screen">
      {/* Desktop sidebar */}
      <Sidebar currentTab={currentTab} onTabChange={handleTabChange} />

      {/* Mobile top header */}
      <Header />

      {/* Main content area */}
      <main className="main-content w-full">
        <div
          style={{
            maxWidth: 720,
            margin: '0 auto',
          }}
          className="px-4 lg:px-10 lg:pt-10"
        >

            {/* ── Evaluate tab (default) ── */}
            {currentTab === 'evaluations' && (
              <DashboardPage
                jobDescription={jobDescription}
                setJobDescription={setJobDescription}
                uploadedFiles={uploadedFiles}
                handleAddFiles={handleAddFiles}
                handleRemoveFile={handleRemoveFile}
                loading={loading}
                progressMessage={progressMessage}
                error={error}
                result={result}
                isEvalDisabled={isEvalDisabled}
                handleEvaluate={handleEvaluate}
                onSelectCandidate={setSelectedCandidate}
                onNewEvaluation={handleNewEvaluation}
              />
            )}

            {/* ── Dashboard (quick overview when results exist) ── */}
            {currentTab === 'dashboard' && (
              <div className="flex flex-col gap-6 animate-fade-up">
                <div style={{ paddingTop: 4 }}>
                  <h1
                    style={{
                      fontFamily: 'Source Serif 4, Georgia, serif',
                      fontSize: 22,
                      fontWeight: 600,
                      color: '#1b1c1c',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Resume Evaluation
                  </h1>
                  <p style={{ fontSize: 13, fontFamily: 'Inter, sans-serif', color: '#5c5f60', marginTop: 5 }}>
                    Evaluate resumes against job requirements and identify the strongest candidates.
                  </p>
                </div>

                {result ? (
                  <CandidateRanking response={result} onSelectCandidate={setSelectedCandidate} />
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '56px 0',
                      gap: 18,
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 12,
                        background: '#1b1b1b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'opacity 0.15s ease',
                      }}
                      onClick={() => handleTabChange('evaluations')}
                      role="button"
                      tabIndex={0}
                      aria-label="Go to evaluate"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleTabChange('evaluations'); }}
                    >
                      <span
                        className="material-symbols-outlined text-surface"
                        style={{ fontSize: 26, fontVariationSettings: "'FILL' 1" }}
                      >
                        add
                      </span>
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: 'Source Serif 4, Georgia, serif',
                          fontSize: 17,
                          fontWeight: 600,
                          color: '#1b1c1c',
                          letterSpacing: '-0.005em',
                        }}
                      >
                        No evaluations yet
                      </p>
                      <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#888b8b', marginTop: 5 }}>
                        Go to the Evaluate tab to get started.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Candidates tab ── */}
            {currentTab === 'candidates' && (
              <CandidatesTab
                response={result}
                onSelectCandidate={setSelectedCandidate}
                onGoToDashboard={() => handleTabChange('evaluations')}
              />
            )}

            {/* ── History tab ── */}
            {currentTab === 'history' && (
              <EvaluationHistory
                records={historyRecords}
                onClearHistory={handleClearHistory}
                onSelectRecord={(rec) => {
                  setResult(rec.response);
                  setJobDescription(rec.response.job.responsibilities.join('\n'));
                  handleTabChange('evaluations');
                }}
              />
            )}

        </div>
      </main>

      {/* Mobile bottom nav */}
      <Navbar currentTab={currentTab} onTabChange={handleTabChange} />
    </div>
  );
}
