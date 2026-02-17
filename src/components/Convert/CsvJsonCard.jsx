import { useState, useMemo } from 'react';
import ToolCard from '../common/ToolCard';
import FormatButton from '../common/FormatButton';
import CopyButton from '../common/CopyButton';
import { csvToJson, jsonToCsv } from '../../utils/csvJson';

function CsvJsonCard() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('csvToJson');
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: '', error: '' };
    return mode === 'csvToJson' ? csvToJson(input) : jsonToCsv(input);
  }, [input, mode]);

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <ToolCard title="CSV / JSON" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4 2a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5V6.621a1.5 1.5 0 0 0-.44-1.06L9.94 2.439A1.5 1.5 0 0 0 8.878 2H4Zm1 3.75A.75.75 0 0 1 5.75 5h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 5.75Zm0 3a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 5 8.75Zm0 3a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" /></svg>} info={{
      what: 'Converts between CSV (comma-separated values) and JSON array format. Handles quoted fields, commas in values, and type detection.',
      how: 'CSV→JSON uses a streaming parser that handles RFC 4180 quoting rules, with auto-detection of numbers, booleans, and null. JSON→CSV extracts all unique keys as headers.',
      usedFor: 'Migrating spreadsheet data to APIs, converting API responses to spreadsheet format, and quick data format transformations.',
    }}>
      <div className="flex gap-2">
        <FormatButton label="CSV → JSON" variant={mode === 'csvToJson' ? 'primary' : 'default'} onClick={() => { setMode('csvToJson'); setInput(''); }} />
        <FormatButton label="JSON → CSV" variant={mode === 'jsonToCsv' ? 'primary' : 'default'} onClick={() => { setMode('jsonToCsv'); setInput(''); }} />
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === 'csvToJson' ? 'name,age,city\nAlice,30,NYC\nBob,25,LA' : '[{"name":"Alice","age":30}]'}
        className="w-full h-28 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-none"
      />
      <div className="relative">
        <div className="w-full min-h-[60px] max-h-48 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] whitespace-pre-wrap break-all overflow-auto pr-8">
          {error ? (
            <span className="text-[var(--error-color)]">{error}</span>
          ) : output ? (
            <span className="animate-fade-in">{output}</span>
          ) : (
            <span className="text-[var(--text-secondary)]">Output will appear here</span>
          )}
        </div>
        {output && !error && (
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
        )}
      </div>
    </ToolCard>
  );
}

export default CsvJsonCard;
