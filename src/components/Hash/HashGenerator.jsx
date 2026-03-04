import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { InfoButton } from '../common/InfoTooltip';
import HashRow from './HashRow';
import {
  computeMD5,
  computeSHA1,
  computeSHA256,
  computeSHA512,
  computeHMACSHA256,
  computeHMACSHA512,
} from '../../utils/hash';

function HashGenerator({ toolSlug }) {
  const [input, setInput] = useState('');
  const [secret, setSecret] = useState('');
  const [hashes, setHashes] = useState({ md5: '', sha1: '', sha256: '', sha512: '' });
  const [hmacs, setHmacs] = useState({ sha256: '', sha512: '' });
  const cancelRef = useRef(0);

  useEffect(() => {
    const id = ++cancelRef.current;

    if (!input) {
      setHashes({ md5: '', sha1: '', sha256: '', sha512: '' });
      return;
    }

    setHashes((prev) => ({ ...prev, md5: computeMD5(input) }));

    (async () => {
      const [sha1, sha256, sha512] = await Promise.all([
        computeSHA1(input),
        computeSHA256(input),
        computeSHA512(input),
      ]);
      if (cancelRef.current !== id) return;
      setHashes({ md5: computeMD5(input), sha1, sha256, sha512 });
    })();
  }, [input]);

  useEffect(() => {
    const id = cancelRef.current;

    if (!input || !secret) {
      setHmacs({ sha256: '', sha512: '' });
      return;
    }

    (async () => {
      const [hmac256, hmac512] = await Promise.all([
        computeHMACSHA256(secret, input),
        computeHMACSHA512(secret, input),
      ]);
      if (cancelRef.current !== id) return;
      setHmacs({ sha256: hmac256, sha512: hmac512 });
    })();
  }, [input, secret]);

  return (
    <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] pb-4 card-hover">
      <div className="h-11 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
        <span className="text-sm font-medium flex items-center gap-1.5"><span className="text-[var(--accent-color)]"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z" clipRule="evenodd" /></svg></span>Hash Generator{toolSlug && <Link to={`/tools/${toolSlug}`} className="text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors" title="Open tool page"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M4.22 11.78a.75.75 0 0 1 0-1.06L9.44 5.5H5.75a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V6.56l-5.22 5.22a.75.75 0 0 1-1.06 0Z" /></svg></Link>}</span>
        <InfoButton info={{
          what: 'Computes MD5, SHA-1, SHA-256, and SHA-512 hashes of any text input in real time, plus HMAC signatures with a secret key.',
          how: 'MD5 is computed with a pure-JS implementation. SHA variants use the Web Crypto API (crypto.subtle.digest). HMACs use crypto.subtle.sign with an imported key.',
          usedFor: 'Verifying data integrity, generating content fingerprints, computing API request signatures, and comparing file checksums.',
        }} />
      </div>

      <div className="p-4 space-y-6">
        <div>
          <label htmlFor="hash-input" className="text-xs text-[var(--text-secondary)] mb-2 block">Input</label>
          <textarea
            id="hash-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or paste text to hash..."
            className="w-full h-28 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-none"
          />
        </div>

        <div>
          <span className="text-xs text-[var(--text-secondary)] mb-3 block">Hash Results</span>
          <div className="space-y-2">
            <HashRow label="MD5" value={hashes.md5} />
            <HashRow label="SHA-1" value={hashes.sha1} />
            <HashRow label="SHA-256" value={hashes.sha256} />
            <HashRow label="SHA-512" value={hashes.sha512} />
          </div>
        </div>

        <div className="border-t border-[var(--border-color)] pt-4">
          <label htmlFor="hmac-secret" className="text-xs text-[var(--text-secondary)] mb-2 block">HMAC</label>
          <input
            id="hmac-secret"
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Secret key..."
            className="w-full px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] mb-3"
          />
          <div className="space-y-2">
            <HashRow label="HMAC-SHA256" value={hmacs.sha256} />
            <HashRow label="HMAC-SHA512" value={hmacs.sha512} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HashGenerator;
