import { useCallback, useRef, useState, type DragEvent } from 'react';
import type { UploadedFile } from '../types';

interface Props {
  files: UploadedFile[];
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

const ALLOWED = ['.pdf', '.docx'];
const ALLOWED_MIME = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_BYTES = 10 * 1024 * 1024;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export const ResumeUpload = ({ files, onAdd, onRemove, disabled }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      setValidationError(null);
      const all = Array.from(incoming);
      const invalid = all.filter((f) => {
        const ext = '.' + f.name.split('.').pop()?.toLowerCase();
        return !ALLOWED.includes(ext) && !ALLOWED_MIME.includes(f.type);
      });
      const oversized = all.filter((f) => f.size > MAX_BYTES);
      const valid = all.filter((f) => {
        const ext = '.' + f.name.split('.').pop()?.toLowerCase();
        return (ALLOWED.includes(ext) || ALLOWED_MIME.includes(f.type)) && f.size <= MAX_BYTES;
      });

      if (invalid.length > 0) {
        setValidationError(`${invalid.length} file(s) skipped — only PDF and DOCX are supported.`);
      } else if (oversized.length > 0) {
        setValidationError(`${oversized.length} file(s) skipped — files must be under 10 MB.`);
      }

      if (valid.length) onAdd(valid);
    },
    [onAdd]
  );

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (!disabled) addFiles(e.dataTransfer.files);
    },
    [disabled, addFiles]
  );

  return (
    <section
      className="section-card flex flex-col"
      aria-label="Resume upload"
    >
      {/* Card header */}
      <div
        className="flex items-center justify-between px-5"
        style={{ height: 52, borderBottom: '1px solid #dedad9' }}
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
          Upload Resumes
        </h2>
        {files.length > 0 && (
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 11,
              color: '#5c5f60',
              fontWeight: 500,
            }}
          >
            {files.length} {files.length === 1 ? 'file' : 'files'}
          </span>
        )}
      </div>

      <div style={{ padding: '16px 16px 20px' }} className="flex flex-col gap-3">
        {/* Drop zone */}
        <div
          id="resume-dropzone"
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Upload resume files"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !disabled) inputRef.current?.click(); }}
          style={{
            border: `2px dashed ${isDragging ? '#1b1b1b' : '#c8c5c3'}`,
            borderRadius: 8,
            padding: '32px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            cursor: disabled ? 'not-allowed' : 'pointer',
            background: isDragging ? '#f0eeec' : '#fafaf9',
            opacity: disabled ? 0.5 : 1,
            transition: 'all 0.15s ease',
            userSelect: 'none',
          }}
        >
          {/* Upload icon */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 10,
              background: isDragging ? '#1b1b1b' : '#1b1b1b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 4,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 24, color: '#ffffff', fontVariationSettings: "'FILL' 1" }}
            >
              cloud_upload
            </span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontFamily: 'Source Serif 4, Georgia, serif',
              fontSize: 15,
              fontWeight: 600,
              color: '#1b1c1c',
              letterSpacing: '-0.005em',
            }}>
              Drop resumes here or click to upload
            </p>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              color: '#888b8b',
              marginTop: 4,
            }}>
              PDF, DOCX · up to 10 MB each
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => e.target.files && addFiles(e.target.files)}
            disabled={disabled}
            id="resume-file-input"
            aria-label="Choose resume files"
          />
        </div>

        {/* Validation error */}
        {validationError && (
          <div
            className="flex items-center gap-2 rounded-md"
            style={{
              padding: '10px 14px',
              background: 'rgba(186,26,26,0.06)',
              border: '1px solid rgba(186,26,26,0.2)',
            }}
          >
            <span className="material-symbols-outlined text-error shrink-0" style={{ fontSize: 15 }}>warning</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#ba1a1a' }}>
              {validationError}
            </span>
          </div>
        )}

        {/* File list */}
        {files.length > 0 && (
          <div className="flex flex-col gap-2" role="list" aria-label="Uploaded files">
            {files.map((uf) => {
              const isPdf = uf.file.name.toLowerCase().endsWith('.pdf');
              return (
                <div
                  key={uf.id}
                  role="listitem"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 6,
                    background: '#ffffff',
                    border: '1px solid #dedad9',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* File type icon */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 6,
                        background: '#f5f3f2',
                        border: '1px solid #dedad9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }}>
                        {isPdf ? 'picture_as_pdf' : 'description'}
                      </span>
                    </div>
                    {/* Name + size */}
                    <div className="flex flex-col min-w-0">
                      <span
                        className="truncate"
                        style={{
                          fontSize: 13,
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          color: '#1b1c1c',
                          maxWidth: 220,
                        }}
                        title={uf.file.name}
                      >
                        {uf.file.name}
                      </span>
                      <span style={{ fontSize: 11, fontFamily: 'Inter, sans-serif', color: '#888b8b' }}>
                        {formatBytes(uf.file.size)}
                      </span>
                    </div>
                  </div>
                  {/* Remove button */}
                  <button
                    onClick={() => onRemove(uf.id)}
                    disabled={disabled}
                    aria-label={`Remove ${uf.file.name}`}
                    style={{
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: 4,
                      color: '#888b8b',
                      flexShrink: 0,
                      marginLeft: 8,
                      transition: 'color 0.12s ease, background 0.12s ease',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = '#ba1a1a';
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(186,26,26,0.06)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = '#888b8b';
                      (e.currentTarget as HTMLButtonElement).style.background = 'none';
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
