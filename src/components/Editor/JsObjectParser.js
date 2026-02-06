/**
 * Parse JavaScript object notation (with unquoted keys, trailing commas, etc.)
 * and convert it to valid JSON
 */
export function parseJsObject(input) {
  try {
    // First, try to sanitize and evaluate as JS
    const sanitized = sanitizeJsObject(input);

    // Use Function constructor to safely evaluate (safer than eval)
    // We wrap in parentheses to handle object literals
    const fn = new Function(`return (${sanitized})`);
    const result = fn();

    // Verify the result is a valid JSON-compatible value
    const jsonString = JSON.stringify(result);
    const parsed = JSON.parse(jsonString);

    return { success: true, data: parsed, error: null };
  } catch (e) {
    return { success: false, data: null, error: e.message };
  }
}

/**
 * Sanitize JavaScript object string to make it evaluable
 */
function sanitizeJsObject(input) {
  let result = input.trim();

  // Remove potential 'const x = ' or 'let x = ' or 'var x = ' prefixes
  result = result.replace(/^(?:const|let|var)\s+\w+\s*=\s*/, '');

  // Remove trailing semicolons
  result = result.replace(/;\s*$/, '');

  return result;
}

/**
 * Convert a JavaScript value to a JSON-compatible string
 * Handles special cases like undefined, functions, etc.
 */
export function jsToJson(value) {
  if (value === undefined) {
    return null;
  }

  if (typeof value === 'function') {
    return null;
  }

  if (typeof value === 'symbol') {
    return null;
  }

  if (typeof value === 'bigint') {
    return value.toString();
  }

  return value;
}

/**
 * Try to detect if input is likely a JavaScript object vs JSON
 */
export function isLikelyJsObject(input) {
  const trimmed = input.trim();

  // Check for unquoted keys (property: value pattern)
  if (/^\{[\s\S]*[a-zA-Z_$][a-zA-Z0-9_$]*\s*:/.test(trimmed)) {
    // Could be JS object with unquoted keys
    // Check if it's NOT valid JSON
    try {
      JSON.parse(trimmed);
      return false; // It's valid JSON
    } catch {
      return true; // Not valid JSON, might be JS object
    }
  }

  // Check for trailing commas
  if (/,\s*[}\]]/.test(trimmed)) {
    return true;
  }

  // Check for single quotes
  if (/'/.test(trimmed)) {
    return true;
  }

  // Check for variable assignments
  if (/^(?:const|let|var)\s+/.test(trimmed)) {
    return true;
  }

  return false;
}
