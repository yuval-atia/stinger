import { useState } from 'react';
import ToolCard from '../common/ToolCard';
import FormatButton from '../common/FormatButton';
import CopyButton from '../common/CopyButton';
import { aesEncrypt, aesDecrypt } from '../../utils/aes';

function AesCard() {
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState('encrypt');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    if (!input || !password) {
      setError('Both text and password are required');
      setOutput('');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (mode === 'encrypt') {
        const result = await aesEncrypt(input, password);
        setOutput(result);
      } else {
        const result = await aesDecrypt(input, password);
        setOutput(result);
      }
    } catch {
      setOutput('');
      setError(mode === 'encrypt' ? 'Encryption failed' : 'Decryption failed — wrong password or corrupted data');
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <ToolCard title="AES Encrypt / Decrypt" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Zm-2 2.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 9.5Z" clipRule="evenodd" /></svg>} info={{
      what: 'Encrypts or decrypts text using AES-256-GCM with a password. Your data never leaves the browser — all cryptographic operations run client-side.',
      how: 'Derives a 256-bit key from your password using PBKDF2 (100,000 iterations, SHA-256). Encrypts with AES-GCM using a random 12-byte IV. Output is Base64-encoded (salt + IV + ciphertext).',
      usedFor: 'Securely sharing sensitive text, encrypting configuration values, protecting API keys in transit, and educational cryptography.',
    }}>
      <div className="flex gap-2">
        <FormatButton label="Encrypt" variant={mode === 'encrypt' ? 'primary' : 'default'} onClick={() => { setMode('encrypt'); setOutput(''); setError(''); }} />
        <FormatButton label="Decrypt" variant={mode === 'decrypt' ? 'primary' : 'default'} onClick={() => { setMode('decrypt'); setOutput(''); setError(''); }} />
      </div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={mode === 'encrypt' ? 'Text to encrypt...' : 'Base64 ciphertext to decrypt...'}
        className="w-full h-20 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-none"
      />
      <div className="flex items-center gap-2">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password..."
          className="flex-1 px-3 py-1.5 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
        />
        <FormatButton label={loading ? '...' : mode === 'encrypt' ? 'Encrypt' : 'Decrypt'} variant="primary" onClick={handleRun} />
      </div>
      {(output || error) && (
        <div className="relative animate-fade-in">
          <div className="w-full min-h-[40px] max-h-32 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] break-all whitespace-pre-wrap overflow-auto pr-8">
            {error ? (
              <span className="text-[var(--error-color)]">{error}</span>
            ) : (
              output
            )}
          </div>
          {output && !error && (
            <div className="absolute top-2 right-2">
              <CopyButton onClick={handleCopy} tooltip={copied ? 'Copied!' : 'Copy'}>
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[var(--success-color)]"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" /></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" /><path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" /></svg>
                )}
              </CopyButton>
            </div>
          )}
        </div>
      )}
    </ToolCard>
  );
}

export default AesCard;
