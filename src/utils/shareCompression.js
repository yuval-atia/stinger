const SCHEMA_VERSION = 1;
const MAX_INLINE_URL_LENGTH = 4096;
const WORKER_URL = 'https://stinger-share.yodaatia123.workers.dev';
export const TURNSTILE_SITE_KEY = '0x4AAAAAACfKD8uYKZOFrSgA';

/** Build the minimal state object, omitting empty/falsy fields */
export function buildShareState({ json, pinnedPaths, depth, searchQuery, filterMode }) {
  const state = { v: SCHEMA_VERSION, j: json };
  if (pinnedPaths && pinnedPaths.length > 0) state.p = pinnedPaths;
  if (depth) state.d = depth;
  if (searchQuery) state.s = searchQuery;
  if (filterMode) state.f = true;
  return state;
}

/** Compress a string using CompressionStream (deflate) → base64url */
export async function compressState(stateObj) {
  const json = JSON.stringify(stateObj);
  const bytes = new TextEncoder().encode(json);

  const cs = new CompressionStream('deflate');
  const writer = cs.writable.getWriter();
  writer.write(bytes);
  writer.close();

  const chunks = [];
  const reader = cs.readable.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const compressed = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    compressed.set(chunk, offset);
    offset += chunk.length;
  }

  return uint8ToBase64url(compressed);
}

/** Decompress a base64url string back to a state object */
export async function decompressState(base64url) {
  const compressed = base64urlToUint8(base64url);

  const ds = new DecompressionStream('deflate');
  const writer = ds.writable.getWriter();
  writer.write(compressed);
  writer.close();

  const chunks = [];
  const reader = ds.readable.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const decompressed = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    decompressed.set(chunk, offset);
    offset += chunk.length;
  }

  const json = new TextDecoder().decode(decompressed);
  return JSON.parse(json);
}

/**
 * Compress and check if the inline URL fits.
 * Returns { compressed, inlineUrl, needsWorker }.
 */
export async function compressAndCheck({ json, pinnedPaths, depth, searchQuery, filterMode }) {
  const stateObj = buildShareState({ json, pinnedPaths, depth, searchQuery, filterMode });
  const compressed = await compressState(stateObj);
  const base = window.location.origin + window.location.pathname;
  const inlineUrl = `${base}#state=${compressed}`;
  return {
    compressed,
    inlineUrl,
    needsWorker: inlineUrl.length > MAX_INLINE_URL_LENGTH,
  };
}

/**
 * Upload compressed blob to worker with a Turnstile token.
 * Returns a short share URL.
 */
export async function uploadToWorker(compressed, turnstileToken) {
  const res = await fetch(`${WORKER_URL}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ blob: compressed, token: turnstileToken }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to upload shared state');
  }

  const { id } = await res.json();
  const base = window.location.origin + window.location.pathname;
  return `${base}#s=${id}`;
}

/**
 * Read the hash and resolve the shared state.
 * Handles both #state=<compressed> (inline) and #s=<id> (worker).
 * Returns null if no share hash is present.
 */
export async function resolveHashState() {
  const hash = window.location.hash;

  if (hash.startsWith('#state=')) {
    const payload = hash.slice(7);
    return decompressState(payload);
  }

  if (hash.startsWith('#s=')) {
    const id = hash.slice(3);
    const res = await fetch(`${WORKER_URL}/s/${id}`);
    if (!res.ok) return null;
    const blob = await res.text();
    return decompressState(blob);
  }

  return null;
}

/** Strip the hash from the URL bar without triggering navigation */
export function stripHash() {
  history.replaceState(null, '', window.location.pathname + window.location.search);
}

// ── Base64url helpers ────────────────────────────────────────────────────────

function uint8ToBase64url(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64urlToUint8(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
