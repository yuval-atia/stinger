/**
 * Pure JS JSONPath evaluator.
 * Supported syntax:
 *   $            root
 *   .property    dot notation
 *   ['prop']     bracket notation
 *   [0]          array index
 *   [*]          wildcard (all children)
 *   [0:5]        slice (start:end, start:end:step)
 *   ..           recursive descent
 *   [?(@.age>18)] filter expression
 *
 * Returns { matches: [{path, value}], error: string|null }
 */
export function evaluateJsonPath(data, expression) {
  try {
    const tokens = tokenize(expression);
    if (tokens.length === 0 || tokens[0] !== '$') {
      return { matches: [], error: 'Expression must start with $' };
    }

    let candidates = [{ path: [], value: data }];

    for (let i = 1; i < tokens.length; i++) {
      const token = tokens[i];

      if (token === '..') {
        // Recursive descent: collect all descendants, then apply next token
        const nextToken = tokens[i + 1];
        if (nextToken === undefined) {
          // .. at end means all descendants
          candidates = recursiveDescend(candidates);
          continue;
        }
        // Collect all descendants then filter by next token
        const descendants = recursiveDescend(candidates);
        i++; // consume next token
        candidates = applyToken(descendants, nextToken);
        continue;
      }

      candidates = applyToken(candidates, token);
    }

    const matches = candidates.map((c) => ({
      path: c.path.join('.'),
      value: c.value,
    }));

    return { matches, error: null };
  } catch (e) {
    return { matches: [], error: e.message || 'Invalid expression' };
  }
}

function applyToken(candidates, token) {
  const results = [];

  for (const { path, value } of candidates) {
    if (token === '*') {
      // Wildcard
      if (Array.isArray(value)) {
        value.forEach((item, idx) => {
          results.push({ path: [...path, idx], value: item });
        });
      } else if (value && typeof value === 'object') {
        for (const [k, v] of Object.entries(value)) {
          results.push({ path: [...path, k], value: v });
        }
      }
    } else if (typeof token === 'object' && token.type === 'slice') {
      // Array slice
      if (Array.isArray(value)) {
        const len = value.length;
        let { start, end, step } = token;
        if (start < 0) start = Math.max(0, len + start);
        if (end < 0) end = Math.max(0, len + end);
        if (end > len) end = len;
        for (let idx = start; idx < end; idx += step) {
          results.push({ path: [...path, idx], value: value[idx] });
        }
      }
    } else if (typeof token === 'object' && token.type === 'filter') {
      // Filter expression
      if (Array.isArray(value)) {
        value.forEach((item, idx) => {
          if (evaluateFilter(item, token.expr)) {
            results.push({ path: [...path, idx], value: item });
          }
        });
      } else if (value && typeof value === 'object') {
        for (const [k, v] of Object.entries(value)) {
          if (evaluateFilter(v, token.expr)) {
            results.push({ path: [...path, k], value: v });
          }
        }
      }
    } else if (typeof token === 'number') {
      // Array index
      if (Array.isArray(value) && token >= 0 && token < value.length) {
        results.push({ path: [...path, token], value: value[token] });
      }
    } else if (typeof token === 'string') {
      // Property name
      if (value && typeof value === 'object' && !Array.isArray(value) && token in value) {
        results.push({ path: [...path, token], value: value[token] });
      }
    }
  }

  return results;
}

function recursiveDescend(candidates) {
  const results = [];
  const stack = [...candidates];
  while (stack.length > 0) {
    const { path, value } = stack.pop();
    results.push({ path, value });
    if (Array.isArray(value)) {
      value.forEach((item, idx) => {
        stack.push({ path: [...path, idx], value: item });
      });
    } else if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) {
        stack.push({ path: [...path, k], value: v });
      }
    }
  }
  return results;
}

// ── Filter evaluation ────────────────────────────────────────────────────────

function evaluateFilter(item, expr) {
  // expr is like "@.age > 18" or "@.name == 'foo'"
  const match = expr.match(/^@\.(\w+)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
  if (!match) return false;

  const [, field, op, rawVal] = match;
  if (!item || typeof item !== 'object') return false;
  if (!(field in item)) return false;

  const actual = item[field];
  const expected = parseFilterValue(rawVal.trim());

  switch (op) {
    case '==': return actual === expected;
    case '!=': return actual !== expected;
    case '>':  return typeof actual === 'number' && typeof expected === 'number' && actual > expected;
    case '<':  return typeof actual === 'number' && typeof expected === 'number' && actual < expected;
    case '>=': return typeof actual === 'number' && typeof expected === 'number' && actual >= expected;
    case '<=': return typeof actual === 'number' && typeof expected === 'number' && actual <= expected;
    default: return false;
  }
}

function parseFilterValue(raw) {
  // String (single or double quoted)
  if ((raw.startsWith("'") && raw.endsWith("'")) || (raw.startsWith('"') && raw.endsWith('"'))) {
    return raw.slice(1, -1);
  }
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  if (raw === 'null') return null;
  const num = Number(raw);
  if (!isNaN(num)) return num;
  return raw;
}

// ── Tokenizer ────────────────────────────────────────────────────────────────

function tokenize(expr) {
  const tokens = [];
  let i = 0;

  while (i < expr.length) {
    const ch = expr[i];

    if (ch === '$') {
      tokens.push('$');
      i++;
    } else if (ch === '.') {
      if (expr[i + 1] === '.') {
        tokens.push('..');
        i += 2;
      } else {
        i++; // skip the dot
        // Read property name
        let name = '';
        while (i < expr.length && /[\w$]/.test(expr[i])) {
          name += expr[i];
          i++;
        }
        if (name) {
          tokens.push(name);
        }
      }
    } else if (ch === '[') {
      i++; // skip [
      // Find matching ]
      let depth = 1;
      let content = '';
      while (i < expr.length && depth > 0) {
        if (expr[i] === '[') depth++;
        else if (expr[i] === ']') depth--;
        if (depth > 0) content += expr[i];
        i++;
      }
      content = content.trim();

      if (content === '*') {
        tokens.push('*');
      } else if (content.startsWith('?')) {
        // Filter: [?(@.field op val)]
        let filterExpr = content.slice(1).trim();
        // Remove surrounding parens
        if (filterExpr.startsWith('(') && filterExpr.endsWith(')')) {
          filterExpr = filterExpr.slice(1, -1).trim();
        }
        tokens.push({ type: 'filter', expr: filterExpr });
      } else if (content.includes(':')) {
        // Slice: [start:end] or [start:end:step]
        const parts = content.split(':').map((p) => p.trim());
        const start = parts[0] === '' ? 0 : parseInt(parts[0], 10);
        const end = parts[1] === '' ? Infinity : parseInt(parts[1], 10);
        const step = parts[2] !== undefined ? parseInt(parts[2], 10) : 1;
        tokens.push({ type: 'slice', start: isNaN(start) ? 0 : start, end: isNaN(end) ? Infinity : end, step: isNaN(step) ? 1 : step });
      } else if (/^-?\d+$/.test(content)) {
        // Numeric index
        tokens.push(parseInt(content, 10));
      } else {
        // Quoted or unquoted property name
        let name = content;
        if ((name.startsWith("'") && name.endsWith("'")) || (name.startsWith('"') && name.endsWith('"'))) {
          name = name.slice(1, -1);
        }
        tokens.push(name);
      }
    } else {
      // Skip whitespace or unexpected chars
      i++;
    }
  }

  return tokens;
}
