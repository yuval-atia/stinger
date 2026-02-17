import { useState, useCallback } from 'react';
import GeneratorCard from './GeneratorCard';
import { generatePlaceholderSvg } from '../../utils/placeholderImage';

const IconImage = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm10.5 5.707a.5.5 0 0 0-.146-.353l-3.5-3.5a.5.5 0 0 0-.708 0l-2.5 2.5-1-1a.5.5 0 0 0-.708 0l-1.5 1.5a.5.5 0 0 0-.146.354V12a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5l.208-2.293ZM6.5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
  </svg>
);

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

function ColorInput({ label, value, onChange }) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
      {label}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-7 h-6 rounded border border-[var(--border-color)] cursor-pointer bg-transparent"
      />
    </label>
  );
}

function PlaceholderImageGenerator() {
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(300);
  const [bgColor, setBgColor] = useState('#cccccc');
  const [textColor, setTextColor] = useState('#666666');
  const [text, setText] = useState('');

  const handleGenerate = useCallback(() => {
    return generatePlaceholderSvg({ width, height, bgColor, textColor, text });
  }, [width, height, bgColor, textColor, text]);

  const handleDownload = useCallback(() => {
    const svg = generatePlaceholderSvg({ width, height, bgColor, textColor, text });
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `placeholder_${width}x${height}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }, [width, height, bgColor, textColor, text]);

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
      title="Placeholder Image"
      icon={IconImage}
      info={{
        what: 'Generates placeholder images as SVG with configurable dimensions, colors, and text overlay.',
        how: 'Constructs an SVG with a filled rectangle background and centered text. Font size auto-scales based on image dimensions.',
        usedFor: 'Mocking up UI layouts, filling image slots during development, generating test thumbnails, and wireframing.',
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
      <ConfigInput label="W" value={width} onChange={setWidth} min={10} max={4000} />
      <ConfigInput label="H" value={height} onChange={setHeight} min={10} max={4000} />
      <ColorInput label="BG" value={bgColor} onChange={setBgColor} />
      <ColorInput label="Text" value={textColor} onChange={setTextColor} />
      <ConfigInput label="Label" type="text" value={text} onChange={setText} placeholder="auto" />
    </GeneratorCard>
  );
}

export default PlaceholderImageGenerator;
