function FormatButton({ onClick, label, variant = 'default' }) {
  const variantClasses = {
    default:
      'bg-white/40 dark:bg-white/8 hover:bg-white/70 dark:hover:bg-white/15 text-[var(--text-primary)] shadow-sm backdrop-blur-sm transition-all duration-150 active:scale-95',
    primary:
      'bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-md shadow-violet-500/25 transition-all duration-150 active:scale-95',
    danger:
      'bg-transparent hover:bg-red-500/12 text-[var(--error-color)] transition-all duration-150 active:scale-95',
  };

  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 text-xs rounded-md font-medium ${variantClasses[variant]}`}
    >
      {label}
    </button>
  );
}

export default FormatButton;
