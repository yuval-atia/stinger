import { getValueType, getPreview } from './jsonParser.js';

/**
 * Flatten a JSON tree into a flat array of visible nodes.
 * Only expanded nodes have their children included.
 */
export function flattenTree(data, expandedPaths, options = {}) {
  const result = [];
  const { matches, filterMode, searchQuery, diffMap, side } = options;

  function walk(value, path, keyName, isRoot) {
    const pathStr = path.join('.');
    const valueType = getValueType(value);
    const isExpandable = valueType === 'object' || valueType === 'array';
    const isExpanded = isRoot || (expandedPaths?.has(pathStr) ?? false);
    const childCount = isExpandable
      ? (valueType === 'array' ? value.length : Object.keys(value).length)
      : 0;

    result.push({
      path,
      pathStr,
      keyName,
      value,
      depth: path.length,
      valueType,
      isExpandable,
      isExpanded,
      childCount,
      isRoot,
      preview: isExpandable ? getPreview(value) : null,
    });

    if (isExpandable && isExpanded) {
      const entries = valueType === 'array'
        ? value.map((v, i) => [i, v])
        : Object.entries(value);

      const filteredEntries = filterMode && searchQuery && matches?.size > 0
        ? entries.filter(([key]) => {
            const childPath = [...path, key];
            return childHasMatch(childPath, matches);
          })
        : entries;

      for (const [key, val] of filteredEntries) {
        walk(val, [...path, key], key, false);
      }
    }
  }

  walk(data, [], null, true);
  return result;
}

function childHasMatch(childPath, matches) {
  if (!matches) return false;
  const childPathStr = childPath.join('.');
  for (const matchPath of matches) {
    if (matchPath === childPathStr || matchPath.startsWith(childPathStr + '.')) {
      return true;
    }
  }
  return false;
}

/**
 * Build a path-to-index map for O(1) lookup.
 */
export function buildPathIndex(flatNodes) {
  const index = new Map();
  for (let i = 0; i < flatNodes.length; i++) {
    index.set(flatNodes[i].pathStr, i);
  }
  return index;
}
