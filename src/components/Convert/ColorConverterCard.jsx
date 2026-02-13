import { useState, useMemo } from 'react';
import ToolCard, { CopyField } from '../common/ToolCard';
import { hexToRgb, rgbToHsl, formatRgb, formatHsl } from '../../utils/colorConverter';

function ColorConverterCard() {
  const [hex, setHex] = useState('#3b82f6');

  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const hsl = useMemo(() => rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null, [rgb]);

  return (
    <ToolCard title="Color Converter" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M2 4.5A2.5 2.5 0 0 1 4.5 2h7A2.5 2.5 0 0 1 14 4.5v.5H2v-.5ZM2 6h3v3H2V6Zm4 0h4v3H6V6Zm5 0h3v3h-3V6ZM2 10h5v4H4.5A2.5 2.5 0 0 1 2 11.5V10Zm6 0h6v1.5a2.5 2.5 0 0 1-2.5 2.5H8v-4Z" /></svg>} info={{
      what: 'Converts colors between HEX, RGB, and HSL formats with a live color picker and preview swatch.',
      how: 'Parses the hex string into R/G/B components, then applies standard color-space formulas to derive HSL values. All conversions are bidirectional.',
      usedFor: 'CSS development, design handoffs, theming, accessibility contrast checks, and converting between design tools that use different formats.',
    }}>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={hex.startsWith('#') && hex.length === 7 ? hex : '#000000'}
          onChange={(e) => setHex(e.target.value)}
          className="w-10 h-8 rounded border border-[var(--border-color)] cursor-pointer bg-transparent"
        />
        <input
          type="text"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          placeholder="#3b82f6"
          className="flex-1 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
        />
      </div>
      {rgb && (
        <>
          <div
            className="w-full h-10 rounded border border-[var(--border-color)]"
            style={{ backgroundColor: hex }}
          />
          <div className="space-y-1.5">
            <CopyField label="HEX" value={hex.toUpperCase()} />
            <CopyField label="RGB" value={formatRgb(rgb)} />
            {hsl && <CopyField label="HSL" value={formatHsl(hsl)} />}
          </div>
        </>
      )}
      {!rgb && hex.length > 1 && (
        <div className="text-xs text-[var(--error-color)]">Invalid hex color</div>
      )}
    </ToolCard>
  );
}

export default ColorConverterCard;
