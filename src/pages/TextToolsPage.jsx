import { Link } from 'react-router-dom';
import TextDiffCard from '../components/Text/TextDiffCard';
import TextStatsCard from '../components/Text/TextStatsCard';
import CaseTransformCard from '../components/Text/CaseTransformCard';
import FindReplaceCard from '../components/Text/FindReplaceCard';
import SortLinesCard from '../components/Text/SortLinesCard';
import LineNumberCard from '../components/Text/LineNumberCard';
import DeduplicateLinesCard from '../components/Text/DeduplicateLinesCard';
import ReverseTextCard from '../components/Text/ReverseTextCard';
import TextTrimmerCard from '../components/Text/TextTrimmerCard';

function TextToolsPage() {
  return (
    <div className="h-full overflow-y-auto">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-3">
        <Link to="/" className="hover:text-[var(--accent-color)] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[var(--text-primary)]">Text Tools</span>
      </nav>
      <h1 className="text-xl font-bold mb-1">Text Diff, Sort & Transform Tools</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-4">Compare text diffs, sort/deduplicate lines, find & replace, count words, reverse text, transform case.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-4">
        <div className="lg:col-span-2">
          <TextDiffCard toolSlug="text-diff" />
        </div>
        <TextStatsCard toolSlug="text-stats" />
        <CaseTransformCard toolSlug="text-case-transform" />
        <FindReplaceCard toolSlug="find-and-replace" />
        <SortLinesCard toolSlug="sort-lines" />
        <LineNumberCard toolSlug="line-numbers" />
        <DeduplicateLinesCard toolSlug="deduplicate-lines" />
        <ReverseTextCard toolSlug="reverse-text" />
        <TextTrimmerCard toolSlug="text-trimmer" />
      </div>
    </div>
  );
}

export default TextToolsPage;
