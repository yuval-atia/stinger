// Lightweight JSON<->YAML converter (no external dependency)

// ── JSON to YAML ────────────────────────────────────────────────────────────

export function jsonToYaml(value, indent = 0) {
  if (value === null) return 'null';
  if (value === undefined) return 'null';

  const type = typeof value;
  if (type === 'boolean') return value ? 'true' : 'false';
  if (type === 'number') return String(value);
  if (type === 'string') return yamlString(value);

  const pad = '  '.repeat(indent);

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return value
      .map((item) => {
        const v = jsonToYaml(item, indent + 1);
        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
          // Object items: put first key on same line as dash
          const lines = v.split('\n');
          return `${pad}- ${lines[0]}\n${lines.slice(1).map((l) => `${pad}  ${l}`).join('\n')}`.trimEnd();
        }
        return `${pad}- ${v}`;
      })
      .join('\n');
  }

  if (type === 'object') {
    const entries = Object.entries(value);
    if (entries.length === 0) return '{}';
    return entries
      .map(([key, val]) => {
        const k = /^[\w.-]+$/.test(key) ? key : JSON.stringify(key);
        if (typeof val === 'object' && val !== null) {
          const child = jsonToYaml(val, indent + 1);
          return `${k}:\n${child.split('\n').map((l) => `${pad}  ${l}`).join('\n')}`;
        }
        return `${k}: ${jsonToYaml(val, indent)}`;
      })
      .join('\n');
  }

  return String(value);
}

