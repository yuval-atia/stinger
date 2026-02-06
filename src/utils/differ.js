/**
 * Compare two JSON values and return diff information
 */
export function diffJson(left, right, path = []) {
  const diffs = [];

  const leftType = getType(left);
  const rightType = getType(right);

  // If types are different
  if (leftType !== rightType) {
    diffs.push({
      type: 'changed',
      path: [...path],
      leftValue: left,
      rightValue: right,
      leftType,
      rightType,
    });
    return diffs;
  }

  // Handle primitives and null
  if (leftType !== 'object' && leftType !== 'array') {
    if (left !== right) {
      diffs.push({
        type: 'changed',
        path: [...path],
        leftValue: left,
        rightValue: right,
        leftType,
        rightType,
      });
    }
    return diffs;
  }

  // Handle arrays
  if (leftType === 'array') {
    const maxLen = Math.max(left.length, right.length);
    for (let i = 0; i < maxLen; i++) {
      if (i >= left.length) {
        diffs.push({
          type: 'added',
          path: [...path, i],
          rightValue: right[i],
          rightType: getType(right[i]),
        });
      } else if (i >= right.length) {
        diffs.push({
          type: 'removed',
          path: [...path, i],
          leftValue: left[i],
          leftType: getType(left[i]),
        });
      } else {
        diffs.push(...diffJson(left[i], right[i], [...path, i]));
      }
    }
    return diffs;
  }

  // Handle objects
  const allKeys = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const key of allKeys) {
    const hasLeft = key in left;
    const hasRight = key in right;

    if (!hasLeft) {
      diffs.push({
        type: 'added',
        path: [...path, key],
        rightValue: right[key],
        rightType: getType(right[key]),
      });
    } else if (!hasRight) {
      diffs.push({
        type: 'removed',
        path: [...path, key],
        leftValue: left[key],
        leftType: getType(left[key]),
      });
    } else {
      diffs.push(...diffJson(left[key], right[key], [...path, key]));
    }
  }

  return diffs;
}

function getType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

/**
 * Create a map of paths to diff types for quick lookup
 */
export function createDiffMap(diffs) {
  const map = new Map();
  for (const diff of diffs) {
    const pathStr = diff.path.join('.');
    map.set(pathStr, diff);
  }
  return map;
}

/**
 * Check if a path has any diffs (including children)
 */
export function pathHasDiff(diffMap, path) {
  const pathStr = path.join('.');
  for (const [key] of diffMap) {
    if (key === pathStr || key.startsWith(pathStr + '.') || key.startsWith(pathStr + '[')) {
      return true;
    }
  }
  return false;
}

/**
 * Get diff type for a specific path
 */
export function getDiffType(diffMap, path) {
  const pathStr = path.join('.');
  const diff = diffMap.get(pathStr);
  return diff ? diff.type : null;
}
