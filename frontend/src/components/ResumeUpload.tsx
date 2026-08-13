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

export const ResumeUpload = ({ files, onAdd, onRemove, disabled }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const valid = Array.from(incoming).filter((f) => {
        const ext = '.' + f.name.split('.').pop()?.toLowerCase();
        return ALLOWED.includes(ext) || ALLOWED_MIME.includes(f.type);
      });
      if (valid.length) onAdd(valid);
    },
    [onAdd]
  );

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (!disabled) addFiles(e.dataTransfer.files);
    },
    [disabled, addFiles]
  );

  return (
    <div className="bg-surface-container rounded-xl p-md shadow-sm border border-outline-variant/30 flex flex-col gap-md">
      <h2 className="font-headline-md text-[20px] font-semibold text-on-surface">Upload Resumes</h2>
      
      <div
        id="resume-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-lg flex flex-col items-center justify-center gap-xs cursor-pointer transition-colors ${
          isDragging 
            ? 'border-primary bg-primary/10' 
            : 'border-primary bg-primary/5 hover:bg-primary/10'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="material-symbols-outlined text-primary text-[32px]">upload_file</span>
        <p className="font-label-md text-label-md text-on-surface">Drag &amp; drop resumes here</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">or browse files</p>
        <span className="font-label-sm text-label-sm text-on-surface-variant mt-xs">PDF, DOCX up to 10MB</span>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx"
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
          disabled={disabled}
          id="resume-file-input"
        />
      </div>

      {files.length > 0 && (
        <div className="flex flex-col gap-sm">
          {files.map((uf) => {
            const isPdf = uf.file.name.toLowerCase().endsWith('.pdf');
            return (
              <div 
                key={uf.id} 
                className="flex items-center justify-between p-sm bg-surface-container-lowest rounded-lg shadow-sm border border-outline-variant/30"
              >
                <div className="flex items-center gap-sm min-w-0">
                  <span className="material-symbols-outlined text-on-surface-variant shrink-0">
                    {isPdf ? 'picture_as_pdf' : 'description'}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                    {uf.file.name}
                  </span>
                </div>
                <button 
                  onClick={() => onRemove(uf.id)}
                  disabled={disabled}
                  className="text-error hover:text-error-container transition-colors flex items-center justify-center p-1 rounded-full hover:bg-error-container/10 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
