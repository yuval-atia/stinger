/**
 * Compare two JSON values and return diff information
 */
export function diffJson(left, right, path = [], options = {}) {
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
    diffs.push(...diffArraySmart(left, right, path, options));
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
      diffs.push(...diffJson(left[key], right[key], [...path, key], options));
    }
  }

  return diffs;
}

// ── Smart array matching ─────────────────────────────────────────────────────

const CANDIDATE_KEYS = ['id', '_id', 'key', 'name', 'uuid', 'slug'];

/** Check if a candidate key field is unique across both arrays */
function detectArrayKey(leftArr, rightArr) {
  // Only consider arrays where at least 50% of items are objects
  const totalLen = leftArr.length + rightArr.length;
  const objCount = leftArr.filter((v) => v && typeof v === 'object' && !Array.isArray(v)).length +
                   rightArr.filter((v) => v && typeof v === 'object' && !Array.isArray(v)).length;
  if (objCount < totalLen * 0.5) return null;

  for (const key of CANDIDATE_KEYS) {
    const leftVals = new Set();
    const rightVals = new Set();
    let leftHasKey = 0;
    let rightHasKey = 0;

    for (const item of leftArr) {
      if (item && typeof item === 'object' && !Array.isArray(item) && key in item) {
        const val = item[key];
        if (typeof val === 'string' || typeof val === 'number') {
          leftVals.add(val);
          leftHasKey++;
        }
      }
    }

    for (const item of rightArr) {
      if (item && typeof item === 'object' && !Array.isArray(item) && key in item) {
        const val = item[key];
        if (typeof val === 'string' || typeof val === 'number') {
          rightVals.add(val);
          rightHasKey++;
        }
      }
    }

    // Key must be present and unique on both sides
    if (leftHasKey === leftVals.size && leftHasKey > 0 &&
        rightHasKey === rightVals.size && rightHasKey > 0) {
      return key;
    }
  }
  return null;
}

function diffArrayByIndex(left, right, path, options = {}) {
  const diffs = [];
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
      diffs.push(...diffJson(left[i], right[i], [...path, i], options));
    }
  }
  return diffs;
}

function diffArrayByKey(left, right, path, keyField, options = {}) {
  const diffs = [];

  // Build lookup maps: keyValue → { index, item }
  const leftMap = new Map();
  const rightMap = new Map();

  left.forEach((item, i) => {
    if (item && typeof item === 'object' && !Array.isArray(item) && keyField in item) {
      leftMap.set(item[keyField], { index: i, item });
    }
  });

  right.forEach((item, i) => {
    if (item && typeof item === 'object' && !Array.isArray(item) && keyField in item) {
      rightMap.set(item[keyField], { index: i, item });
    }
  });

  const matched = new Set();

  // Walk left items
  for (const [keyVal, { index: leftIdx, item: leftItem }] of leftMap) {
    const rightEntry = rightMap.get(keyVal);
    if (!rightEntry) {
      // Removed
      diffs.push({
        type: 'removed',
        path: [...path, leftIdx],
        leftValue: leftItem,
        leftType: getType(leftItem),
      });
    } else {
      matched.add(keyVal);
      const { index: rightIdx, item: rightItem } = rightEntry;

      if (leftIdx !== rightIdx) {
        // Moved — emit move markers at both indices
        diffs.push({
          type: 'moved',
          path: [...path, leftIdx],
          fromIndex: leftIdx,
          toIndex: rightIdx,
          side: 'left',
        });
        diffs.push({
          type: 'moved',
          path: [...path, rightIdx],
          fromIndex: leftIdx,
          toIndex: rightIdx,
          side: 'right',
        });
      }

      // Recurse for content diffs (always use left index as canonical path)
      const contentDiffs = diffJson(leftItem, rightItem, [...path, leftIdx], options);
      // If item moved, duplicate content diffs to the right index path too
      if (leftIdx !== rightIdx) {
        for (const cd of contentDiffs) {
          diffs.push(cd);
          // Also create a copy at the right-side index
          const relPath = cd.path.slice(path.length + 1);
          diffs.push({ ...cd, path: [...path, rightIdx, ...relPath] });
        }
      } else {
        diffs.push(...contentDiffs);
      }
    }
  }

  // Walk right items for added ones
  for (const [keyVal, { index: rightIdx, item: rightItem }] of rightMap) {
    if (!matched.has(keyVal) && !leftMap.has(keyVal)) {
      diffs.push({
        type: 'added',
        path: [...path, rightIdx],
        rightValue: rightItem,
        rightType: getType(rightItem),
      });
    }
  }

  return diffs;
}

function diffArraySmart(left, right, path, options = {}) {
  // Fallback to index-based for: arrays >10K items, empty arrays
  if (left.length > 10000 || right.length > 10000) {
    return diffArrayByIndex(left, right, path, options);
  }

  const keyField = options.arrayMatchKey || detectArrayKey(left, right);
  if (keyField) {
    return diffArrayByKey(left, right, path, keyField, options);
  }
  return diffArrayByIndex(left, right, path, options);
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
