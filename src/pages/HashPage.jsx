import { useState, useEffect, useRef } from 'react';
import CopyButton from '../components/common/CopyButton';
import { InfoButton } from '../components/common/InfoTooltip';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  computeMD5,
  computeSHA1,
  computeSHA256,
  computeSHA512,
  computeHMACSHA256,
  computeHMACSHA512,
} from '../utils/hash';

function HashRow({ label, value }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[var(--text-secondary)] w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 min-w-0 bg-[var(--bg-secondary)] rounded border border-[var(--border-color)] px-3 py-2 text-xs font-mono truncate">
        {value || <span className="text-[var(--text-secondary)]">—</span>}
      </div>
      <CopyButton onClick={handleCopy} tooltip={copied ? 'Copied!' : 'Copy'}>
        {copied ? (
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
    </div>
  );
}

function HashPage() {
  useDocumentTitle('SHA-256, MD5 & Hash Generator');
  const [input, setInput] = useState('');
  const [secret, setSecret] = useState('');
  const [hashes, setHashes] = useState({ md5: '', sha1: '', sha256: '', sha512: '' });
  const [hmacs, setHmacs] = useState({ sha256: '', sha512: '' });
  const cancelRef = useRef(0);

  // Compute hashes on input change
  useEffect(() => {
    const id = ++cancelRef.current;

    if (!input) {
      setHashes({ md5: '', sha1: '', sha256: '', sha512: '' });
      return;
    }

    // MD5 is synchronous
    setHashes((prev) => ({ ...prev, md5: computeMD5(input) }));

    // SHA hashes are async
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

  // Compute HMACs on input + secret change
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
    <div className="h-full overflow-y-auto">
      <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] pb-4 card-hover">
        {/* Title bar */}
        <div className="h-11 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
          <span className="text-sm font-medium flex items-center gap-1.5"><span className="text-[var(--accent-color)]"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z" clipRule="evenodd" /></svg></span>Hash Generator</span>
          <InfoButton info={{
            what: 'Computes MD5, SHA-1, SHA-256, and SHA-512 hashes of any text input in real time, plus HMAC signatures with a secret key.',
            how: 'MD5 is computed with a pure-JS implementation. SHA variants use the Web Crypto API (crypto.subtle.digest). HMACs use crypto.subtle.sign with an imported key.',
            usedFor: 'Verifying data integrity, generating content fingerprints, computing API request signatures, and comparing file checksums.',
          }} />
        </div>

        <div className="p-4 space-y-6">
          {/* Input */}
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-2 block">Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or paste text to hash..."
              className="w-full h-28 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-none"
            />
          </div>

          {/* Hash results */}
          <div>
            <label className="text-xs text-[var(--text-secondary)] mb-3 block">Hash Results</label>
            <div className="space-y-2">
              <HashRow label="MD5" value={hashes.md5} />
              <HashRow label="SHA-1" value={hashes.sha1} />
              <HashRow label="SHA-256" value={hashes.sha256} />
              <HashRow label="SHA-512" value={hashes.sha512} />
            </div>
          </div>

          {/* HMAC section */}
          <div className="border-t border-[var(--border-color)] pt-4">
            <label className="text-xs text-[var(--text-secondary)] mb-2 block">HMAC</label>
            <input
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

      {/* Hash Verifier */}
      <HashVerifier />

      {/* File Checksum */}
      <FileChecksum />
    </div>
  );
}

// ── Hash Verifier ───────────────────────────────────────────────────────────
function HashVerifier() {
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

    // Auto-detect algorithm by hash length
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
        <span className="text-sm font-medium flex items-center gap-1.5"><span className="text-[var(--accent-color)]"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8.5 1.709a.75.75 0 0 0-1 0 8.963 8.963 0 0 1-4.84 2.217.75.75 0 0 0-.654.72 10.499 10.499 0 0 0 5.647 9.672.75.75 0 0 0 .694-.001 10.499 10.499 0 0 0 5.647-9.672.75.75 0 0 0-.654-.719A8.963 8.963 0 0 1 8.5 1.71ZM10.78 7.03a.75.75 0 0 0-1.06-1.06L7.5 8.19 6.28 6.97a.75.75 0 0 0-1.06 1.06l1.75 1.75a.75.75 0 0 0 1.06 0l2.75-2.75Z" clipRule="evenodd" /></svg></span>Hash Verifier</span>
        <InfoButton info={{
          what: 'Verifies whether a known hash matches the hash of a given text. Auto-detects the algorithm by hash length (32=MD5, 40=SHA-1, 64=SHA-256, 128=SHA-512).',
          how: 'Computes the hash of your input text using the detected algorithm, then compares it character-by-character against the known hash.',
          usedFor: 'Verifying file integrity after downloads, checking password hashes, validating data checksums, and confirming message authenticity.',
        }} />
      </div>
      <div className="p-4 space-y-3">
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Known hash</label>
          <input
            type="text"
            value={knownHash}
            onChange={(e) => setKnownHash(e.target.value)}
            placeholder="Paste a hash to verify..."
            className="w-full px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--text-secondary)] mb-1 block">Text to verify</label>
          <input
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

// ── File Checksum ───────────────────────────────────────────────────────────
function FileChecksum() {
  const [fileInfo, setFileInfo] = useState(null);
  const [hash, setHash] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const processFile = async (file) => {
    setFileInfo({ name: file.name, size: file.size });
    setHash('Computing...');
    try {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hex = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      setHash(hex);
    } catch {
      setHash('Error computing hash');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleCopy = () => {
    if (hash && hash !== 'Computing...') {
      navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  return (
    <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] pb-4 mt-4">
      <div className="h-11 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
        <span className="text-sm font-medium flex items-center gap-1.5"><span className="text-[var(--accent-color)]"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M3.5 2A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 12.5 2h-9ZM6.25 5.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm4.25.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM6.25 10.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm4.25.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8 8.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" /></svg></span>File Checksum (SHA-256)</span>
        <InfoButton info={{
          what: 'Computes the SHA-256 hash of any file dropped or selected. The file never leaves your browser — all processing is local.',
          how: 'Reads the file into an ArrayBuffer, then uses the Web Crypto API (crypto.subtle.digest) to compute a SHA-256 hash entirely in-browser.',
          usedFor: 'Verifying downloaded files against published checksums, detecting file tampering, and generating content-addressable identifiers.',
        }} />
      </div>
      <div className="p-4 space-y-3">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setDragging(false)}
          onClick={() => fileRef.current?.click()}
          className={`w-full h-24 flex items-center justify-center rounded border-2 border-dashed cursor-pointer transition-colors ${
            dragging
              ? 'border-[var(--accent-color)] bg-[var(--bg-secondary)]'
              : 'border-[var(--border-color)] hover:border-[var(--accent-color)]'
          }`}
        >
          <span className="text-xs text-[var(--text-secondary)]">
            Drop a file here or click to select
          </span>
          <input
            ref={fileRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        {fileInfo && (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--text-secondary)] w-24 flex-shrink-0">Filename</span>
              <div className="flex-1 min-w-0 bg-[var(--bg-secondary)] rounded border border-[var(--border-color)] px-3 py-2 text-xs font-mono truncate">
                {fileInfo.name}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--text-secondary)] w-24 flex-shrink-0">Size</span>
              <div className="flex-1 min-w-0 bg-[var(--bg-secondary)] rounded border border-[var(--border-color)] px-3 py-2 text-xs font-mono truncate">
                {formatSize(fileInfo.size)}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--text-secondary)] w-24 flex-shrink-0">SHA-256</span>
              <div className="flex-1 min-w-0 bg-[var(--bg-secondary)] rounded border border-[var(--border-color)] px-3 py-2 text-xs font-mono truncate">
                {hash}
              </div>
              <CopyButton onClick={handleCopy} tooltip={copied ? 'Copied!' : 'Copy'}>
                {copied ? (
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HashPage;
