// ── URL Encode/Decode ────────────────────────────────────────────────────────

function urlEncode(input) {
  try {
    return encodeURIComponent(input);
  } catch {
    return 'Error: Could not encode input';
  }
}

function urlDecode(input) {
  try {
    return decodeURIComponent(input.trim());
  } catch {
    return 'Error: Invalid URL-encoded string';
  }
}
