import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] p-8 max-w-md w-full text-center">
        <h2 className="text-4xl font-bold mb-2">404</h2>
        <p className="text-[var(--text-secondary)] text-sm mb-6">Page not found</p>
        <Link
          to="/"
          className="inline-block px-4 py-2 text-sm bg-[var(--bg-secondary)] hover:bg-[var(--border-color)] rounded border border-[var(--border-color)] transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
