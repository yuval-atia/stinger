export function generateMarkdownTable(headers, rows, alignments) {
  if (!headers.length) return '';

  const escape = (s) => s.replace(/\|/g, '\\|');

  const headerRow = '| ' + headers.map(h => escape(h || ' ')).join(' | ') + ' |';

  const separatorRow = '| ' + headers.map((_, i) => {
    const align = alignments?.[i] || 'left';
    if (align === 'center') return ':---:';
    if (align === 'right') return '---:';
    return '---';
  }).join(' | ') + ' |';

  const dataRows = rows.map(row =>
    '| ' + headers.map((_, i) => escape(row[i] || ' ')).join(' | ') + ' |'
  );

  return [headerRow, separatorRow, ...dataRows].join('\n');
}
