// ── Cron expression parser ───────────────────────────────────────────────────
// Supports standard 5-field cron: minute hour day-of-month month day-of-week

const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function parseField(field, min, max) {
  const values = new Set();
  for (const part of field.split(',')) {
    const stepMatch = part.match(/^(.+)\/(\d+)$/);
    let range = stepMatch ? stepMatch[1] : part;
    const step = stepMatch ? parseInt(stepMatch[2], 10) : 1;

    if (range === '*') {
      for (let i = min; i <= max; i += step) values.add(i);
    } else if (range.includes('-')) {
      const [a, b] = range.split('-').map(Number);
      for (let i = a; i <= b; i += step) values.add(i);
    } else {
      values.add(parseInt(range, 10));
    }
  }
  return [...values].sort((a, b) => a - b);
}

export function describeCron(expr) {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return 'Invalid cron expression (expected 5 fields)';

  const [minF, hourF, domF, monF, dowF] = parts;
  const pieces = [];

  // Minutes
  if (minF === '*') {
    pieces.push('every minute');
  } else if (minF.startsWith('*/')) {
    pieces.push(`every ${minF.slice(2)} minutes`);
  } else {
    pieces.push(`at minute ${minF}`);
  }

  // Hours
  if (hourF === '*') {
    // nothing
  } else if (hourF.startsWith('*/')) {
    pieces.push(`every ${hourF.slice(2)} hours`);
  } else {
    const hours = hourF.split(',');
    const formatted = hours.map(h => {
      const n = parseInt(h, 10);
      return n === 0 ? '12 AM' : n < 12 ? `${n} AM` : n === 12 ? '12 PM' : `${n - 12} PM`;
    });
    pieces.push(`past hour ${formatted.join(', ')}`);
  }

  // Day of month
  if (domF !== '*') {
    if (domF.startsWith('*/')) {
      pieces.push(`every ${domF.slice(2)} days`);
    } else {
      pieces.push(`on day ${domF} of the month`);
    }
  }

  // Month
  if (monF !== '*') {
    if (monF.startsWith('*/')) {
      pieces.push(`every ${monF.slice(2)} months`);
    } else {
      const months = monF.split(',').map(m => MONTH_NAMES[parseInt(m, 10)] || m);
      pieces.push(`in ${months.join(', ')}`);
    }
  }

  // Day of week
  if (dowF !== '*') {
    const days = dowF.split(',').map(d => DAY_NAMES[parseInt(d, 10)] || d);
    pieces.push(`on ${days.join(', ')}`);
  }

  const desc = pieces.join(', ');
  return desc.charAt(0).toUpperCase() + desc.slice(1);
}

export function getNextRuns(expr, count = 5) {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return [];

  const minutes = parseField(parts[0], 0, 59);
  const hours = parseField(parts[1], 0, 23);
  const doms = parseField(parts[2], 1, 31);
  const months = parseField(parts[3], 1, 12);
  const dows = parseField(parts[4], 0, 6);

  const domWild = parts[2] === '*';
  const dowWild = parts[4] === '*';

  const results = [];
  const now = new Date();
  const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 0, 0);

  let safety = 0;
  while (results.length < count && safety < 525960) { // max ~1 year of minutes
    safety++;
    const mon = candidate.getMonth() + 1;
    const dom = candidate.getDate();
    const dow = candidate.getDay();
    const hour = candidate.getHours();
    const min = candidate.getMinutes();

    if (!months.includes(mon)) {
      candidate.setMonth(candidate.getMonth() + 1, 1);
      candidate.setHours(0, 0, 0, 0);
      continue;
    }
    if (!hours.includes(hour)) {
      candidate.setHours(candidate.getHours() + 1, 0, 0, 0);
      continue;
    }
    if (!minutes.includes(min)) {
      candidate.setMinutes(candidate.getMinutes() + 1, 0, 0);
      continue;
    }

    // DOM and DOW matching
    const domMatch = domWild || doms.includes(dom);
    const dowMatch = dowWild || dows.includes(dow);
    const dayMatch = (domWild && dowWild) ? true : (domWild ? dowMatch : (dowWild ? domMatch : (domMatch || dowMatch)));

    if (!dayMatch) {
      candidate.setDate(candidate.getDate() + 1);
      candidate.setHours(0, 0, 0, 0);
      continue;
    }

    results.push(new Date(candidate));
    candidate.setMinutes(candidate.getMinutes() + 1, 0, 0);
  }

  return results;
}
