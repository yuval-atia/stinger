import { useState, useCallback } from 'react';
import { jsonToYaml, yamlToJson } from '../../utils/yaml';
import ToolCard from '../common/ToolCard';
import FormatButton from '../common/FormatButton';
import CopyButton from '../common/CopyButton';

function JsonYamlCard() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('jsonToYaml');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const convert = useCallback((text, direction) => {
    if (!text.trim()) { setOutput(''); setError(''); return; }
    try {
      if (direction === 'jsonToYaml') {
        const parsed = JSON.parse(text);
        setOutput(jsonToYaml(parsed));
      } else {
        const parsed = yamlToJson(text);
        setOutput(JSON.stringify(parsed, null, 2));
      }
      setError('');
    } catch (e) {
      setOutput('');
      setError(e.message);
    }
  }, []);

  const handleInput = (value) => {
    setInput(value);
    convert(value, mode);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    convert(input, newMode);
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <ToolCard title="JSON / YAML" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M15 8A7 7 0 1 0 1 8a7 7 0 0 0 14 0ZM6.101 4.836A.75.75 0 0 0 4.899 5.664L6.227 8l-1.328 2.336a.75.75 0 1 0 1.302.728l1.5-2.636a.78.78 0 0 0 0-.756l-1.5-2.636a.75.75 0 0 0-.1-.2ZM9.25 10.5a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5h-1.5Z" clipRule="evenodd" /></svg>} info={{
      what: 'Converts between JSON and YAML formats. Paste either format and transform it to the other with a single click.',
      how: 'Uses a pure-JS YAML parser/serializer — no external dependencies. JSON is parsed natively and YAML handles indentation-based syntax with support for common data types.',
      usedFor: 'Converting config files (Docker Compose, Kubernetes, CI/CD), migrating between API formats, and making YAML configs more readable.',
    }}>
      <div className="flex gap-2">
        <FormatButton
          label="JSON → YAML"
          variant={mode === 'jsonToYaml' ? 'primary' : 'default'}
          onClick={() => handleModeChange('jsonToYaml')}
        />
        <FormatButton
          label="YAML → JSON"
          variant={mode === 'yamlToJson' ? 'primary' : 'default'}
          onClick={() => handleModeChange('yamlToJson')}
        />
      </div>
      <textarea
        value={input}
        onChange={(e) => handleInput(e.target.value)}
        placeholder={mode === 'jsonToYaml' ? 'Paste JSON...' : 'Paste YAML...'}
        className="w-full h-24 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-none"
      />
      {error && <div className="text-xs text-[var(--error-color)] break-all">{error}</div>}
      <div className="relative">
        <pre className="w-full min-h-[60px] max-h-48 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-auto whitespace-pre-wrap break-all pr-8">
          {output || <span className="text-[var(--text-secondary)]">Output will appear here</span>}
        </pre>
        {output && (
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

export default JsonYamlCard;
