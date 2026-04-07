export default function FactoryForm({ data = {}, onChange, onSubmit }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange?.({ ...data, [name]: value });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
          Factory Name
        </label>
        <input
          name="factoryName"
          value={data.factoryName || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] text-sm"
          placeholder="e.g. Precision Manufacturing Unit 1"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
          Location
        </label>
        <input
          name="location"
          value={data.location || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] text-sm"
          placeholder="City, State, Country"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
          Floor Area (m²)
        </label>
        <input
          name="floorArea"
          type="number"
          min="0"
          value={data.floorArea || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] text-sm"
          placeholder="e.g. 1500"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-black uppercase tracking-widest text-[var(--color-text-muted)]">
          Employees
        </label>
        <input
          name="employees"
          type="number"
          min="0"
          value={data.employees || ""}
          onChange={handleChange}
          className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-text)] text-sm"
          placeholder="e.g. 120"
        />
      </div>
    </form>
  );
}
