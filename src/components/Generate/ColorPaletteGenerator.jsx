import { useState, useCallback } from 'react';
import GeneratorCard from './GeneratorCard';
import { generatePalette } from '../../utils/colorConverter';

const IconPalette = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path d="M2 4.5A2.5 2.5 0 0 1 4.5 2h7A2.5 2.5 0 0 1 14 4.5v.5H2v-.5ZM2 6h3v3H2V6Zm4 0h4v3H6V6Zm5 0h3v3h-3V6ZM2 10h5v4H4.5A2.5 2.5 0 0 1 2 11.5V10Zm6 0h6v1.5a2.5 2.5 0 0 1-2.5 2.5H8v-4Z" />
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

export default function ColorPaletteGenerator() {
  const [count, setCount] = useState(5);

  const handleGenerate = useCallback(() => {
    const palette = generatePalette(Math.min(Math.max(count, 3), 10));
    return JSON.stringify(palette);
  }, [count]);

  const renderOutput = useCallback((output) => {
    let palette;
    try {
      palette = JSON.parse(output);
    } catch {
      return <pre className="text-sm">{output}</pre>;
    }

    return (
      <div className="flex flex-wrap gap-2 h-full items-start">
        {palette.map((color, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className="w-12 h-12 rounded border border-[var(--border-color)]"
              style={{ backgroundColor: color.hex }}
            />
            <span className="text-[10px] font-mono text-[var(--text-secondary)]">
              {color.hex.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    );
  }, []);

  return (
    <GeneratorCard
      title="Color Palette"
      icon={IconPalette}
      info={{
        what: 'A set of visually harmonious colors generated using the golden ratio for even hue distribution.',
        how: 'Starts with a random hue and steps by the golden ratio conjugate (~0.618) to produce evenly spaced, aesthetically pleasing colors.',
        usedFor: 'UI theming, data visualization color schemes, design mockups, and branding exploration.',
      }}
      onGenerate={handleGenerate}
      renderOutput={renderOutput}
    >
      <ConfigInput label="Colors" value={count} onChange={setCount} min={3} max={10} />
    </GeneratorCard>
  );
}
