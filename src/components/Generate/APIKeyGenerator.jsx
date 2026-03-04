import { useState, useCallback, useMemo } from 'react';
import GeneratorCard from './GeneratorCard';
import { ConfigInput, ConfigCheckbox } from './generatorHelpers';
import { generateAPIKey, calcKeyEntropy } from '../../utils/generators';

const IconAPIKey = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Zm-2 2.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 9.5Z" clipRule="evenodd" />
  </svg>
);

function APIKeyGenerator({ toolSlug }) {
  const [length, setLength] = useState(32);
  const [prefix, setPrefix] = useState('');
  const [charset, setCharset] = useState({
    uppercase: true,
    lowercase: true,
    digits: true,
    special: false,
  });

  const toggleCharset = useCallback((key) => {
    setCharset((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleGenerate = useCallback(() => {
    const len = Math.min(Math.max(length, 8), 128);
    return generateAPIKey(len, prefix, charset);
  }, [length, prefix, charset]);

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
      title="API Key"
      icon={IconAPIKey}
      toolSlug={toolSlug}
      info={{
        what: 'A random secret string used to authenticate API requests, typically prefixed to indicate scope (sk_ for secret, pk_ for public).',
        how: 'Generated with crypto.getRandomValues() over a configurable character set for cryptographic-grade randomness.',
        usedFor: 'SaaS platform authentication, payment gateway credentials, service-to-service tokens, and webhook signing secrets.',
      }}
      onGenerate={handleGenerate}
      footer={strengthFooter}
    >
      <ConfigInput label="Length" value={length} onChange={setLength} min={8} max={128} />
      <ConfigInput label="Prefix" type="text" value={prefix} onChange={setPrefix} placeholder="sk_" />
      <ConfigCheckbox label="A-Z" checked={charset.uppercase} onChange={() => toggleCharset('uppercase')} />
      <ConfigCheckbox label="a-z" checked={charset.lowercase} onChange={() => toggleCharset('lowercase')} />
      <ConfigCheckbox label="0-9" checked={charset.digits} onChange={() => toggleCharset('digits')} />
      <ConfigCheckbox label="Special" checked={charset.special} onChange={() => toggleCharset('special')} />
    </GeneratorCard>
  );
}

export default APIKeyGenerator;
