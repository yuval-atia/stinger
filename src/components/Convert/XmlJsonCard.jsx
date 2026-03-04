import { useState, useMemo } from 'react';
import ToolCard from '../common/ToolCard';
import CopyButton from '../common/CopyButton';
import { xmlToJson, jsonToXml } from '../../utils/xmlJson';

const MODES = [
  { key: 'xml2json', label: 'XML → JSON' },
  { key: 'json2xml', label: 'JSON → XML' },
];

const SAMPLE_XML = `<bookstore>
  <book category="fiction">
    <title>Dune</title>
    <author>Frank Herbert</author>
    <price>12.99</price>
  </book>
</bookstore>`;

const SAMPLE_JSON = `{
  "bookstore": {
    "book": {
      "@category": "fiction",
      "title": "Dune",
      "author": "Frank Herbert",
      "price": 12.99
    }
  }
}`;

function XmlJsonCard({ toolSlug }) {
  const [mode, setMode] = useState('xml2json');
  const [input, setInput] = useState(SAMPLE_XML);

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setInput(newMode === 'xml2json' ? SAMPLE_XML : SAMPLE_JSON);
  };

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: '', error: null };

    if (mode === 'xml2json') {
      const { result, error } = xmlToJson(input);
      return { output: result ? JSON.stringify(result, null, 2) : '', error };
    } else {
      const { result, error } = jsonToXml(input);
      return { output: result || '', error };
    }
  }, [input, mode]);

  return (
    <ToolCard toolSlug={toolSlug} title="XML ↔ JSON" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M5.526 3.886a.75.75 0 0 0-1.052.134l-3.3 4.2a.75.75 0 0 0 0 .92l3.3 4.2a.75.75 0 1 0 1.178-.928L2.558 8.4l3.094-3.912a.75.75 0 0 0-.126-1.002ZM10.474 3.886a.75.75 0 0 1 1.052.134l3.3 4.2a.75.75 0 0 1 0 .92l-3.3 4.2a.75.75 0 0 1-1.178-.928L13.442 8.4l-3.094-3.912a.75.75 0 0 1 .126-1.002ZM7.27 14.122a.75.75 0 0 1-.522-.923l2-7a.75.75 0 0 1 1.444.412l-2 7a.75.75 0 0 1-.922.51Z" /></svg>} info={{
      what: 'Converts between XML and JSON formats in both directions, preserving attributes with @ prefixes.',
      how: 'XML→JSON uses DOMParser to walk the XML DOM tree. JSON→XML builds XML elements from object keys, using @ prefixed keys as attributes.',
      usedFor: 'Migrating config files, transforming API payloads between XML-based (SOAP) and JSON-based (REST) services, and quick format conversion.',
    }}>
      <div className="flex gap-1">
        {MODES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handleModeSwitch(key)}
            className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
              mode === key
                ? 'bg-[var(--accent-color)] text-white'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === 'xml2json' ? 'Paste XML here...' : 'Paste JSON here...'}
        rows={5}
        spellCheck={false}
        className="w-full px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-y"
      />

      {error && (
        <div className="text-xs text-[var(--error-color)]">{error}</div>
      )}

      {output && (
        <div className="relative">
          <pre className="w-full px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto">{output}</pre>
          <div className="absolute top-1.5 right-1.5">
            <CopyButton text={output} />
          </div>
        </div>
      )}
    </ToolCard>
  );
}

export default XmlJsonCard;
