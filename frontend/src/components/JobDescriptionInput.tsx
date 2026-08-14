import { useState } from 'react';

interface Props {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}

const SAMPLE_JD = `Job Title: Software Development Engineer I (SDE-I)
Company: Amazon

Key job responsibilities:
• Collaborate and communicate effectively with experienced cross-disciplinary Amazonians to design, build, and operate innovative products and services that delight our customers.
• Design and develop scalable solutions using cloud-native architectures and microservices in a large distributed computing environment.
• Participate in code reviews and contribute to technical documentation.
• Write clean, maintainable code following best practices and design patterns (Java, Python, C++, Go, Rust, or TypeScript).
• Work in an agile environment practicing CI/CD principles.

Basic Qualifications:
- Experience with at least one general-purpose programming language such as Java, Python, C++, C#, Go, Rust, or TypeScript
- Experience with data structure implementation, basic algorithm development, and/or object-oriented design principles
- Currently has, or is in the process of obtaining a bachelor's degree in Computer Science, Computer Engineering, Data Science, Information Systems, or related STEM fields`;

const MAX_CHARS = 5000;
const WARN_THRESHOLD = 4500;

export const JobDescriptionInput: React.FC<Props> = ({ value, onChange, disabled }) => {
  const [focused, setFocused] = useState(false);

  const charCount = value.length;
  const isNearLimit = charCount >= WARN_THRESHOLD;

  const handleUseSample = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled) onChange(SAMPLE_JD);
  };

  return (
    <section
      className="section-card flex flex-col"
      aria-label="Job description input"
    >
      {/* Card header */}
      <div
        className="flex items-center justify-between px-5"
        style={{
          height: 52,
          borderBottom: '1px solid #dedad9',
        }}
      >
        <h2
          style={{
            fontFamily: 'Source Serif 4, Georgia, serif',
            fontSize: 17,
            fontWeight: 600,
            color: '#1b1c1c',
            letterSpacing: '-0.005em',
          }}
        >
          Job Description
        </h2>
        <button
          onClick={handleUseSample}
          disabled={disabled}
          aria-label="Auto-fill with sample job description"
          title="Fill with sample job description"
          className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-40"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 4,
            fontSize: 12,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>auto_awesome</span>
          <span className="hidden sm:inline">Sample</span>
        </button>
      </div>

      {/* Textarea area */}
      <div className="relative" style={{ padding: '0 0 0 0' }}>
        <textarea
          id="job-description-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          maxLength={MAX_CHARS}
          rows={10}
          placeholder="Paste the job description here — including requirements, responsibilities, and qualifications."
          aria-label="Job description"
          aria-describedby="jd-char-counter"
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 14,
            lineHeight: 1.65,
            color: '#1b1c1c',
            background: '#ffffff',
            width: '100%',
            resize: 'none',
            border: 'none',
            outline: 'none',
            padding: '20px 20px 48px 20px',
            minHeight: 220,
            opacity: disabled ? 0.5 : 1,
            borderRadius: 0,
          }}
          className={focused ? 'ring-0' : ''}
        />

        {/* Focused border overlay */}
        {focused && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              boxShadow: 'inset 0 0 0 2px #1b1b1b',
              borderRadius: 7,
            }}
          />
        )}

        {/* Character counter — bottom-right */}
        <div
          id="jd-char-counter"
          className="absolute flex items-center gap-1"
          style={{ bottom: 14, right: 16 }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 11,
              color: isNearLimit ? '#ba1a1a' : '#9a9d9d',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </span>
        </div>
      </div>
    </section>
  );
};
