export function jsonEscape(text) {
  if (!text) return '';
  return JSON.stringify(text).slice(1, -1);
}

export function jsonUnescape(text) {
  if (!text) return { result: '', error: '' };
  try {
    const result = JSON.parse(`"${text}"`);
    return { result, error: '' };
  } catch {
    return { result: '', error: 'Invalid escaped string' };
  }
}
