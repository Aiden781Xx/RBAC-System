export default function SQIDisplay({ score = 0, tier = "Standard" }) {
  const normalized = Math.max(0, Math.min(100, score));

  return (
    <div className="rounded-2xl border border-[var(--color-border)] p-5 bg-[var(--color-surface)] flex items-center gap-6">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="34"
            stroke="var(--color-surface-2)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="40"
            cy="40"
            r="34"
            stroke="var(--color-primary)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${(normalized / 100) * 214} 214`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-[var(--color-text)]">
            {normalized}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            SQI
          </span>
        </div>
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1">
          Supplier Quality Index
        </p>
        <p className="text-sm font-bold text-[var(--color-text)]">
          {tier} tier – higher SQI unlocks better RFQs and visibility.
        </p>
      </div>
    </div>
  );
}
