import type { EvaluationSummary } from '../types';

interface Props {
  summary: EvaluationSummary;
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  inverted?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, inverted }) => (
  <div
    style={{
      background: inverted ? '#1b1b1b' : '#ffffff',
      border: `1px solid ${inverted ? '#1b1b1b' : '#dedad9'}`,
      borderRadius: 8,
      padding: '20px 20px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}
  >
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 6,
        background: inverted ? 'rgba(255,255,255,0.12)' : '#f5f3f2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span
        className="material-symbols-outlined"
        style={{
          fontSize: 18,
          fontVariationSettings: "'FILL' 1",
          color: inverted ? '#ffffff' : '#5c5f60',
        }}
      >
        {icon}
      </span>
    </div>
    <div>
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: inverted ? 'rgba(255,255,255,0.6)' : '#888b8b',
          marginBottom: 6,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: 'Source Serif 4, Georgia, serif',
          fontSize: 26,
          fontWeight: 600,
          color: inverted ? '#ffffff' : '#1b1c1c',
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </p>
    </div>
  </div>
);

export const SummaryCards: React.FC<Props> = ({ summary }) => {
  return (
    <section className="grid grid-cols-2 gap-3" aria-label="Evaluation summary">
      <StatCard
        icon="description"
        label="Total Resumes"
        value={summary.total}
      />
      <StatCard
        icon="check_circle"
        label="Evaluated"
        value={summary.successful}
        inverted
      />
      <StatCard
        icon="error"
        label="Failed"
        value={summary.failed}
      />
      <StatCard
        icon="percent"
        label="Avg Match"
        value={`${Math.round(summary.average_score)}%`}
      />
    </section>
  );
};
