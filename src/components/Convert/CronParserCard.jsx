import { useState, useMemo } from 'react';
import ToolCard from '../common/ToolCard';
import { describeCron, getNextRuns } from '../../utils/cron';

function CronParserCard() {
  const [input, setInput] = useState('*/5 * * * *');

  const description = useMemo(() => describeCron(input), [input]);
  const nextRuns = useMemo(() => {
    try {
      return getNextRuns(input, 5);
    } catch {
      return [];
    }
  }, [input]);

  return (
    <ToolCard title="Cron Parser" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4 1.75a.75.75 0 0 1 1.5 0V3h5V1.75a.75.75 0 0 1 1.5 0V3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2V1.75ZM4.5 6a1 1 0 0 0-1 1v4.5a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-7Z" clipRule="evenodd" /></svg>} info={{
      what: 'Parses standard 5-field cron expressions into a human-readable description and calculates the next 5 scheduled run times.',
      how: 'Splits the expression into minute/hour/day/month/weekday fields, expands ranges and steps, then iterates forward in time to find matching dates.',
      usedFor: 'Debugging cron schedules, verifying CI/CD pipeline timing, setting up monitoring alerts, and documenting recurring job configurations.',
    }}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="*/5 * * * *"
        className="w-full px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
      />
      <div className="text-xs text-[var(--text-secondary)]">
        <span className="font-mono">minute hour day-of-month month day-of-week</span>
      </div>
      <div className="bg-[var(--bg-secondary)] rounded border border-[var(--border-color)] px-3 py-2">
        <div className="text-xs font-medium text-[var(--text-primary)] mb-1">Description</div>
        <div className="text-xs text-[var(--text-secondary)]">{description}</div>
      </div>
      {nextRuns.length > 0 && (
        <div className="bg-[var(--bg-secondary)] rounded border border-[var(--border-color)] px-3 py-2">
          <div className="text-xs font-medium text-[var(--text-primary)] mb-1">Next 5 runs</div>
          <div className="space-y-1">
            {nextRuns.map((date, i) => (
              <div key={i} className="text-xs font-mono text-[var(--text-secondary)]">
                {date.toLocaleString()}
              </div>
            ))}
          </div>
        </div>
      )}
    </ToolCard>
  );
}

export default CronParserCard;
