import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './components/layout/Navigation';
import { useDarkMode } from './hooks/useDarkMode';

function App() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)]">
      {/* Header */}
      <header className="flex-shrink-0 bg-[var(--bg-primary)] border-b border-[var(--border-color)] px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center">
          <div className="w-28 flex items-center flex-shrink-0">
            <h1 className="flex items-baseline gap-2 text-xl font-bold whitespace-nowrap">
              <span className="text-2xl">🐝</span>Stingr<span className="text-sm font-semibold text-[var(--accent-color)] -ml-2">.dev</span>
            </h1>
          </div>
          <div className="flex-1 flex justify-center">
            <Navigation isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
          </div>
          <div className="w-28 flex items-center justify-end flex-shrink-0 gap-1">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded hover:bg-[var(--bg-secondary)] transition-colors"
              aria-label="Toggle theme"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button
              className="md:hidden p-1.5 rounded hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-primary)]"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden max-w-7xl w-full mx-auto p-4">
        <Outlet />
      </main>

      <footer className="flex-shrink-0 px-4 py-1.5 flex items-center justify-between">
        <p className="text-xs text-[var(--text-secondary)] opacity-50">Created by Yuval Atia</p>
        <p className="text-xs text-[var(--text-secondary)] opacity-50">v{__APP_VERSION__}</p>
      </footer>
    </div>
  );
}

export default App;
