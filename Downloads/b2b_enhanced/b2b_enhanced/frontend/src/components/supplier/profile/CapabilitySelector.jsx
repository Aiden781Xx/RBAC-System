export default function CapabilitySelector({
  options = [],
  selected = [],
  onChange,
}) {
  const toggle = (value) => {
    if (!onChange) return;
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {options.map((cap) => {
        const active = selected.includes(cap.value || cap);
        const label = cap.label || cap;
        const value = cap.value || cap;
        return (
          <button
            key={value}
            type="button"
            onClick={() => toggle(value)}
            className={[
              "px-3 py-2 rounded-xl text-xs font-bold border transition-colors",
              active
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                : "bg-[var(--color-surface)] text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-surface-2)]",
            ].join(" ")}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
