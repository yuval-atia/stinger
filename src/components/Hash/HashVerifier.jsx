import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { InfoButton } from '../common/InfoTooltip';
import {
  computeMD5,
  computeSHA1,
  computeSHA256,
  computeSHA512,
} from '../../utils/hash';

function HashVerifier({ toolSlug }) {
  const [knownHash, setKnownHash] = useState('');
  const [verifyText, setVerifyText] = useState('');
  const [result, setResult] = useState(null);
  const cancelRef = useRef(0);

  useEffect(() => {
    const id = ++cancelRef.current;
    const trimmed = knownHash.trim().toLowerCase();

    if (!trimmed || !verifyText) {
      setResult(null);
      return;
    }

    const len = trimmed.length;
    let algo = null;
    let computeFn = null;
    if (len === 32) { algo = 'MD5'; computeFn = (t) => Promise.resolve(computeMD5(t)); }
    else if (len === 40) { algo = 'SHA-1'; computeFn = computeSHA1; }
    else if (len === 64) { algo = 'SHA-256'; computeFn = computeSHA256; }
    else if (len === 128) { algo = 'SHA-512'; computeFn = computeSHA512; }
    else {
      setResult({ algo: null, match: false, error: 'Unknown hash length' });
      return;
    }

    (async () => {
      const computed = await computeFn(verifyText);
      if (cancelRef.current !== id) return;
      setResult({ algo, match: computed === trimmed, error: null });
    })();
  }, [knownHash, verifyText]);

  return (
    <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] pb-4 mt-4">
      <div className="h-11 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
        <span className="text-sm font-medium flex items-center gap-1.5"><span className="text-[var(--accent-color)]"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8.5 1.709a.75.75 0 0 0-1 0 8.963 8.963 0 0 1-4.84 2.217.75.75 0 0 0-.654.72 10.499 10.499 0 0 0 5.647 9.672.75.75 0 0 0 .694-.001 10.499 10.499 0 0 0 5.647-9.672.75.75 0 0 0-.654-.719A8.963 8.963 0 0 1 8.5 1.71ZM10.78 7.03a.75.75 0 0 0-1.06-1.06L7.5 8.19 6.28 6.97a.75.75 0 0 0-1.06 1.06l1.75 1.75a.75.75 0 0 0 1.06 0l2.75-2.75Z" clipRule="evenodd" /></svg></span>Hash Verifier{toolSlug && <Link to={`/tools/${toolSlug}`} className="text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors" title="Open tool page"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M4.22 11.78a.75.75 0 0 1 0-1.06L9.44 5.5H5.75a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V6.56l-5.22 5.22a.75.75 0 0 1-1.06 0Z" /></svg></Link>}</span>
        <InfoButton info={{
          what: 'Verifies whether a known hash matches the hash of a given text. Auto-detects the algorithm by hash length (32=MD5, 40=SHA-1, 64=SHA-256, 128=SHA-512).',
          how: 'Computes the hash of your input text using the detected algorithm, then compares it character-by-character against the known hash.',
          usedFor: 'Verifying file integrity after downloads, checking password hashes, validating data checksums, and confirming message authenticity.',
        }} />
      </div>
      <div className="p-4 space-y-3">
        <div>
          <label htmlFor="known-hash" className="text-xs text-[var(--text-secondary)] mb-1 block">Known hash</label>
          <input
            id="known-hash"
            type="text"
            value={knownHash}
            onChange={(e) => setKnownHash(e.target.value)}
            placeholder="Paste a hash to verify..."
            className="w-full px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
          />
        </div>
        <div>
          <label htmlFor="verify-text" className="text-xs text-[var(--text-secondary)] mb-1 block">Text to verify</label>
          <input
            id="verify-text"
            type="text"
            value={verifyText}
            onChange={(e) => setVerifyText(e.target.value)}
            placeholder="Text to hash and compare..."
            className="w-full px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
          />
        </div>
        {result && (
          <div className="flex items-center gap-2">
            {result.error ? (
              <span className="text-xs text-[var(--text-secondary)]">{result.error}</span>
            ) : (
              <>
                {result.algo && (
                  <span className="text-xs text-[var(--text-secondary)]">Detected: {result.algo}</span>
                )}
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    result.match
                      ? 'bg-[var(--diff-add)] text-[var(--success-color)]'
                      : 'bg-[var(--diff-remove)] text-[var(--error-color)]'
                  }`}
                >
                  {result.match ? 'Match' : 'No match'}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HashVerifier;
