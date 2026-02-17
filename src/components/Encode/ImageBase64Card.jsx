import { useState, useRef, useCallback } from 'react';
import ToolCard from '../common/ToolCard';
import CopyButton from '../common/CopyButton';

function ImageBase64Card() {
  const [dataUri, setDataUri] = useState('');
  const [fileInfo, setFileInfo] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef(null);

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;

    setFileInfo({ name: file.name, size: file.size, type: file.type });

    const reader = new FileReader();
    reader.onload = (e) => {
      setDataUri(e.target.result);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleCopy = () => {
    if (dataUri) {
      navigator.clipboard.writeText(dataUri);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <ToolCard title="Image to Base64" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm10.5 5.707a.5.5 0 0 0-.146-.353l-3.5-3.5a.5.5 0 0 0-.708 0l-2.5 2.5-1-1a.5.5 0 0 0-.708 0l-1.5 1.5a.5.5 0 0 0-.146.354V12a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5l.208-2.293ZM6.5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" /></svg>} info={{
      what: 'Converts an image file to a Base64-encoded data URI string. Supports PNG, JPEG, GIF, SVG, WebP, and other browser-supported formats.',
      how: 'Uses the FileReader API to read the image as a data URL (Base64), entirely in the browser — the file never leaves your machine.',
      usedFor: 'Embedding images in CSS/HTML, sending images in JSON payloads, storing thumbnails in databases, and avoiding extra HTTP requests.',
    }}>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => fileRef.current?.click()}
        className={`w-full flex items-center justify-center rounded border-2 border-dashed cursor-pointer transition-colors ${
          dataUri ? 'h-20' : 'h-28'
        } ${
          dragging
            ? 'border-[var(--accent-color)] bg-[var(--bg-secondary)]'
            : 'border-[var(--border-color)] hover:border-[var(--accent-color)]'
        }`}
      >
        {dataUri ? (
          <img src={dataUri} alt="Preview" className="max-h-full max-w-full object-contain rounded" />
        ) : (
          <span className="text-xs text-[var(--text-secondary)]">
            Drop an image or click to select
          </span>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* File info */}
      {fileInfo && (
        <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
          <span>{fileInfo.name}</span>
          <span>{formatSize(fileInfo.size)}</span>
          <span>{fileInfo.type}</span>
        </div>
      )}

      {/* Data URI output */}
      {dataUri && (
        <div className="relative animate-fade-in">
          <div className="w-full max-h-32 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] break-all overflow-auto pr-8">
            {dataUri}
          </div>
          <div className="absolute top-2 right-2">
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
          <div className="text-[10px] text-[var(--text-secondary)] mt-1">
            Base64 length: {dataUri.length.toLocaleString()} chars
          </div>
        </div>
      )}
    </ToolCard>
  );
}

export default ImageBase64Card;
