// src/utils/pathCopier.js
function buildPath(segments) {
  if (!segments || segments.length === 0) return "";
  return segments.reduce((path, segment, index) => {
    if (index === 0) {
      return String(segment);
    }
    if (typeof segment === "number") {
      return `${path}[${segment}]`;
    }
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(segment)) {
      return `${path}.${segment}`;
    }
    return `${path}["${segment}"]`;
  }, "");
}
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch (e) {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return { success: true };
    } catch (fallbackError) {
      return { success: false, error: fallbackError.message };
    }
  }
}
function getValueAtPath(obj, segments) {
  let current = obj;
  for (const segment of segments) {
    if (current === null || current === void 0) {
      return void 0;
    }
    current = current[segment];
  }
  return current;
}
function setValueAtPath(obj, segments, value) {
  if (segments.length === 0) return value;
  const [first, ...rest] = segments;
  const isArray = Array.isArray(obj);
  const result = isArray ? [...obj] : { ...obj };
  if (rest.length === 0) {
    result[first] = value;
  } else {
    result[first] = setValueAtPath(obj[first], rest, value);
  }
  return result;
}
function deleteAtPath(obj, segments) {
  if (segments.length === 0) return obj;
  if (segments.length === 1) {
    const key = segments[0];
    if (Array.isArray(obj)) {
      const result2 = [...obj];
      result2.splice(key, 1);
      return result2;
    }
    const { [key]: _, ...rest2 } = obj;
    return rest2;
  }
  const [first, ...rest] = segments;
  const isArray = Array.isArray(obj);
  const result = isArray ? [...obj] : { ...obj };
  result[first] = deleteAtPath(obj[first], rest);
  return result;
}
function addKeyToObject(obj, parentPath, key, value) {
  if (parentPath.length === 0) {
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return obj;
    return { ...obj, [key]: value };
  }
  const [first, ...rest] = parentPath;
  const isArray = Array.isArray(obj);
  const result = isArray ? [...obj] : { ...obj };
  result[first] = addKeyToObject(obj[first], rest, key, value);
  return result;
}
function appendToArray(obj, parentPath, value) {
  if (parentPath.length === 0) {
    if (!Array.isArray(obj)) return obj;
    return [...obj, value];
  }
  const [first, ...rest] = parentPath;
  const isArray = Array.isArray(obj);
  const result = isArray ? [...obj] : { ...obj };
  result[first] = appendToArray(obj[first], rest, value);
  return result;
}

// src/utils/jsonParser.js
function getValueType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}
function getPreview(value, maxLength = 50) {
  if (value === null) return "null";
  if (typeof value === "string") return `"${value}"`;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return `Array(${value.length})`;
  }
  if (typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 0) return "{}";
    return `Object(${keys.length})`;
  }
  return String(value);
}

// src/utils/imageDetector.js
var IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|tiff?)(\?.*)?$/i;
var DATA_URL_IMAGE = /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml|bmp|ico);base64,/i;
var IMAGE_CDN_PATTERNS = [
  /imgur\.com/i,
  /cloudinary\.com/i,
  /imgix\.net/i,
  /unsplash\.com/i,
  /pexels\.com/i,
  /giphy\.com/i,
  /tenor\.com/i
];
function isImageUrl(str) {
  if (typeof str !== "string" || str.length < 10) return false;
  if (DATA_URL_IMAGE.test(str)) return true;
  try {
    const url = new URL(str);
    if (!["http:", "https:"].includes(url.protocol)) return false;
    if (IMAGE_EXTENSIONS.test(url.pathname)) return true;
    if (IMAGE_CDN_PATTERNS.some((pattern) => pattern.test(url.hostname))) return true;
    return false;
  } catch {
    return false;
  }
}

