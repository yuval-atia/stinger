import { useState, useMemo } from 'react';
import ToolCard from '../common/ToolCard';
import { contrastRatio, wcagResults } from '../../utils/contrastChecker';

function Badge({ pass, label }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
      pass
        ? 'bg-[var(--diff-add)] text-[var(--success-color)]'
        : 'bg-[var(--diff-remove)] text-[var(--error-color)]'
    }`}>
      {label}: {pass ? 'Pass' : 'Fail'}
    </span>
  );
}

function ContrastCheckerCard() {
  const [fg, setFg] = useState('#000000');
  const [bg, setBg] = useState('#ffffff');

  const results = useMemo(() => {
    try {
      const ratio = contrastRatio(fg, bg);
      return wcagResults(ratio);
    } catch {
      return null;
    }
  }, [fg, bg]);

  const swap = () => {
    setFg(bg);
    setBg(fg);
  };

  return (
    <ToolCard title="Contrast Checker" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM5.5 8a2.5 2.5 0 0 1 5 0 2.5 2.5 0 0 1-5 0Z" /></svg>} info={{
      what: 'Checks the contrast ratio between two colors against WCAG 2.1 accessibility standards. Shows AA and AAA compliance for normal and large text.',
      how: 'Calculates relative luminance of each color using the sRGB linearization formula, then computes the contrast ratio per WCAG 2.1 guidelines.',
      usedFor: 'Ensuring text readability for visually impaired users, meeting accessibility requirements (ADA, Section 508), and designing inclusive color palettes.',
    }}>
      {/* Color inputs */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-[var(--text-secondary)]">Text</label>
          <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="w-8 h-7 rounded border border-[var(--border-color)] cursor-pointer bg-transparent" />
          <input type="text" value={fg} onChange={(e) => setFg(e.target.value)} className="w-20 px-2 py-1 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]" />
        </div>
        <button type="button" onClick={swap} className="p-1 rounded hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-secondary)] hover:text-[var(--accent-color)]" title="Swap colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M13.78 10.47a.75.75 0 0 1 0 1.06l-2.25 2.25a.75.75 0 0 1-1.06 0l-2.25-2.25a.75.75 0 1 1 1.06-1.06l.97.97V8.75a.75.75 0 0 1 1.5 0v2.69l.97-.97a.75.75 0 0 1 1.06 0ZM2.22 5.53a.75.75 0 0 1 0-1.06l2.25-2.25a.75.75 0 0 1 1.06 0l2.25 2.25a.75.75 0 0 1-1.06 1.06l-.97-.97v2.69a.75.75 0 0 1-1.5 0V4.56l-.97.97a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" /></svg>
        </button>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-[var(--text-secondary)]">BG</label>
          <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-8 h-7 rounded border border-[var(--border-color)] cursor-pointer bg-transparent" />
          <input type="text" value={bg} onChange={(e) => setBg(e.target.value)} className="w-20 px-2 py-1 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]" />
        </div>
      </div>

      {/* Preview */}
      <div className="rounded border border-[var(--border-color)] p-4 text-center" style={{ backgroundColor: bg, color: fg }}>
        <div className="text-lg font-bold">Sample Text</div>
        <div className="text-xs">The quick brown fox jumps over the lazy dog</div>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-secondary)] w-16">Ratio</span>
            <span className="text-sm font-bold text-[var(--text-primary)]">{results.ratio}:1</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-secondary)] w-16">AA</span>
            <Badge pass={results.aa.normal} label="Normal" />
            <Badge pass={results.aa.large} label="Large" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-secondary)] w-16">AAA</span>
            <Badge pass={results.aaa.normal} label="Normal" />
            <Badge pass={results.aaa.large} label="Large" />
          </div>
        </div>
      )}
    </ToolCard>
  );
}

export default ContrastCheckerCard;
