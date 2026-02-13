import { useState, useMemo } from 'react';
import ToolCard from '../common/ToolCard';
import CopyButton from '../common/CopyButton';
import { markdownToHtml } from '../../utils/markdown';

function MarkdownPreviewCard() {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);

  const html = useMemo(() => markdownToHtml(input), [input]);

  const handleCopy = () => {
    if (html) {
      navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <ToolCard title="Markdown Preview" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M2 4.5A2.5 2.5 0 0 1 4.5 2h7A2.5 2.5 0 0 1 14 4.5v7a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 11.5v-7Zm3.25.5a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5h-5.5Zm0 3a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5h-5.5Zm0 3a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" /></svg>} info={{
      what: 'Live preview of Markdown text rendered as styled HTML. Supports headings, bold, italic, links, lists, code blocks, and more.',
      how: 'A pure-JS Markdown parser converts input to HTML using regex-based inline parsing and line-by-line block detection. No external libraries needed.',
      usedFor: 'Previewing README files, writing documentation, composing blog posts, and testing Markdown syntax before committing.',
    }}>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type markdown here..."
        className="w-full h-24 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-none"
      />
      <div className="relative">
        <div className="w-full min-h-[60px] px-3 py-2 text-xs rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-auto pr-8">
          {html ? (
            <div className="markdown-body" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <span className="text-[var(--text-secondary)]">Preview will appear here</span>
          )}
        </div>
        {html && (
          <div className="absolute top-2 right-2">
            <CopyButton onClick={handleCopy} tooltip={copied ? 'Copied!' : 'Copy HTML'}>
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

export default MarkdownPreviewCard;
