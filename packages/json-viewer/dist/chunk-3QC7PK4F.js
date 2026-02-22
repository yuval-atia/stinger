// src/diff/differ.js
function diffJson(left, right, path = [], options = {}) {
  const diffs = [];
  const leftType = getType(left);
  const rightType = getType(right);
  if (leftType !== rightType) {
    diffs.push({
      type: "changed",
      path: [...path],
      leftValue: left,
      rightValue: right,
      leftType,
      rightType
    });
    return diffs;
  }
  if (leftType !== "object" && leftType !== "array") {
    if (left !== right) {
      diffs.push({
        type: "changed",
        path: [...path],
        leftValue: left,
        rightValue: right,
        leftType,
        rightType
      });
    }
    return diffs;
  }
  if (leftType === "array") {
    diffs.push(...diffArraySmart(left, right, path, options));
    return diffs;
  }
  const allKeys = /* @__PURE__ */ new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const key of allKeys) {
    const hasLeft = key in left;
    const hasRight = key in right;
    if (!hasLeft) {
      diffs.push({
        type: "added",
        path: [...path, key],
        rightValue: right[key],
        rightType: getType(right[key])
      });
    } else if (!hasRight) {
      diffs.push({
        type: "removed",
        path: [...path, key],
        leftValue: left[key],
        leftType: getType(left[key])
      });
    } else {
      diffs.push(...diffJson(left[key], right[key], [...path, key], options));
    }
  }
  return diffs;
}
var CANDIDATE_KEYS = ["id", "_id", "key", "name", "uuid", "slug"];
function detectArrayKey(leftArr, rightArr) {
  const totalLen = leftArr.length + rightArr.length;
  const objCount = leftArr.filter((v) => v && typeof v === "object" && !Array.isArray(v)).length + rightArr.filter((v) => v && typeof v === "object" && !Array.isArray(v)).length;
  if (objCount < totalLen * 0.5) return null;
  for (const key of CANDIDATE_KEYS) {
    const leftVals = /* @__PURE__ */ new Set();
    const rightVals = /* @__PURE__ */ new Set();
    let leftHasKey = 0;
    let rightHasKey = 0;
    for (const item of leftArr) {
      if (item && typeof item === "object" && !Array.isArray(item) && key in item) {
        const val = item[key];
        if (typeof val === "string" || typeof val === "number") {
          leftVals.add(val);
          leftHasKey++;
        }
      }
    }
    for (const item of rightArr) {
      if (item && typeof item === "object" && !Array.isArray(item) && key in item) {
        const val = item[key];
        if (typeof val === "string" || typeof val === "number") {
          rightVals.add(val);
          rightHasKey++;
        }
      }
    }
    if (leftHasKey === leftVals.size && leftHasKey > 0 && rightHasKey === rightVals.size && rightHasKey > 0) {
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
        type: "added",
        path: [...path, i],
        rightValue: right[i],
        rightType: getType(right[i])
      });
    } else if (i >= right.length) {
      diffs.push({
        type: "removed",
        path: [...path, i],
        leftValue: left[i],
        leftType: getType(left[i])
      });
    } else {
      diffs.push(...diffJson(left[i], right[i], [...path, i], options));
    }
  }
  return diffs;
}
function diffArrayByKey(left, right, path, keyField, options = {}) {
  const diffs = [];
  const leftMap = /* @__PURE__ */ new Map();
  const rightMap = /* @__PURE__ */ new Map();
  left.forEach((item, i) => {
    if (item && typeof item === "object" && !Array.isArray(item) && keyField in item) {
      leftMap.set(item[keyField], { index: i, item });
    }
  });
  right.forEach((item, i) => {
    if (item && typeof item === "object" && !Array.isArray(item) && keyField in item) {
      rightMap.set(item[keyField], { index: i, item });
    }
  });
  const matched = /* @__PURE__ */ new Set();
  for (const [keyVal, { index: leftIdx, item: leftItem }] of leftMap) {
    const rightEntry = rightMap.get(keyVal);
    if (!rightEntry) {
      diffs.push({
        type: "removed",
        path: [...path, leftIdx],
        leftValue: leftItem,
        leftType: getType(leftItem)
      });
    } else {
      matched.add(keyVal);
      const { index: rightIdx, item: rightItem } = rightEntry;
      if (leftIdx !== rightIdx) {
        diffs.push({
          type: "moved",
          path: [...path, leftIdx],
          fromIndex: leftIdx,
          toIndex: rightIdx,
          side: "left"
        });
        diffs.push({
          type: "moved",
          path: [...path, rightIdx],
          fromIndex: leftIdx,
          toIndex: rightIdx,
          side: "right"
        });
      }
      const contentDiffs = diffJson(leftItem, rightItem, [...path, leftIdx], options);
      if (leftIdx !== rightIdx) {
        for (const cd of contentDiffs) {
          diffs.push(cd);
          const relPath = cd.path.slice(path.length + 1);
          diffs.push({ ...cd, path: [...path, rightIdx, ...relPath] });
        }
      } else {
        diffs.push(...contentDiffs);
      }
    }
  }
  for (const [keyVal, { index: rightIdx, item: rightItem }] of rightMap) {
    if (!matched.has(keyVal) && !leftMap.has(keyVal)) {
      diffs.push({
        type: "added",
        path: [...path, rightIdx],
        rightValue: rightItem,
        rightType: getType(rightItem)
      });
    }
  }
  return diffs;
}
function diffArraySmart(left, right, path, options = {}) {
  if (left.length > 1e4 || right.length > 1e4) {
    return diffArrayByIndex(left, right, path, options);
  }
  const keyField = options.arrayMatchKey || detectArrayKey(left, right);
  if (keyField) {
    return diffArrayByKey(left, right, path, keyField, options);
  }
  return diffArrayByIndex(left, right, path, options);
}
function getType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}
function createDiffMap(diffs) {
  const map = /* @__PURE__ */ new Map();
  for (const diff of diffs) {
    const pathStr = diff.path.join(".");
    map.set(pathStr, diff);
  }
  return map;
}
function pathHasDiff(diffMap, path) {
  const pathStr = path.join(".");
  for (const [key] of diffMap) {
    if (key === pathStr || key.startsWith(pathStr + ".") || key.startsWith(pathStr + "[")) {
      return true;
    }
  }
  return false;
}
function getDiffType(diffMap, path) {
  const pathStr = path.join(".");
  const diff = diffMap.get(pathStr);
  return diff ? diff.type : null;
}

