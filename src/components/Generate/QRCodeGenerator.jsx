import { useState, useCallback } from 'react';
import GeneratorCard from './GeneratorCard';
import { ConfigInput, ConfigSelect } from './generatorHelpers';
import { generateQRSvg } from '../../utils/generators';

const IconQR = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M2 2h5v5H2V2Zm1.5 1.5v2h2v-2h-2ZM9 2h5v5H9V2Zm1.5 1.5v2h2v-2h-2ZM2 9h5v5H2V9Zm1.5 1.5v2h2v-2h-2ZM12 9h2v2h-2V9ZM9 12h2v2H9v-2Zm3 0h2v2h-2v-2ZM9 9h2v2H9V9Z" clipRule="evenodd" />
  </svg>
);

function QRCodeGenerator({ toolSlug }) {
  const [text, setText] = useState('https://stingr.dev');
  const [errorLevel, setErrorLevel] = useState('M');

  const handleGenerate = useCallback(() => {
    return generateQRSvg(text, errorLevel);
  }, [text, errorLevel]);

  const handleDownload = useCallback(() => {
    const svg = generateQRSvg(text, errorLevel);
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stingrQR.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, [text, errorLevel]);

  const downloadFooter = (
    <button
      type="button"
      onClick={handleDownload}
      className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 flex-shrink-0">
        <path d="M2.75 14A1.75 1.75 0 0 1 1 12.25v-2.5a.75.75 0 0 1 1.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25v-2.5a.75.75 0 0 1 1.5 0v2.5A1.75 1.75 0 0 1 13.25 14H2.75Z" />
        <path d="M7.25 7.689V2a.75.75 0 0 1 1.5 0v5.689l1.97-1.969a.749.749 0 1 1 1.06 1.06l-3.25 3.25a.749.749 0 0 1-1.06 0L4.22 6.78a.749.749 0 1 1 1.06-1.06l1.97 1.969Z" />
      </svg>
      Download SVG
    </button>
  );

  return (
    <GeneratorCard
      title="QR Code"
      icon={IconQR}
      toolSlug={toolSlug}
      info={{
        what: 'A 2D matrix barcode that encodes text, URLs, or data into a pattern of dark and light modules scannable by cameras.',
        how: 'Uses Reed-Solomon error correction to encode data into a grid of modules, with four configurable error recovery levels (L/M/Q/H). Higher levels = more redundant data = bigger QR grid, but more forgiving if part of it gets scratched, covered, or has a logo overlaid.',
        usedFor: 'Sharing URLs, Wi-Fi credentials, contact info, payment links, product tracking, and event tickets.',
      }}
      onGenerate={handleGenerate}
      footer={downloadFooter}
      renderOutput={(svg) => (
        <div
          className="h-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:max-w-full [&>svg]:h-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
    >
      <ConfigInput
        label="Text"
        type="text"
        value={text}
        onChange={setText}
        className="w-48 px-2 py-1 text-xs rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
      />
      <ConfigSelect
        label="Error Level"
        value={errorLevel}
        onChange={setErrorLevel}
        options={[
          { value: 'L', label: 'L (7%)' },
          { value: 'M', label: 'M (15%)' },
          { value: 'Q', label: 'Q (25%)' },
          { value: 'H', label: 'H (30%)' },
        ]}
      />
    </GeneratorCard>
  );
}

export default QRCodeGenerator;
