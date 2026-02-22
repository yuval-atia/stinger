export function detectNestedJson(str) {
  if (typeof str !== 'string' || str.length < 2) return null;

  const trimmed = str.trim();

  // Must start with { or [ to be JSON object/array
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return null;

  try {
    const parsed = JSON.parse(trimmed);

    // Only consider objects and arrays as nested JSON
    if (typeof parsed !== 'object' || parsed === null) return null;

    return {
      parsed,
      isArray: Array.isArray(parsed),
      original: str,
    };
  } catch {
    return null;
  }
}