// src/diff/charDiff.js
function charDiff(strA, strB) {
  if (strA === strB) return [{ type: "equal", value: strA }];
  if (strA.length > 5e3 || strB.length > 5e3) return null;
  if (strA.length > 200 || strB.length > 200) {
    return wordDiff(strA, strB);
  }
  return lcs(strA.split(""), strB.split(""));
}
function wordDiff(strA, strB) {
  const tokensA = tokenize(strA);
  const tokensB = tokenize(strB);
  return lcs(tokensA, tokensB);
}
function tokenize(str) {
  const result = [];
  const regex = /(\S+|\s+)/g;
  let match;
  while ((match = regex.exec(str)) !== null) {
    result.push(match[0]);
  }
  return result;
}
function lcs(tokensA, tokensB) {
  const m = tokensA.length;
  const n = tokensB.length;
  const dp = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1));
  for (let i2 = 1; i2 <= m; i2++) {
    for (let j2 = 1; j2 <= n; j2++) {
      if (tokensA[i2 - 1] === tokensB[j2 - 1]) {
        dp[i2][j2] = dp[i2 - 1][j2 - 1] + 1;
      } else {
        dp[i2][j2] = Math.max(dp[i2 - 1][j2], dp[i2][j2 - 1]);
      }
    }
  }
  const segments = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && tokensA[i - 1] === tokensB[j - 1]) {
      segments.push({ type: "equal", value: tokensA[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      segments.push({ type: "add", value: tokensB[j - 1] });
      j--;
    } else {
      segments.push({ type: "remove", value: tokensA[i - 1] });
      i--;
    }
  }
  segments.reverse();
  const merged = [];
  for (const seg of segments) {
    if (merged.length > 0 && merged[merged.length - 1].type === seg.type) {
      merged[merged.length - 1].value += seg.value;
    } else {
      merged.push({ ...seg });
    }
  }
  return merged;
}

export { charDiff, createDiffMap, diffJson, getDiffType, pathHasDiff };