function yamlString(s) {
  if (s === '') return "''";
  if (/[\n\r]/.test(s)) {
    // Use literal block scalar for multiline
    const lines = s.split('\n');
    return '|\n' + lines.map((l) => '  ' + l).join('\n');
  }
  // Quote if it looks like a YAML special value or contains special chars
  if (
    /^(true|false|null|yes|no|on|off|~)$/i.test(s) ||
    /^[0-9]/.test(s) ||
    /[:#{}[\],&*?|>!%@`]/.test(s)
  ) {
    return JSON.stringify(s);
  }
  return s;
}

// ── YAML to JSON ────────────────────────────────────────────────────────────

export function yamlToJson(text) {
  const lines = text.split('\n');
  const result = parseYamlLines(lines, 0, 0);
  return result.value;
}

function parseYamlLines(lines, startIdx, baseIndent) {
  // Determine if we have a mapping or a sequence
  let i = startIdx;
  while (i < lines.length && isEmptyOrComment(lines[i])) i++;
  if (i >= lines.length) return { value: null, nextIdx: i };

  const firstLine = lines[i];
  const trimmed = firstLine.trimStart();

  if (trimmed.startsWith('- ') || trimmed === '-') {
    return parseSequence(lines, i, getIndent(firstLine));
  }
  if (trimmed.includes(':')) {
    return parseMapping(lines, i, getIndent(firstLine));
  }
  // Scalar
  return { value: parseScalar(trimmed), nextIdx: i + 1 };
}

function parseMapping(lines, startIdx, baseIndent) {
  const obj = {};
  let i = startIdx;

  while (i < lines.length) {
    if (isEmptyOrComment(lines[i])) { i++; continue; }
    const indent = getIndent(lines[i]);
    if (indent < baseIndent) break;
    if (indent > baseIndent) break;

    const trimmed = lines[i].trimStart();
    const colonIdx = findMappingColon(trimmed);
    if (colonIdx === -1) break;

    const key = trimmed.slice(0, colonIdx).trim().replace(/^["']|["']$/g, '');
    const rest = trimmed.slice(colonIdx + 1).trim();

    if (rest === '' || rest === '|' || rest === '>') {
      // Block scalar or nested structure
      if (rest === '|' || rest === '>') {
        i++;
        let blockLines = [];
        while (i < lines.length) {
          if (isEmptyOrComment(lines[i]) && lines[i].trim() === '') {
            blockLines.push('');
            i++;
            continue;
          }
          if (getIndent(lines[i]) <= baseIndent) break;
          blockLines.push(lines[i].trimStart());
          i++;
        }
        // Trim trailing empty lines
        while (blockLines.length && blockLines[blockLines.length - 1] === '') blockLines.pop();
        obj[key] = rest === '|' ? blockLines.join('\n') : blockLines.join(' ');
      } else {
        i++;
        // Find child indent
        let childStart = i;
        while (childStart < lines.length && isEmptyOrComment(lines[childStart])) childStart++;
        if (childStart >= lines.length || getIndent(lines[childStart]) <= baseIndent) {
          obj[key] = null;
        } else {
          const result = parseYamlLines(lines, childStart, getIndent(lines[childStart]));
          obj[key] = result.value;
          i = result.nextIdx;
        }
      }
    } else {
      obj[key] = parseScalar(rest);
      i++;
    }
  }

  return { value: obj, nextIdx: i };
}

function parseSequence(lines, startIdx, baseIndent) {
  const arr = [];
  let i = startIdx;

  while (i < lines.length) {
    if (isEmptyOrComment(lines[i])) { i++; continue; }
    const indent = getIndent(lines[i]);
    if (indent < baseIndent) break;
    if (indent > baseIndent) break;

    const trimmed = lines[i].trimStart();
    if (!trimmed.startsWith('-')) break;

    const rest = trimmed.slice(1).trim();
    if (rest === '') {
      i++;
      let childStart = i;
      while (childStart < lines.length && isEmptyOrComment(lines[childStart])) childStart++;
      if (childStart >= lines.length || getIndent(lines[childStart]) <= baseIndent) {
        arr.push(null);
      } else {
        const result = parseYamlLines(lines, childStart, getIndent(lines[childStart]));
        arr.push(result.value);
        i = result.nextIdx;
      }
    } else if (findMappingColon(rest) !== -1) {
      // Inline mapping starting on the dash line
      // Gather all lines that belong to this item
      const itemLines = [' '.repeat(indent + 2) + rest];
      const itemIndent = indent + 2;
      let j = i + 1;
      while (j < lines.length) {
        if (isEmptyOrComment(lines[j])) { itemLines.push(lines[j]); j++; continue; }
        if (getIndent(lines[j]) < itemIndent) break;
        itemLines.push(lines[j]);
        j++;
      }
      const result = parseMapping(itemLines, 0, itemIndent);
      arr.push(result.value);
      i = j;
    } else {
      arr.push(parseScalar(rest));
      i++;
    }
  }

  return { value: arr, nextIdx: i };
}

function parseScalar(s) {
  if (!s || s === '~' || s === 'null' || s === 'Null' || s === 'NULL') return null;
  if (s === 'true' || s === 'True' || s === 'TRUE' || s === 'yes' || s === 'Yes') return true;
  if (s === 'false' || s === 'False' || s === 'FALSE' || s === 'no' || s === 'No') return false;

  // Quoted string
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }

  // Flow-style array/object
  if (s.startsWith('[') && s.endsWith(']')) {
    try { return JSON.parse(s); } catch { return s; }
  }
  if (s.startsWith('{') && s.endsWith('}')) {
    try { return JSON.parse(s); } catch { return s; }
  }

  // Number
  if (/^-?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?$/.test(s)) {
    const n = Number(s);
    if (!isNaN(n)) return n;
  }

  // Strip inline comment
  const commentIdx = s.indexOf(' #');
  if (commentIdx !== -1) return parseScalar(s.slice(0, commentIdx).trim());

  return s;
}

function getIndent(line) {
  const match = line.match(/^(\s*)/);
  return match ? match[1].length : 0;
}

function isEmptyOrComment(line) {
  const trimmed = line.trim();
  return trimmed === '' || trimmed.startsWith('#');
}

function findMappingColon(s) {
  // Find the first ': ' or trailing ':' that's not inside quotes
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === "'" && !inDouble) inSingle = !inSingle;
    if (ch === '"' && !inSingle) inDouble = !inDouble;
    if (ch === ':' && !inSingle && !inDouble) {
      if (i === s.length - 1 || s[i + 1] === ' ') return i;
    }
  }
  return -1;
}
