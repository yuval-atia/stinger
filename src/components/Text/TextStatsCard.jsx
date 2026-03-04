import { useState, useMemo } from 'react';
import ToolCard, { CopyField } from '../common/ToolCard';
import { computeTextStats } from '../../utils/textTools';

const StatsIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path d="M4 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4Zm.75 5a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0v-3.5A.75.75 0 0 0 4.75 7ZM8 4.75a.75.75 0 0 0-1.5 0v6.5a.75.75 0 0 0 1.5 0v-6.5ZM11.25 6a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75Z" />
  </svg>
);

function TextStatsCard({ toolSlug }) {
  const [text, setText] = useState('');

  const stats = useMemo(() => computeTextStats(text), [text]);

  return (
    <ToolCard title="Text Statistics" toolSlug={toolSlug} icon={StatsIcon} info={{
      what: 'Counts words, characters, lines, sentences, paragraphs, and estimates reading time.',
      how: 'Splits text by whitespace for word count, regex for sentences, and double newlines for paragraphs. Reading time is based on 200 words per minute.',
      usedFor: 'Checking document length, meeting word limits, estimating reading time for articles and essays.',
    }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or type text..."
        className="w-full h-28 px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] resize-none"
      />
      <div className="grid grid-cols-2 gap-1.5">
        <CopyField label="Words" value={String(stats.words)} />
        <CopyField label="Characters" value={String(stats.characters)} />
        <CopyField label="No spaces" value={String(stats.charactersNoSpaces)} />
        <CopyField label="Lines" value={String(stats.lines)} />
        <CopyField label="Sentences" value={String(stats.sentences)} />
        <CopyField label="Paragraphs" value={String(stats.paragraphs)} />
        <CopyField label="Reading time" value={stats.readingTime} />
      </div>
    </ToolCard>
  );
}

export default TextStatsCard;
