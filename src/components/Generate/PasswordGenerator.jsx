import { useState, useCallback, useMemo } from 'react';
import GeneratorCard from './GeneratorCard';
import { generateAPIKey, calcKeyEntropy } from '../../utils/generators';

const IconPassword = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Zm-2 2.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 9.5Z" clipRule="evenodd" />
  </svg>
);

function ConfigCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer select-none">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
          checked
            ? 'bg-[var(--accent-color)] border-[var(--accent-color)]'
            : 'bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-[var(--accent-color)]'
        }`}
      >
        {checked && (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white" className="w-3 h-3">
            <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      {label}
    </label>
  );
}

function ConfigInput({ label, type = 'number', value, onChange, ...props }) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        className="w-20 px-2 py-1 text-xs rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
        {...props}
      />
    </label>
  );
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [charset, setCharset] = useState({
    uppercase: true,
    lowercase: true,
    digits: true,
    special: true,
  });

  const toggleCharset = useCallback((key) => {
    setCharset((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleGenerate = useCallback(() => {
    const len = Math.min(Math.max(length, 8), 128);
    return generateAPIKey(len, '', charset);
  }, [length, charset]);

  const entropy = useMemo(() => {
    return calcKeyEntropy(Math.min(Math.max(length, 8), 128), charset);
  }, [length, charset]);

  const strengthColor = entropy.label === 'Very strong'
    ? 'var(--success-color)'
    : entropy.label === 'Strong'
      ? 'var(--accent-color)'
      : entropy.label === 'Moderate'
        ? 'var(--diff-change)'
        : 'var(--error-color)';

  const strengthPercent = Math.min((entropy.bits / 128) * 100, 100);

  const strengthFooter = (
    <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)]">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 flex-shrink-0">
        <path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z" clipRule="evenodd" />
      </svg>
      <span>{entropy.bits}-bit entropy</span>
      <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${strengthPercent}%`, backgroundColor: strengthColor }}
        />
      </div>
      <span style={{ color: strengthColor }} className="font-medium">{entropy.label}</span>
    </div>
  );

  return (
    <GeneratorCard
      title="Password"
      icon={IconPassword}
      info={{
        what: 'A cryptographically random password with configurable character sets and length.',
        how: 'Generated using crypto.getRandomValues() for true randomness, with selectable character pools.',
        usedFor: 'User account passwords, service credentials, and any secret that needs to be strong and random.',
      }}
      onGenerate={handleGenerate}
      footer={strengthFooter}
    >
      <ConfigInput label="Length" value={length} onChange={setLength} min={8} max={128} />
      <ConfigCheckbox label="A-Z" checked={charset.uppercase} onChange={() => toggleCharset('uppercase')} />
      <ConfigCheckbox label="a-z" checked={charset.lowercase} onChange={() => toggleCharset('lowercase')} />
      <ConfigCheckbox label="0-9" checked={charset.digits} onChange={() => toggleCharset('digits')} />
      <ConfigCheckbox label="Special" checked={charset.special} onChange={() => toggleCharset('special')} />
    </GeneratorCard>
  );
}
