function FormatButton({ onClick, label, variant = 'default' }) {
  const variantClasses = {
    default:
      'bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] text-[var(--text-primary)]',
    primary:
      'bg-[var(--accent-color)] hover:bg-blue-600 text-white',
    danger:
      'bg-transparent hover:bg-[var(--error-color)] hover:bg-opacity-20 text-[var(--error-color)]',
  };

  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 text-xs rounded transition-colors ${variantClasses[variant]}`}
    >
      {label}
    </button>
  );
}

export default FormatButton;
