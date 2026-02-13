import { useState, useMemo } from 'react';
import ToolCard from '../common/ToolCard';
import CopyButton from '../common/CopyButton';

function base64UrlDecode(str) {
  // Replace URL-safe chars and pad
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad) base64 += '='.repeat(4 - pad);
  return decodeURIComponent(
    Array.from(atob(base64), (c) =>
      '%' + c.charCodeAt(0).toString(16).padStart(2, '0')
    ).join('')
  );
}

function JwtDecodeCard() {
  const [input, setInput] = useState('');
  const [copiedSection, setCopiedSection] = useState('');

  const decoded = useMemo(() => {
    if (!input.trim()) return null;
    const parts = input.trim().split('.');
    if (parts.length !== 3) return { error: 'Invalid JWT format (expected 3 dot-separated parts)' };
    try {
      const header = JSON.parse(base64UrlDecode(parts[0]));
      const payload = JSON.parse(base64UrlDecode(parts[1]));
      // Check expiry
      let expiry = null;
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        const now = new Date();
        expiry = {
          date: expDate.toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC'),
          expired: now > expDate,
        };
      }
      return { header, payload, expiry };
    } catch (e) {
      return { error: 'Failed to decode JWT: ' + e.message };
    }
  }, [input]);

  const handleCopy = (section, text) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(''), 1500);
  };

  const CopyIcon = ({ section, text }) => (
    <CopyButton onClick={() => handleCopy(section, text)} tooltip={copiedSection === section ? 'Copied!' : 'Copy'}>
      {copiedSection === section ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[var(--success-color)]">
          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
          <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
        </svg>
      )}
    </CopyButton>
  );

  return (
    <ToolCard title="JWT Decode" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z" clipRule="evenodd" /></svg>} info={{
      what: 'Decodes JSON Web Tokens (JWT) to reveal the header and payload without needing the signing secret. Does not verify the signature.',
      how: 'Splits the token at the dots, Base64URL-decodes the first two segments, and parses the resulting JSON. The signature segment is displayed but not verified.',
      usedFor: 'Debugging authentication flows, inspecting token claims and expiry, troubleshooting OAuth/OIDC issues, and verifying token structure.',
    }}>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste a JWT token..."
        className="w-full h-20 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-none"
      />
      {decoded && decoded.error && (
        <div className="text-xs text-[var(--error-color)]">{decoded.error}</div>
      )}
      {decoded && !decoded.error && (
        <div className="space-y-3">
          {/* Expiry badge */}
          {decoded.expiry && (
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium ${
                  decoded.expiry.expired
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                }`}
              >
                {decoded.expiry.expired ? 'Expired' : 'Valid'}
              </span>
              <span className="text-xs text-[var(--text-secondary)]">{decoded.expiry.date}</span>
            </div>
          )}
          {/* Header */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[var(--text-secondary)]">Header</span>
              <CopyIcon section="header" text={JSON.stringify(decoded.header, null, 2)} />
            </div>
            <pre className="text-xs font-mono bg-[var(--bg-secondary)] rounded border border-[var(--border-color)] p-2 overflow-auto max-h-32">
              {JSON.stringify(decoded.header, null, 2)}
            </pre>
          </div>
          {/* Payload */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[var(--text-secondary)]">Payload</span>
              <CopyIcon section="payload" text={JSON.stringify(decoded.payload, null, 2)} />
            </div>
            <pre className="text-xs font-mono bg-[var(--bg-secondary)] rounded border border-[var(--border-color)] p-2 overflow-auto max-h-48">
              {JSON.stringify(decoded.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </ToolCard>
  );
}

export default JwtDecodeCard;
