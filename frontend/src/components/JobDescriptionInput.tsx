
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
- Currently has, or is in the process of obtaining a bachelor’s degree in Computer Science, Computer Engineering, Data Science, Information Systems, or related STEM fields`;

export const JobDescriptionInput: React.FC<Props> = ({ value, onChange, disabled }) => {
  const handleUseSample = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled) {
      onChange(SAMPLE_JD);
    }
  };

  return (
    <div className="bg-surface-container rounded-xl p-md shadow-sm border border-outline-variant/30">
      <div className="flex justify-between items-end mb-sm">
        <h2 className="font-headline-md text-[20px] font-semibold text-on-surface">Job Description</h2>
        <a 
          className="font-label-sm text-label-sm text-primary hover:underline cursor-pointer" 
          onClick={handleUseSample}
          href="#"
        >
          Use sample job description
        </a>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">
        Paste the detailed requirements and responsibilities for the role.
      </p>
      <textarea 
        className="w-full h-40 bg-surface-container-lowest rounded-lg p-sm font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary shadow-inner resize-y border border-outline-variant/50" 
        placeholder="Paste the job description here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        id="job-description-input"
        maxLength={5000}
      />
      <div className="flex justify-between mt-xs font-label-sm text-label-sm text-on-surface-variant">
        <span>{value.length > 0 ? `${value.length.toLocaleString()} characters` : ''}</span>
        <span>{value.length} / 5000</span>
      </div>
    </div>
  );
};
