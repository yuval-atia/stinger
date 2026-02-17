import { useState, useMemo, useCallback } from 'react';
import ToolCard, { CopyField } from '../common/ToolCard';
import { permsToOctal, permsToSymbolic, octalToPerms, PRESETS } from '../../utils/chmod';

const DEFAULT_PERMS = {
  owner: { r: true, w: true, x: true },
  group: { r: true, w: false, x: true },
  other: { r: true, w: false, x: true },
};

const ROLES = ['owner', 'group', 'other'];
const BITS = ['r', 'w', 'x'];
const BIT_LABELS = { r: 'Read', w: 'Write', x: 'Execute' };
const ROLE_LABELS = { owner: 'Owner', group: 'Group', other: 'Other' };

function ChmodCalculatorCard() {
  const [perms, setPerms] = useState(DEFAULT_PERMS);

  const octal = useMemo(() => permsToOctal(perms), [perms]);
  const symbolic = useMemo(() => permsToSymbolic(perms), [perms]);

  const toggleBit = useCallback((role, bit) => {
    setPerms(prev => ({
      ...prev,
      [role]: { ...prev[role], [bit]: !prev[role][bit] },
    }));
  }, []);

  const applyPreset = useCallback((presetOctal) => {
    setPerms(octalToPerms(presetOctal));
  }, []);

  return (
    <ToolCard title="Chmod Calculator" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Zm-2 2.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 9.5Z" clipRule="evenodd" /></svg>} info={{
      what: 'Interactive Unix file permission calculator. Toggle read/write/execute bits for owner, group, and other to see the octal and symbolic notation.',
      how: 'Maps each permission bit to its octal value (read=4, write=2, execute=1) and sums per role. Symbolic notation uses r/w/x or dash characters.',
      usedFor: 'Setting file permissions with chmod, understanding ls -l output, configuring server file access, and Dockerfile permission setup.',
    }}>
      {/* Permission grid */}
      <div className="grid grid-cols-4 gap-1 text-xs">
        <div />
        {BITS.map(b => (
          <div key={b} className="text-center text-[var(--text-secondary)] font-medium">{BIT_LABELS[b]}</div>
        ))}
        {ROLES.map(role => (
          <div key={role} className="contents">
            <div className="text-[var(--text-secondary)] flex items-center">{ROLE_LABELS[role]}</div>
            {BITS.map(bit => (
              <div key={bit} className="flex justify-center">
                <button
                  type="button"
                  onClick={() => toggleBit(role, bit)}
                  className={`w-8 h-8 rounded border text-xs font-mono font-bold transition-colors ${
                    perms[role][bit]
                      ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white'
                      : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-color)]'
                  }`}
                >
                  {perms[role][bit] ? bit : '-'}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map(p => (
          <button
            key={p.octal}
            type="button"
            onClick={() => applyPreset(p.octal)}
            className={`px-2 py-1 text-xs rounded border transition-colors ${
              octal === p.octal
                ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white'
                : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-color)]'
            }`}
            title={p.desc}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-1.5 animate-fade-in">
        <CopyField label="Octal" value={octal} />
        <CopyField label="Symbolic" value={symbolic} />
        <CopyField label="Command" value={`chmod ${octal}`} />
      </div>
    </ToolCard>
  );
}

export default ChmodCalculatorCard;
