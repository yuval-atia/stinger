import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'JSON Preview' },
  { to: '/compare', label: 'JSON Compare' },
  { to: '/generate', label: 'Generate' },
  { to: '/encode', label: 'Encode/Decode' },
  { to: '/hash', label: 'Hash' },
  { to: '/convert', label: 'Convert' },
  { to: '/diff', label: 'Text Diff' },
  { to: '/format', label: 'Formatter' },
];

function Navigation({ isOpen, onClose }) {
  const location = useLocation();
  const navRef = useRef(null);

  useEffect(() => {
    onClose();
  }, [location.pathname]);

  return (
    <>
      {/* Desktop nav — unchanged */}
      <nav
        ref={navRef}
        className="hidden md:flex overflow-x-auto rounded overflow-hidden border border-[var(--border-color)]"
      >
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `px-3 py-1.5 text-sm whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[var(--border-color)] text-[var(--text-primary)]'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Mobile menu overlay + panel */}
      {isOpen && (
        <>
          {/* Backdrop — click to close */}
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={onClose}
          />
          {/* Slide-down menu */}
          <nav
            className="fixed left-0 right-0 z-50 md:hidden bg-[var(--bg-primary)] border-b border-[var(--border-color)] shadow-lg animate-slide-down"
            style={{
              top: navRef.current
                ?.closest('header')
                ?.getBoundingClientRect().bottom + 'px',
            }}
          >
            <div className="max-w-7xl mx-auto py-2 px-4">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `block py-3 px-3 text-sm rounded transition-colors ${
                      isActive
                        ? 'bg-[var(--border-color)] text-[var(--text-primary)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </nav>
        </>
      )}
    </>
  );
}

export default Navigation;
