/**
 * Parse JSON string and return parsed object or error
 */
export function parseJson(input) {
  try {
    const parsed = JSON.parse(input);
    return { success: true, data: parsed, error: null };
  } catch (e) {
    return { success: false, data: null, error: e.message };
  }
}

/**
 * Validate JSON string
 */
export function validateJson(input) {
  try {
    JSON.parse(input);
    return { valid: true, error: null };
  } catch (e) {
    const match = e.message.match(/position (\d+)/);
    const position = match ? parseInt(match[1], 10) : null;
    return { valid: false, error: e.message, position };
  }
}

/**
 * Format/prettify JSON string
 */
export function formatJson(input, indent = 2) {
  try {
    const parsed = JSON.parse(input);
    return { success: true, formatted: JSON.stringify(parsed, null, indent), error: null };
  } catch (e) {
    return { success: false, formatted: null, error: e.message };
  }
}

/**
 * Minify JSON string
 */
export function minifyJson(input) {
  try {
    const parsed = JSON.parse(input);
    return { success: true, minified: JSON.stringify(parsed), error: null };
  } catch (e) {
    return { success: false, minified: null, error: e.message };
  }
}

/**
 * Get the type of a value for display purposes
 */
export function getValueType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

/**
 * Get a preview string for complex values
 */
export function getPreview(value, maxLength = 50) {
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return `Array(${value.length})`;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return '{}';
    return `Object(${keys.length})`;
  }
  return String(value);
}
