/**
 * Compare N JSON objects and return a flat list of differences.
 * Each row = one unique path where at least one value differs.
 */
export function multiCompare(jsonObjects, { showAll = false } = {}) {
  const n = jsonObjects.length;
  if (n < 2) return [];

  // Collect all leaf paths from all objects (skip null/undefined inputs)
  const allPaths = new Map(); // pathStr -> { path: string[], values: any[] }

  for (let i = 0; i < n; i++) {
    if (jsonObjects[i] === null || jsonObjects[i] === undefined) continue;
    walkPaths(jsonObjects[i], [], (path, value) => {
      const pathStr = pathToStr(path);
      if (!allPaths.has(pathStr)) {
        allPaths.set(pathStr, { path: [...path], values: new Array(n).fill(MISSING) });
      }
      allPaths.get(pathStr).values[i] = value;
    });
  }

  // Determine which inputs are valid (non-null)
  const validIndices = [];
  for (let i = 0; i < n; i++) {
    if (jsonObjects[i] !== null && jsonObjects[i] !== undefined) validIndices.push(i);
  }

  const rows = [];
  for (const [pathStr, { path, values }] of allPaths) {
    const validValues = validIndices.map((i) => values[i]);
    const same = allSame(validValues);
    if (showAll || !same) {
      rows.push({ pathStr, path, values, same, diffType: classifyDiff(values, validIndices) });
    }
  }

  // Sort: group by parent path, then by key within group
  rows.sort((a, b) => {
    // Compare path segments one by one for natural grouping
    const minLen = Math.min(a.path.length, b.path.length);
    for (let i = 0; i < minLen; i++) {
      const aIsNum = /^\d+$/.test(a.path[i]);
      const bIsNum = /^\d+$/.test(b.path[i]);
      if (aIsNum && bIsNum) {
        const diff = parseInt(a.path[i]) - parseInt(b.path[i]);
        if (diff !== 0) return diff;
      } else if (aIsNum !== bIsNum) {
        return aIsNum ? 1 : -1;
      } else {
        const cmp = a.path[i].localeCompare(b.path[i]);
        if (cmp !== 0) return cmp;
      }
    }
    return a.path.length - b.path.length;
  });

  return rows;
}

export const MISSING = Symbol('MISSING');

/** Classify what kind of diff this row represents */
function classifyDiff(values, validIndices) {
  const presentIndices = validIndices.filter((i) => values[i] !== MISSING);
  if (presentIndices.length === 0) return 'equal';
  if (presentIndices.length < validIndices.length) {
    // Some inputs have this path, some don't
    if (presentIndices.length === validIndices.length - 1) {
      // Only one is different - determine direction
      const missingIdx = validIndices.find((i) => values[i] === MISSING);
      return missingIdx === validIndices[0] ? 'added' : missingIdx === validIndices[validIndices.length - 1] ? 'removed' : 'missing';
    }
    return 'missing'; // generic "not present in all"
  }
  // All present - check types
  const types = presentIndices.map((i) => typeof values[i]);
  const allSameType = types.every((t) => t === types[0]);
  if (!allSameType) return 'type_changed';
  return 'changed';
}

function allSame(values) {
  const first = values[0];
  for (let i = 1; i < values.length; i++) {
    if (!deepEqual(first, values[i])) return false;
  }
  return true;
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (a === MISSING || b === MISSING) return false;
  if (a === null || b === null) return a === b;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return a === b;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!(key in b)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

/** Convert path array to display string with bracket notation for array indices */
export function pathToStr(path) {
  if (path.length === 0) return '(root)';
  let result = path[0];
  for (let i = 1; i < path.length; i++) {
    if (/^\d+$/.test(path[i])) {
      result += `[${path[i]}]`;
    } else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(path[i])) {
      result += `.${path[i]}`;
    } else {
      result += `["${path[i]}"]`;
    }
  }
  return result;
}

function walkPaths(value, path, callback) {
  if (value === null || typeof value !== 'object') {
    callback(path, value);
    return;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      callback(path, value);
      return;
    }
    for (let i = 0; i < value.length; i++) {
      walkPaths(value[i], [...path, String(i)], callback);
    }
    return;
  }

  const keys = Object.keys(value);
  if (keys.length === 0) {
    callback(path, value);
    return;
  }
  for (const key of keys) {
    walkPaths(value[key], [...path, key], callback);
  }
}

export function formatValue(value) {
  if (value === MISSING) return undefined;
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export function getTypeLabel(value) {
  if (value === MISSING) return '';
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

/** Get summary stats from diff rows */
export function getDiffStats(rows) {
  let added = 0, removed = 0, changed = 0, typeChanged = 0, missing = 0;
  for (const row of rows) {
    if (row.same) continue;
    switch (row.diffType) {
      case 'added': added++; break;
      case 'removed': removed++; break;
      case 'type_changed': typeChanged++; break;
      case 'missing': missing++; break;
      default: changed++; break;
    }
  }
  return { added, removed, changed, typeChanged, missing, total: rows.filter(r => !r.same).length };
}
