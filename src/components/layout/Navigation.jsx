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
  { to: '/api', label: 'API Client', key: '9' },
  { to: '/tools', label: 'All Tools', key: '0' },
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
        className="hidden md:flex overflow-x-auto gap-0.5 py-0.5"
      >
        {navItems.map(({ to, label, key }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `px-3 py-1 text-xs font-medium whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 rounded-full ${
                isActive
                  ? 'nav-active'
                  : 'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/15 dark:hover:bg-white/8'
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
            className="fixed left-0 right-0 z-50 md:hidden bg-slate-50 dark:bg-[#0f172a] border-b border-white/20 dark:border-white/10 shadow-lg animate-slide-down"
            style={{
              top: navRef.current
                ?.closest('header')
                ?.getBoundingClientRect().bottom + 'px',
            }}
          >
            <div className="max-w-7xl mx-auto py-2 px-4 flex flex-col gap-1">
              {navItems.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `block py-3 px-4 text-sm rounded-xl transition-all duration-200 font-medium ${
                      isActive
                        ? 'bg-white/30 dark:bg-black/30 text-[var(--text-primary)] shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10 dark:hover:bg-white/5'
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
