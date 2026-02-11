import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'JSON Preview' },
  { to: '/compare', label: 'JSON Compare' },
  { to: '/generate', label: 'Generate' },
  { to: '/encode', label: 'Encode/Decode' },
  { to: '/hash', label: 'Hash' },
  { to: '/convert', label: 'Convert' },
];

function Navigation() {
  return (
    <nav className="flex overflow-x-auto rounded overflow-hidden border border-[var(--border-color)]">
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
  );
}

export default Navigation;
