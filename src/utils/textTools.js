// ── Text tool utilities ──────────────────────────────────────────────────────

export function computeTextStats(text) {
  if (!text) {
    return { words: 0, characters: 0, charactersNoSpaces: 0, lines: 0, sentences: 0, paragraphs: 0, readingTime: '0 sec' };
  }

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const lines = text.split('\n').length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentences = text.trim() ? (text.match(/[.!?]+(?:\s|$)/g) || []).length || (words > 0 ? 1 : 0) : 0;
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length || (text.trim() ? 1 : 0) : 0;

  const minutes = Math.floor(words / 200);
  const seconds = Math.round((words % 200) / 200 * 60);
  const readingTime = minutes > 0 ? `${minutes} min ${seconds} sec` : `${seconds} sec`;

  return { words, characters, charactersNoSpaces, lines, sentences, paragraphs, readingTime };
}

export function findAndReplace(text, find, replace, caseSensitive = true) {
  if (!find) return { result: text, count: 0 };

  const escaped = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const flags = caseSensitive ? 'g' : 'gi';
  const regex = new RegExp(escaped, flags);

  let count = 0;
  const result = text.replace(regex, (match) => {
    count++;
    return replace;
  });

  return { result, count };
}

export function sortLines(text, { ascending = true, caseSensitive = true, removeDuplicates = false } = {}) {
  if (!text) return '';

  let lines = text.split('\n');

  if (removeDuplicates) {
    const seen = new Set();
    lines = lines.filter(line => {
      const key = caseSensitive ? line : line.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  lines.sort((a, b) => {
    const valA = caseSensitive ? a : a.toLowerCase();
    const valB = caseSensitive ? b : b.toLowerCase();
    if (valA < valB) return ascending ? -1 : 1;
    if (valA > valB) return ascending ? 1 : -1;
    return 0;
  });

  return lines.join('\n');
}

export function deduplicateLines(text) {
  if (!text) return { result: '', removedCount: 0 };

  const lines = text.split('\n');
  const seen = new Set();
  const unique = [];

  for (const line of lines) {
    if (!seen.has(line)) {
      seen.add(line);
      unique.push(line);
    }
  }

  return { result: unique.join('\n'), removedCount: lines.length - unique.length };
}

export function reverseText(text, mode = 'characters') {
  if (!text) return '';

  switch (mode) {
    case 'characters':
      return [...text].reverse().join('');
    case 'words':
      return text.split(/(\s+)/).reverse().join('');
    case 'lines':
      return text.split('\n').reverse().join('\n');
    default:
      return text;
  }
}

export function trimText(text, { trimLines = true, collapseSpaces = true, trimEdges = true } = {}) {
  if (!text) return '';

  let result = text;

  if (trimLines) {
    result = result.split('\n').map(line => line.trim()).join('\n');
  }

  if (collapseSpaces) {
    result = result.split('\n').map(line => line.replace(/ {2,}/g, ' ')).join('\n');
  }

  if (trimEdges) {
    result = result.trim();
  }

  return result;
}
