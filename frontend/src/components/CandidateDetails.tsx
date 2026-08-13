import type { CandidateResult } from '../types';

interface Props {
  candidate: CandidateResult;
  onBack: () => void;
}

export const CandidateDetails: React.FC<Props> = ({ candidate, onBack }) => {
  const d = candidate.details;
  
  // Calculate match strength label
  const getMatchStrength = (score: number) => {
    if (score >= 85) return 'Strong Match';
    if (score >= 65) return 'Moderate Match';
    return 'Low Match';
  };

  // Helper for stroke-dasharray calculation (radius is 15.9155, circumference is 100)
  const score = Math.round(candidate.score || 0);

  return (
    <div className="flex flex-col w-full pb-safe animate-fade-up">
      {/* Back button and title */}
      <div className="flex items-center gap-md py-md border-b border-outline-variant/30 mb-md px-xs">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-surface-container-high"
        >
          <span className="material-symbols-outlined text-[20px] font-bold">arrow_back_ios_new</span>
        </button>
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface truncate">
            Candidate Profile
          </h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            {candidate.file_name}
          </p>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-outline-variant/50 relative overflow-hidden mb-md">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-container"></div>
        <div className="flex items-start justify-between gap-md">
          <div className="flex-1 min-w-0">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-xs truncate">
              {candidate.candidate_name || 'Unknown Candidate'}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-xs">
              <span className="material-symbols-outlined text-xl">work</span>
              {d?.total_experience_years !== null && d?.total_experience_years !== undefined 
                ? `${d.total_experience_years} Years Experience` 
                : 'Experience not specified'}
            </p>
            {candidate.status === 'success' ? (
              <div className="mt-sm inline-flex items-center gap-xs bg-surface-tint/10 px-sm py-xs rounded-full">
                <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
                <span className="font-label-md text-label-md text-primary">
                  {getMatchStrength(candidate.score)}
                </span>
              </div>
            ) : (
              <div className="mt-sm inline-flex items-center gap-xs bg-error-container/30 px-sm py-xs rounded-full">
                <span className="material-symbols-outlined text-error text-sm">
                  error
                </span>
                <span className="font-label-md text-label-md text-error">
                  Evaluation Failed
                </span>
              </div>
            )}
          </div>
          
          {/* Match Score Ring */}
          {candidate.status === 'success' && (
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path 
                  className="text-surface-container-highest" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="3"
                ></path>
                <path 
                  className="text-primary transition-all duration-1000 ease-out" 
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeDasharray={`${score}, 100`} 
                  strokeWidth="3"
                ></path>
              </svg>
              <div className="flex flex-col items-center justify-center">
                <span className="font-headline-md text-headline-md text-on-surface leading-none">
                  {score}<span className="text-sm">%</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Contact info grid */}
        {d && (d.email || d.phone) && (
          <div className="mt-md pt-md border-t border-outline-variant/30 grid grid-cols-1 sm:grid-cols-2 gap-sm text-body-sm text-on-surface-variant">
            {d.email && (
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-on-surface-variant">mail</span>
                <span className="truncate">{d.email}</span>
              </div>
            )}
            {d.phone && (
              <div className="flex items-center gap-xs">
                <span className="material-symbols-outlined text-on-surface-variant">phone</span>
                <span>{d.phone}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Verdict */}
      {candidate.status === 'failed' ? (
        <div className="bg-error-container/20 rounded-xl p-md border border-error/20 mb-md">
          <div className="flex items-center gap-sm mb-sm">
            <div className="w-8 h-8 rounded-full bg-error flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-on-error text-sm">warning</span>
            </div>
            <h3 className="font-headline-md text-body-lg text-error font-semibold">Processing Failed</h3>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            {candidate.error || 'An error occurred during resume evaluation. Please check the file formatting.'}
          </p>
        </div>
      ) : d && d.final_verdict ? (
        <div className="mb-md">
          <div className="bg-primary/5 rounded-xl p-md border border-primary/20">
            <div className="flex items-center gap-sm mb-sm">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-on-primary text-sm">smart_toy</span>
              </div>
              <h3 className="font-headline-md text-body-lg text-primary font-semibold">AI Recruiter Verdict</h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed italic">
              "{d.final_verdict}"
            </p>
            <div className="mt-sm flex items-center gap-xs">
              <span className="material-symbols-outlined text-outline text-sm">info</span>
              <span className="font-label-sm text-label-sm text-outline">
                AI-generated recommendation. Please verify independently.
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Match Analysis */}
      {d && candidate.status === 'success' && (
        <div className="mb-md">
          <h3 className="font-headline-md text-body-lg text-on-surface mb-md">Match Analysis</h3>
          <div className="space-y-md">
            {/* Matching Skills */}
            <div className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-outline-variant/30">
              <h4 className="font-label-md text-label-md text-on-surface-variant flex items-center gap-xs mb-sm">
                <span className="material-symbols-outlined text-sm text-green-600">check_circle</span>
                Matching Skills
              </h4>
              <div className="flex flex-wrap gap-sm">
                {d.matching_skills && d.matching_skills.length > 0 ? (
                  d.matching_skills.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="px-sm py-xs bg-green-50 text-green-700 font-label-sm text-label-sm rounded-md border border-green-200"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="font-body-sm text-body-sm text-on-surface-variant">No matching skills identified</span>
                )}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-outline-variant/30">
              <h4 className="font-label-md text-label-md text-on-surface-variant flex items-center gap-xs mb-sm">
                <span className="material-symbols-outlined text-sm text-error">error</span>
                Missing Important Skills
              </h4>
              <div className="flex flex-wrap gap-sm">
                {d.missing_important_skills && d.missing_important_skills.length > 0 ? (
                  d.missing_important_skills.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="px-sm py-xs bg-error-container/30 text-error font-label-sm text-label-sm rounded-md border border-error/20"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="font-body-sm text-body-sm text-green-700">None — candidate meets all skill requirements!</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Experience Check */}
      {d && candidate.status === 'success' && (
        <div className="mb-md">
          <div className="flex items-center justify-between mb-md">
            <h3 className="font-headline-md text-body-lg text-on-surface">Experience Requirement</h3>
            <div className={`px-sm py-xs rounded flex items-center gap-xs ${
              d.experience_requirement_met 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-error-container/20 text-error border border-error/20'
            }`}>
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                {d.experience_requirement_met ? 'task_alt' : 'cancel'}
              </span>
              <span className="font-label-sm text-label-sm font-semibold">
                {d.experience_requirement_met ? 'Requirement Met' : 'Not Met'}
              </span>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-outline-variant/30">
            <div className="flex justify-between items-center mb-md">
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-xs">Candidate Years</p>
                <p className="font-body-md text-body-md text-on-surface font-semibold">
                  {d.total_experience_years !== null ? `${d.total_experience_years} years` : 'Not provided'}
                </p>
              </div>
              <div className="h-8 w-px bg-outline-variant/50"></div>
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-xs">Requirement Status</p>
                <p className="font-body-md text-body-md text-on-surface font-semibold">
                  {d.experience_requirement_met ? 'Sufficient Experience' : 'Insufficient Experience'}
                </p>
              </div>
            </div>
            
            {/* Timeline Experience Details */}
            {d.all_skills && d.all_skills.length > 0 && (
              <div className="border-t border-outline-variant/30 pt-md">
                <p className="font-label-sm text-label-sm text-on-surface-variant mb-sm">All Extracted Skills</p>
                <div className="flex flex-wrap gap-xs">
                  {d.all_skills.map((skill, idx) => (
                    <span key={idx} className="text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded border border-outline-variant/20">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Education & Projects */}
      {d && candidate.status === 'success' && (d.education?.length > 0 || d.projects?.length > 0) && (
        <div className="mb-lg">
          <h3 className="font-headline-md text-body-lg text-on-surface mb-md">Education &amp; Projects</h3>
          <div className="space-y-md">
            {/* Education */}
            {d.education && d.education.map((edu, idx) => (
              <div key={idx} className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-outline-variant/30 flex gap-md">
                <div className="w-10 h-10 rounded bg-secondary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-secondary-container">school</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-label-md text-label-md text-on-surface truncate">{edu}</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Formal Education</p>
                </div>
              </div>
            ))}

            {/* Projects */}
            {d.projects && d.projects.map((proj, idx) => (
              <div key={idx} className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-outline-variant/30 flex gap-md">
                <div className="w-10 h-10 rounded bg-tertiary-container/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-tertiary-container">code</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-label-md text-label-md text-on-surface truncate">{proj}</h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Candidate Project</p>
                </div>
              </div>
            ))}

            {/* Certifications */}
            {d.certifications && d.certifications.length > 0 && (
              <div className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-outline-variant/30">
                <h4 className="font-label-md text-label-md text-on-surface mb-sm flex items-center gap-xs">
                  <span className="material-symbols-outlined text-sm text-primary">emoji_events</span>
                  Certifications
                </h4>
                <div className="flex flex-wrap gap-xs">
                  {d.certifications.map((cert, idx) => (
                    <span key={idx} className="text-xs text-on-surface bg-surface-container px-2 py-1 rounded">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
