import { getValueType } from './jsonParser';

/**
 * Infer the current depth level from expandedPaths.
 * Returns 1, 2, 3, "all", or 0 (collapsed).
 */
export function inferDepthFromPaths(parsedData, expandedPaths) {
  if (!parsedData || expandedPaths.size === 0) return 0;

  // Collect all expandable paths at each depth level
  const pathsByDepth = [new Set()]; // depth 0 = root-level containers
  const allPaths = new Set();

  function walk(value, path, depth) {
    const type = getValueType(value);
    if (type !== 'object' && type !== 'array') return;

    const pathStr = path.join('.');
    allPaths.add(pathStr);

    while (pathsByDepth.length <= depth) pathsByDepth.push(new Set());
    pathsByDepth[depth].add(pathStr);

    const entries = type === 'array'
      ? value.map((v, i) => [i, v])
      : Object.entries(value);
    for (const [k, v] of entries) {
      walk(v, [...path, k], depth + 1);
    }
  }

  walk(parsedData, [], 0);

  // Check if ALL expandable paths are expanded → "all"
  if (allPaths.size > 0 && [...allPaths].every((p) => expandedPaths.has(p))) {
    return 'all';
  }

  // Check depth levels 3, 2, 1 — find the highest depth where
  // all paths up to that depth are expanded
  for (let d = Math.min(3, pathsByDepth.length - 1); d >= 1; d--) {
    let allExpanded = true;
    for (let i = 0; i <= d - 1; i++) {
      for (const p of pathsByDepth[i]) {
        if (!expandedPaths.has(p)) {
          allExpanded = false;
          break;
        }
      }
      if (!allExpanded) break;
    }
    // Also check that not all paths at depth d are expanded (to distinguish d from d+1)
    if (allExpanded) {
      return d;
    }
  }

  return 0;
}
