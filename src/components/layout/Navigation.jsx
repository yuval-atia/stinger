import { useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'JSON Preview', key: '1' },
  { to: '/compare', label: 'JSON Compare', key: '2' },
  { to: '/generate', label: 'Generate', key: '3' },
  { to: '/encode', label: 'Encode/Decode', key: '4' },
  { to: '/hash', label: 'Hash', key: '5' },
  { to: '/convert', label: 'Convert', key: '6' },
  { to: '/text', label: 'Text Tools', key: '7' },
  { to: '/format', label: 'Formatter', key: '8' },
];

function Navigation({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef(null);

  useEffect(() => {
    onClose();
  }, [location.pathname]);

  // Alt+1..8 keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const item = navItems.find(n => n.key === e.key);
      if (item) {
        e.preventDefault();
        navigate(item.to);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  return (
    <>
      {/* Desktop nav */}
      <nav
        ref={navRef}
        className="hidden md:flex overflow-x-auto rounded overflow-hidden border border-[var(--border-color)]"
      >
        {navItems.map(({ to, label, key }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `px-3 py-1.5 text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[var(--border-color)] text-[var(--text-primary)] nav-active'
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
