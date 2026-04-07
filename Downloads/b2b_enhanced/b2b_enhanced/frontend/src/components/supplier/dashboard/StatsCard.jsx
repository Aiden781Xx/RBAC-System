export default function StatsCard({ label, value, helper, tone = "default" }) {
  const toneClass =
    tone === "success"
      ? "text-[var(--color-success)] bg-[var(--color-success-soft)]"
      : tone === "warning"
      ? "text-[var(--color-warning)] bg-[var(--color-warning-soft)]"
      : tone === "danger"
      ? "text-[var(--color-danger)] bg-[var(--color-danger-soft)]"
      : "text-[var(--color-text)] bg-[var(--color-surface-2)]";

  return (
    <div className={`rounded-2xl border border-[var(--color-border)] p-4 ${toneClass.replace("text-", "text-")}`}>
      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black">{value}</p>
      {helper && (
        <p className="mt-1 text-xs font-medium text-[var(--color-text-muted)]">
          {helper}
        </p>
      )}
    </div>
  );
}
