import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './components/layout/Navigation';
import { useDarkMode } from './hooks/useDarkMode';
import stingrLogo from './assets/stingr_logo.svg';
import stingrLogoDark from './assets/stingr_logo_dark.svg';

function App() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)]">
      {/* Header */}
      <header className="flex-shrink-0 bg-[var(--bg-primary)] border-b border-[var(--border-color)] px-4 py-3">
        <div className="flex items-center">
          <div className="w-28 flex items-center flex-shrink-0 pl-2">
            <img
              src={darkMode ? stingrLogoDark : stingrLogo}
              alt="Stingr.dev"
              className="h-8"
            />
          </div>
          <div className="flex-1 flex justify-center">
            <Navigation isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
          </div>
          <div className="flex items-center justify-end flex-shrink-0 gap-1">
            <a
              href="https://github.com/yuval-atia/stinger"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              aria-label="GitHub"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              aria-label="Donate"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </a>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#FED01E" stroke="#FED01E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/>
                  <line x1="12" y1="1" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="6.34" y2="6.34"/><line x1="17.66" y1="17.66" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="6.34" y2="17.66"/><line x1="17.66" y1="6.34" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#151414" stroke="#151414" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
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

      <main className="flex-1 overflow-hidden w-full mx-auto p-4">
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
