// ── Base64 Encode/Decode ─────────────────────────────────────────────────────

function base64Encode(input) {
  try {
    return btoa(unescape(encodeURIComponent(input)));
  } catch {
    return 'Error: Could not encode input';
  }
}

function base64Decode(input) {
  try {
    return decodeURIComponent(escape(atob(input.trim())));
  } catch {
    return 'Error: Invalid Base64 string';
  }
}
