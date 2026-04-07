export function Button({ 
  children, 
  onClick, 
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '' 
}) {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors " +
    "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25 focus:ring-offset-2 focus:ring-offset-[var(--color-background)] " +
    "disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]",
    ghost: "bg-transparent border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] text-[var(--color-text)]",
    destructive: "bg-[var(--color-danger)] text-white hover:opacity-95",
    outline: "border border-[var(--color-border)] hover:bg-[var(--color-surface-2)] text-[var(--color-text)]",
    subtle: "bg-[var(--color-surface-2)] hover:bg-[var(--color-surface)] text-[var(--color-text)]",
    link: "underline text-primary hover:text-[var(--color-primary-hover)]",
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;