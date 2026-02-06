/**
 * Build a path string from an array of path segments
 * e.g., ['data', 'users', 0, 'name'] -> 'data.users[0].name'
 */
export function buildPath(segments) {
  if (!segments || segments.length === 0) return '';

  return segments.reduce((path, segment, index) => {
    if (index === 0) {
      return String(segment);
    }

    if (typeof segment === 'number') {
      return `${path}[${segment}]`;
    }

    // Check if key needs bracket notation (contains special chars or starts with number)
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(segment)) {
      return `${path}.${segment}`;
    }

    // Use bracket notation for special keys
    return `${path}["${segment}"]`;
  }, '');
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return { success: true };
  } catch (e) {
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return { success: true };
    } catch (fallbackError) {
      return { success: false, error: fallbackError.message };
    }
  }
}

/**
 * Get value at a given path in an object
 */
export function getValueAtPath(obj, segments) {
  let current = obj;
  for (const segment of segments) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[segment];
  }
  return current;
}

/**
 * Set value at a given path in an object (returns new object, immutable)
 */
export function setValueAtPath(obj, segments, value) {
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
