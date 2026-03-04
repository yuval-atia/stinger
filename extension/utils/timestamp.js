// ── Timestamp Converter ──────────────────────────────────────────────────────

function unixToDate(timestamp) {
  try {
    const ts = Number(timestamp);
    if (isNaN(ts)) return { error: 'Invalid timestamp' };

    // Auto-detect seconds vs milliseconds (if > year 3000 in seconds, it's ms)
    const ms = ts > 99999999999 ? ts : ts * 1000;
    const date = new Date(ms);

    if (isNaN(date.getTime())) return { error: 'Invalid timestamp' };

    return {
      iso: date.toISOString(),
      utc: date.toUTCString(),
      local: date.toLocaleString(),
      relative: getRelativeTime(date),
      error: null,
    };
  } catch {
    return { error: 'Invalid timestamp' };
  }
}

function dateToUnix(dateStr) {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return { error: 'Invalid date string' };

    return {
      seconds: Math.floor(date.getTime() / 1000),
      milliseconds: date.getTime(),
      error: null,
    };
  } catch {
    return { error: 'Invalid date string' };
  }
}

function getNow() {
  const now = new Date();
  return {
    seconds: Math.floor(now.getTime() / 1000),
    milliseconds: now.getTime(),
    iso: now.toISOString(),
    utc: now.toUTCString(),
    local: now.toLocaleString(),
  };
}

function getRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const absDiff = Math.abs(diffMs);
  const isPast = diffMs > 0;

  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const years = Math.floor(days / 365);

  let str;
  if (seconds < 60) str = seconds + 's';
  else if (minutes < 60) str = minutes + 'm';
  else if (hours < 24) str = hours + 'h';
  else if (days < 365) str = days + 'd';
  else str = years + 'y';

  return isPast ? str + ' ago' : 'in ' + str;
}
