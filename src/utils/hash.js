// ── Pure JS MD5 implementation ───────────────────────────────────────────────

function md5(input) {
  const bytes = new TextEncoder().encode(input);
  const len = bytes.length;

  // Pre-processing: adding padding bits
  const bitLen = len * 8;
  const padLen = ((56 - (len + 1) % 64) + 64) % 64;
  const buf = new Uint8Array(len + 1 + padLen + 8);
  buf.set(bytes);
  buf[len] = 0x80;
  // Append original length in bits as 64-bit little-endian
  const view = new DataView(buf.buffer);
  view.setUint32(buf.length - 8, bitLen >>> 0, true);
  view.setUint32(buf.length - 4, (bitLen / 0x100000000) >>> 0, true);

  // Per-round shift amounts
  const s = [
    7,12,17,22, 7,12,17,22, 7,12,17,22, 7,12,17,22,
    5, 9,14,20, 5, 9,14,20, 5, 9,14,20, 5, 9,14,20,
    4,11,16,23, 4,11,16,23, 4,11,16,23, 4,11,16,23,
    6,10,15,21, 6,10,15,21, 6,10,15,21, 6,10,15,21,
  ];

  // Pre-computed K constants
  const K = Array.from({ length: 64 }, (_, i) =>
    (Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0
  );

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  for (let offset = 0; offset < buf.length; offset += 64) {
    const M = new Uint32Array(16);
    for (let j = 0; j < 16; j++) {
      M[j] = view.getUint32(offset + j * 4, true);
    }

    let A = a0, B = b0, C = c0, D = d0;
    for (let i = 0; i < 64; i++) {
      let F, g;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      F = (F + A + K[i] + M[g]) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + ((F << s[i]) | (F >>> (32 - s[i])))) >>> 0;
    }
    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  // Convert to hex (little-endian)
  const hex = (n) => {
    const bytes = [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, (n >> 24) & 0xff];
    return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
  };
  return hex(a0) + hex(b0) + hex(c0) + hex(d0);
}

// ── Web Crypto wrappers ─────────────────────────────────────────────────────

async function sha(algorithm, input) {
  const data = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function computeMD5(input) {
  return md5(input);
}

export async function computeSHA1(input) {
  return sha('SHA-1', input);
}

export async function computeSHA256(input) {
  return sha('SHA-256', input);
}

export async function computeSHA512(input) {
  return sha('SHA-512', input);
}

// ── HMAC wrappers ───────────────────────────────────────────────────────────

async function hmac(algorithm, key, input) {
  const enc = new TextEncoder();
  const keyData = enc.encode(key);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(input));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function computeHMACSHA256(key, input) {
  return hmac('SHA-256', key, input);
}

export async function computeHMACSHA512(key, input) {
  return hmac('SHA-512', key, input);
}
