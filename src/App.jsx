import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navigation from './components/layout/Navigation';
import { useDarkMode } from './hooks/useDarkMode';
import { usePageMeta } from './hooks/usePageMeta';
import stingrLogo from './assets/stingr_logo_dev.svg';
import stingrLogoDark from './assets/stingr_logo_dev_dark.svg';

function App() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  usePageMeta();

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
              href="https://www.paypal.com/donate/?hosted_button_id=PXEF8FL63X9CJ"
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

      <main className="flex-1 overflow-hidden w-full mx-auto px-4 pt-4 pb-2">
        <Outlet />
      </main>

      <footer className="flex-shrink-0 py-0 leading-none flex justify-center items-center h-5 gap-1 text-xs text-[var(--text-secondary)] opacity-50">
        <span>&copy; Yuval Atia</span>
        <span className="opacity-30">|</span>
        <Link to="/privacy" className="hover:text-[var(--text-primary)] transition-colors">Privacy</Link>
        <span className="opacity-30">|</span>
        <Link to="/terms" className="hover:text-[var(--text-primary)] transition-colors">Terms</Link>
        <span className="opacity-30">|</span>
        <Link to="/contact" className="hover:text-[var(--text-primary)] transition-colors">Contact</Link>
        <span className="opacity-30">|</span>
        <span>v{__APP_VERSION__}</span>
      </footer>
    </div>
  );
}

export default App;
