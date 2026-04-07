import React from 'react';

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={[
        "w-full px-4 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)]",
        "text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]",
        "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-transparent",
        "resize-none",
        className,
      ].join(" ")}
    />
  );
}

export default Textarea;
