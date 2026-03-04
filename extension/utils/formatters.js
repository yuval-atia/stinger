// ── JSON Formatter / Minifier ────────────────────────────────────────────────

function formatJSON(json) {
  try {
    const parsed = JSON.parse(json);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return 'Error: Invalid JSON';
  }
}

function minifyJSON(json) {
  try {
    const parsed = JSON.parse(json);
    return JSON.stringify(parsed);
  } catch {
    return 'Error: Invalid JSON';
  }
}
