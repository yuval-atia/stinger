// ── Pure JS Markdown → HTML converter ────────────────────────────────────────
// Supports: headings, bold, italic, strikethrough, inline code, code blocks,
// links, images, unordered/ordered lists, blockquotes, horizontal rules, paragraphs.

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseInline(text) {
  let result = escapeHtml(text);

  // Code spans (backtick) — must be first to prevent inner parsing
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Images ![alt](url)
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" />');

  // Links [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Bold + italic ***text*** or ___text___
  result = result.replace(/\*{3}(.+?)\*{3}/g, '<strong><em>$1</em></strong>');
  result = result.replace(/_{3}(.+?)_{3}/g, '<strong><em>$1</em></strong>');

  // Bold **text** or __text__
  result = result.replace(/\*{2}(.+?)\*{2}/g, '<strong>$1</strong>');
  result = result.replace(/_{2}(.+?)_{2}/g, '<strong>$1</strong>');

  // Italic *text* or _text_
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
  result = result.replace(/(^|[\s(])_(.+?)_([\s).,!?]|$)/g, '$1<em>$2</em>$3');

  // Strikethrough ~~text~~
  result = result.replace(/~~(.+?)~~/g, '<del>$1</del>');

  return result;
}

export function markdownToHtml(md) {
  if (!md) return '';

  const lines = md.split('\n');
  const html = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code blocks ```
    if (line.trimStart().startsWith('```')) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(escapeHtml(lines[i]));
        i++;
      }
      i++; // skip closing ```
      html.push(`<pre><code>${codeLines.join('\n')}</code></pre>`);
      continue;
    }

    // Blank line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      html.push(`<h${level}>${parseInline(headingMatch[2])}</h${level}>`);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(line.trim())) {
      html.push('<hr />');
      i++;
      continue;
    }

    // Blockquote
    if (line.trimStart().startsWith('> ')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trimStart().startsWith('> ')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      html.push(`<blockquote>${quoteLines.map(l => parseInline(l)).join('<br />')}</blockquote>`);
      continue;
    }

    // Unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ''));
        i++;
      }
      html.push('<ul>' + items.map(item => `<li>${parseInline(item)}</li>`).join('') + '</ul>');
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      html.push('<ol>' + items.map(item => `<li>${parseInline(item)}</li>`).join('') + '</ol>');
      continue;
    }

    // Paragraph — collect consecutive non-empty, non-special lines
    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].match(/^#{1,6}\s/) &&
      !lines[i].trimStart().startsWith('```') &&
      !lines[i].trimStart().startsWith('> ') &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !/^(\*{3,}|-{3,}|_{3,})\s*$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      html.push(`<p>${paraLines.map(l => parseInline(l)).join('<br />')}</p>`);
    }
  }

  return html.join('\n');
}
