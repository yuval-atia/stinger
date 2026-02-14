import { useState } from 'react';
import FormatButton from '../components/common/FormatButton';
import CopyButton from '../components/common/CopyButton';
import { InfoButton } from '../components/common/InfoTooltip';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  formatSQL, minifySQL,
  formatXML, minifyXML,
  formatCSS, minifyCSS,
  formatHTML, minifyHTML,
} from '../utils/formatters';

const LANGUAGES = [
  { value: 'sql', label: 'SQL' },
  { value: 'xml', label: 'XML' },
  { value: 'css', label: 'CSS' },
  { value: 'html', label: 'HTML' },
];

const FORMATTERS = {
  sql: { format: formatSQL, minify: minifySQL },
  xml: { format: formatXML, minify: minifyXML },
  css: { format: formatCSS, minify: minifyCSS },
  html: { format: formatHTML, minify: minifyHTML },
};

function FormatterPage() {
  useDocumentTitle('JSON, XML & Code Formatter');
  const [lang, setLang] = useState('sql');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFormat = () => {
    if (!input.trim()) return;
    setOutput(FORMATTERS[lang].format(input));
  };

  const handleMinify = () => {
    if (!input.trim()) return;
    setOutput(FORMATTERS[lang].minify(input));
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)]">
        {/* Title bar */}
        <div className="h-11 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
          <span className="text-sm font-medium flex items-center gap-1.5"><span className="text-[var(--accent-color)]"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2 3.75A.75.75 0 0 1 2.75 3h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 3.75Zm0 4A.75.75 0 0 1 2.75 7h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 2 7.75Zm0 4a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" /></svg></span>Formatter</span>
          <div className="flex items-center gap-2">
            <InfoButton info={{
              what: 'Formats or minifies SQL, XML, CSS, and HTML code. Format adds proper indentation; Minify strips whitespace for smallest output.',
              how: 'Pure-JS parsers tokenize the input by language-specific delimiters (keywords, braces, tags), then reconstruct with proper indentation or collapsed whitespace.',
              usedFor: 'Cleaning up messy code, preparing minified assets, debugging API responses, and making config files readable.',
            }} />
            <FormatButton onClick={handleFormat} label="Format" variant="primary" />
            <FormatButton onClick={handleMinify} label="Minify" variant="default" />
          </div>
        </div>

        {/* Language tabs */}
        <div className="flex border-b border-[var(--border-color)]">
          {LANGUAGES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { setLang(value); setOutput(''); }}
              className={`px-4 py-2 text-xs transition-colors ${
                lang === value
                  ? 'bg-[var(--border-color)] text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Input / Output panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="p-4 md:border-r border-[var(--border-color)]">
            <label className="text-xs text-[var(--text-secondary)] mb-2 block">Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Paste ${lang.toUpperCase()} here...`}
              className="w-full h-80 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-none"
            />
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-[var(--text-secondary)]">Output</label>
              {output && (
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
              )}
            </div>
            <div className="w-full h-80 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] overflow-auto whitespace-pre-wrap">
              {output || <span className="text-[var(--text-secondary)]">Formatted output will appear here</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormatterPage;
