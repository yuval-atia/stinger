// Detect if string is a valid URL (http/https)
export function isUrl(str) {
  if (typeof str !== 'string' || str.length < 10) return false;

  try {
    const url = new URL(str);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}
