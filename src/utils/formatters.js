// ── JSON Formatter / Minifier ────────────────────────────────────────────────

export function formatJSON(json) {
  try {
    const parsed = JSON.parse(json);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return 'Error: Invalid JSON';
  }
}

export function minifyJSON(json) {
  try {
    const parsed = JSON.parse(json);
    return JSON.stringify(parsed);
  } catch {
    return 'Error: Invalid JSON';
  }
}

// ── SQL Formatter / Minifier ─────────────────────────────────────────────────

const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'INSERT', 'INTO', 'VALUES',
  'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'JOIN',
  'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS', 'ON', 'AS',
  'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL',
  'DISTINCT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'NOT', 'NULL',
  'IS', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'ASC', 'DESC',
];

const SQL_MAJOR_KEYWORDS = new Set([
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
  'FULL', 'CROSS', 'ON', 'ORDER', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET',
  'UNION', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
  'CREATE', 'ALTER', 'DROP', 'AND', 'OR',
]);

export function formatSQL(sql) {
  // Normalize whitespace
  let formatted = sql.replace(/\s+/g, ' ').trim();

  // Add newlines before major keywords
  for (const kw of SQL_MAJOR_KEYWORDS) {
    const regex = new RegExp(`\\b(${kw})\\b`, 'gi');
    formatted = formatted.replace(regex, '\n$1');
  }

  // Indent non-major lines
  const lines = formatted.split('\n').filter(l => l.trim());
  const result = [];
  for (const line of lines) {
    const trimmed = line.trim();
    const firstWord = trimmed.split(/\s/)[0].toUpperCase();
    if (['AND', 'OR', 'ON', 'SET'].includes(firstWord)) {
      result.push('  ' + trimmed);
    } else if (['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
      'FULL', 'CROSS', 'ORDER', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET',
      'UNION', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP'].includes(firstWord)) {
      result.push(trimmed);
    } else {
      result.push('  ' + trimmed);
    }
  }

  return result.join('\n');
}

export function minifySQL(sql) {
  return sql.replace(/\s+/g, ' ').replace(/\s*([(),;])\s*/g, '$1').trim();
}

// ── XML Formatter / Minifier ─────────────────────────────────────────────────

export function formatXML(xml) {
  let formatted = '';
  let indent = 0;
  const pad = (n) => '  '.repeat(n);

  // Split by tags
  const tokens = xml.replace(/>\s*</g, '><').split(/(<[^>]+>)/g).filter(Boolean);

  for (const token of tokens) {
    if (token.startsWith('</')) {
      // Closing tag
      indent = Math.max(indent - 1, 0);
      formatted += pad(indent) + token + '\n';
    } else if (token.startsWith('<') && token.endsWith('/>')) {
      // Self-closing tag
      formatted += pad(indent) + token + '\n';
    } else if (token.startsWith('<?') || token.startsWith('<!')) {
      // Declaration / comment
      formatted += pad(indent) + token + '\n';
    } else if (token.startsWith('<')) {
      // Opening tag
      formatted += pad(indent) + token + '\n';
      indent++;
    } else {
      // Text content
      const trimmed = token.trim();
      if (trimmed) {
        formatted += pad(indent) + trimmed + '\n';
      }
    }
  }

  return formatted.trimEnd();
}

export function minifyXML(xml) {
  return xml.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
}

// ── CSS Formatter / Minifier ─────────────────────────────────────────────────

export function formatCSS(css) {
  let formatted = css
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Opening brace
    .replace(/\s*\{\s*/g, ' {\n  ')
    // Closing brace
    .replace(/\s*\}\s*/g, '\n}\n\n')
    // Semicolons
    .replace(/;\s*/g, ';\n  ')
    // Clean up trailing spaces before closing brace
    .replace(/\s+\}/g, '\n}')
    // Remove trailing whitespace on lines
    .replace(/[ \t]+\n/g, '\n')
    // Remove excessive blank lines
    .replace(/\n{3,}/g, '\n\n');

  return formatted.trim();
}

export function minifyCSS(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

// ── HTML Formatter / Minifier ────────────────────────────────────────────────

const HTML_VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

export function formatHTML(html) {
  let formatted = '';
  let indent = 0;
  const pad = (n) => '  '.repeat(n);

  // Collapse whitespace between tags
  const normalized = html.replace(/>\s+</g, '><').trim();
  const tokens = normalized.split(/(<[^>]+>)/g).filter(Boolean);

  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('</')) {
      // Closing tag
      indent = Math.max(indent - 1, 0);
      formatted += pad(indent) + trimmed + '\n';
    } else if (trimmed.startsWith('<!') || trimmed.startsWith('<?')) {
      // Doctype, comment, processing instruction
      formatted += pad(indent) + trimmed + '\n';
    } else if (trimmed.startsWith('<')) {
      formatted += pad(indent) + trimmed + '\n';
      // Check if void element or self-closing
      const tagName = trimmed.match(/^<(\w+)/)?.[1]?.toLowerCase();
      if (!HTML_VOID_ELEMENTS.has(tagName) && !trimmed.endsWith('/>')) {
        indent++;
      }
    } else {
      // Text node
      formatted += pad(indent) + trimmed + '\n';
    }
  }

  return formatted.trimEnd();
}

export function minifyHTML(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ')
    .trim();
}