// src/utils/dateDetector.js
var UNIX_SECONDS_PATTERN = /^[0-9]{10}$/;
var UNIX_MS_PATTERN = /^[0-9]{13}$/;
var ISO_8601_PATTERN = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:?\d{2})?)?$/;
var COMMON_DATE_PATTERNS = [
  /^\d{4}\/\d{2}\/\d{2}$/,
  /^\d{2}\/\d{2}\/\d{4}$/,
  /^\d{2}-\d{2}-\d{4}$/,
  /^[A-Z][a-z]{2}\s\d{1,2},?\s\d{4}$/,
  /^\d{1,2}\s[A-Z][a-z]{2}\s\d{4}$/
];
var MIN_TIMESTAMP = 0;
var MAX_TIMESTAMP = 4102444800;
var MIN_TIMESTAMP_MS = 0;
var MAX_TIMESTAMP_MS = 41024448e5;
function detectDateFormat(str) {
  if (typeof str !== "string" || str.length < 8 || str.length > 30) return null;
  const trimmed = str.trim();
  if (UNIX_SECONDS_PATTERN.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    if (num >= MIN_TIMESTAMP && num <= MAX_TIMESTAMP) {
      return {
        type: "Unix Timestamp (seconds)",
        date: new Date(num * 1e3),
        original: trimmed
      };
    }
  }
  if (UNIX_MS_PATTERN.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    if (num >= MIN_TIMESTAMP_MS && num <= MAX_TIMESTAMP_MS) {
      return {
        type: "Unix Timestamp (milliseconds)",
        date: new Date(num),
        original: trimmed
      };
    }
  }
  if (ISO_8601_PATTERN.test(trimmed)) {
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      return {
        type: "ISO 8601",
        date,
        original: trimmed
      };
    }
  }
  for (const pattern of COMMON_DATE_PATTERNS) {
    if (pattern.test(trimmed)) {
      const date = new Date(trimmed);
      if (!isNaN(date.getTime())) {
        return {
          type: "Date String",
          date,
          original: trimmed
        };
      }
    }
  }
  return null;
}
function formatDateInfo(dateInfo) {
  if (!dateInfo) return null;
  const { date, type } = dateInfo;
  const formatted = date.toLocaleString(void 0, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short"
  });
  return {
    formatted,
    type,
    iso: date.toISOString()
  };
}

// src/utils/nestedJsonDetector.js
function detectNestedJson(str) {
  if (typeof str !== "string" || str.length < 2) return null;
  const trimmed = str.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return null;
  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed !== "object" || parsed === null) return null;
    return {
      parsed,
      isArray: Array.isArray(parsed),
      original: str
    };
  } catch {
    return null;
  }
}

// src/utils/urlDetector.js
function isUrl(str) {
  if (typeof str !== "string" || str.length < 10) return false;
  try {
    const url = new URL(str);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

// src/utils/flattenTree.js
function flattenTree(data, expandedPaths, options = {}) {
  const result = [];
  const { matches, filterMode, searchQuery, diffMap, side } = options;
  function walk(value, path, keyName, isRoot) {
    const pathStr = path.join(".");
    const valueType = getValueType(value);
    const isExpandable = valueType === "object" || valueType === "array";
    const isExpanded = isRoot || ((expandedPaths == null ? void 0 : expandedPaths.has(pathStr)) ?? false);
    const childCount = isExpandable ? valueType === "array" ? value.length : Object.keys(value).length : 0;
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
      preview: isExpandable ? getPreview(value) : null
    });
    if (isExpandable && isExpanded) {
      const entries = valueType === "array" ? value.map((v, i) => [i, v]) : Object.entries(value);
      const filteredEntries = filterMode && searchQuery && (matches == null ? void 0 : matches.size) > 0 ? entries.filter(([key]) => {
        const childPath = [...path, key];
        return childHasMatch(childPath, matches);
      }) : entries;
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
  const childPathStr = childPath.join(".");
  for (const matchPath of matches) {
    if (matchPath === childPathStr || matchPath.startsWith(childPathStr + ".")) {
      return true;
    }
  }
  return false;
}
function buildPathIndex(flatNodes) {
  const index = /* @__PURE__ */ new Map();
  for (let i = 0; i < flatNodes.length; i++) {
    index.set(flatNodes[i].pathStr, i);
  }
  return index;
}

export { addKeyToObject, appendToArray, buildPath, buildPathIndex, copyToClipboard, deleteAtPath, detectDateFormat, detectNestedJson, flattenTree, formatDateInfo, getPreview, getValueAtPath, getValueType, isImageUrl, isUrl, setValueAtPath };
