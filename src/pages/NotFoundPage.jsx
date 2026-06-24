import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="glass-panel rounded-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <p className="text-[var(--text-secondary)] text-sm mb-6">Page not found</p>
        <Link
          to="/"
          className="inline-block px-4 py-2 text-sm bg-white/50 dark:bg-black/30 hover:bg-white/80 dark:hover:bg-white/10 border border-white/40 dark:border-white/10 shadow-sm backdrop-blur-sm rounded border border-white/10 dark:border-white/5 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
