import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import CopyButton from '../common/CopyButton';
import { InfoButton } from '../common/InfoTooltip';

function FileChecksum({ toolSlug }) {
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
        <span className="text-sm font-medium flex items-center gap-1.5"><span className="text-[var(--accent-color)]"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M3.5 2A1.5 1.5 0 0 0 2 3.5v9A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 12.5 2h-9ZM6.25 5.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm4.25.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM6.25 10.5a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm4.25.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5ZM8 8.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" /></svg></span>File Checksum (SHA-256){toolSlug && <Link to={`/tools/${toolSlug}`} className="text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors" title="Open tool page"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M4.22 11.78a.75.75 0 0 1 0-1.06L9.44 5.5H5.75a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V6.56l-5.22 5.22a.75.75 0 0 1-1.06 0Z" /></svg></Link>}</span>
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

export default FileChecksum;
