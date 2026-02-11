// ── UUID v4 ──────────────────────────────────────────────────────────────────
export function generateUUIDv4() {
  return crypto.randomUUID();
}

// ── UUID v1 (timestamp-based) ────────────────────────────────────────────────
let _v1ClockSeq = null;
let _v1LastTimestamp = null;

export function generateUUIDv1() {
  // UUID epoch: 15 Oct 1582 → offset from Unix epoch in 100-ns intervals
  const UUID_EPOCH_OFFSET = 122192928000000000n;
  const now = BigInt(Date.now()) * 10000n + UUID_EPOCH_OFFSET;

  if (_v1ClockSeq === null || now <= _v1LastTimestamp) {
    const buf = new Uint8Array(2);
    crypto.getRandomValues(buf);
    _v1ClockSeq = ((buf[0] & 0x3f) << 8) | buf[1]; // 14-bit
  }
  _v1LastTimestamp = now;

  const timeLow = Number(now & 0xffffffffn);
  const timeMid = Number((now >> 32n) & 0xffffn);
  const timeHiAndVersion = Number((now >> 48n) & 0x0fffn) | 0x1000;

  const clockSeqHi = ((_v1ClockSeq >> 8) & 0x3f) | 0x80;
  const clockSeqLow = _v1ClockSeq & 0xff;

  // Random node (6 bytes) with multicast bit set
  const node = new Uint8Array(6);
  crypto.getRandomValues(node);
  node[0] |= 0x01; // multicast bit

  const hex = (n, len) => n.toString(16).padStart(len, '0');
  return [
    hex(timeLow, 8),
    hex(timeMid, 4),
    hex(timeHiAndVersion, 4),
    hex(clockSeqHi, 2) + hex(clockSeqLow, 2),
    Array.from(node, (b) => hex(b, 2)).join(''),
  ].join('-');
}

// ── ULID ─────────────────────────────────────────────────────────────────────
const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

function encodeCrockford(value, length) {
  let str = '';
  for (let i = length - 1; i >= 0; i--) {
    str = CROCKFORD[Number(value % 32n)] + str;
    value = value / 32n;
  }
  return str;
}

export function generateULID() {
  const timestamp = BigInt(Date.now());
  const timePart = encodeCrockford(timestamp, 10);

  const rand = new Uint8Array(10);
  crypto.getRandomValues(rand);
  let randVal = 0n;
  for (const byte of rand) {
    randVal = (randVal << 8n) | BigInt(byte);
  }
  const randPart = encodeCrockford(randVal, 16);

  return timePart + randPart;
}

// ── ULID timestamp decoder ────────────────────────────────────────────────────
const CROCKFORD_MAP = Object.fromEntries([...CROCKFORD].map((c, i) => [c, i]));

export function decodeULIDTimestamp(ulid) {
  const timePart = ulid.slice(0, 10).toUpperCase();
  let ts = 0n;
  for (const ch of timePart) {
    ts = ts * 32n + BigInt(CROCKFORD_MAP[ch] ?? 0);
  }
  return new Date(Number(ts));
}

// ── API Key entropy calculator ───────────────────────────────────────────────
export function calcKeyEntropy(length, charsetFlags) {
  let poolSize = 0;
  if (charsetFlags.uppercase) poolSize += 26;
  if (charsetFlags.lowercase) poolSize += 26;
  if (charsetFlags.digits) poolSize += 10;
  if (charsetFlags.special) poolSize += 27;
  if (poolSize === 0) poolSize = 36;
  const bits = Math.floor(length * Math.log2(poolSize));
  let label = 'Weak';
  if (bits >= 128) label = 'Very strong';
  else if (bits >= 80) label = 'Strong';
  else if (bits >= 56) label = 'Moderate';
  return { bits, label };
}

// ── NanoID ───────────────────────────────────────────────────────────────────
export function generateNanoID(length = 21, alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-') {
  const mask = (2 << (31 - Math.clz32((alphabet.length - 1) | 1))) - 1;
  const step = Math.ceil((1.6 * mask * length) / alphabet.length);
  let id = '';
  while (id.length < length) {
    const bytes = new Uint8Array(step);
    crypto.getRandomValues(bytes);
    for (let i = 0; i < step && id.length < length; i++) {
      const idx = bytes[i] & mask;
      if (idx < alphabet.length) {
        id += alphabet[idx];
      }
    }
  }
  return id;
}

// ── API Key ──────────────────────────────────────────────────────────────────
const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  special: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

export function generateAPIKey(length = 32, prefix = '', charsetFlags = { uppercase: true, lowercase: true, digits: true, special: false }) {
  let alphabet = '';
  if (charsetFlags.uppercase) alphabet += CHARSETS.uppercase;
  if (charsetFlags.lowercase) alphabet += CHARSETS.lowercase;
  if (charsetFlags.digits) alphabet += CHARSETS.digits;
  if (charsetFlags.special) alphabet += CHARSETS.special;

  if (alphabet.length === 0) alphabet = CHARSETS.lowercase + CHARSETS.digits;

  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let key = '';
  for (let i = 0; i < length; i++) {
    key += alphabet[bytes[i] % alphabet.length];
  }
  return prefix + key;
}

// ── QR Code ─────────────────────────────────────────────────────────────────
import QRCode from 'qrcode';

export function generateQRSvg(text, errorCorrectionLevel = 'M') {
  if (!text) return '';
  try {
    const qr = QRCode.create(text, { errorCorrectionLevel });
    const { data, size } = qr.modules;
    const margin = 2;
    const total = size + margin * 2;

    let paths = '';
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (data[y * size + x]) {
          paths += `M${x + margin},${y + margin}h1v1h-1z`;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" shape-rendering="crispEdges">` +
      `<rect width="${total}" height="${total}" fill="white"/>` +
      `<path d="${paths}" fill="black"/>` +
      `</svg>`;
  } catch {
    return '';
  }
}

// ── Lorem Ipsum ──────────────────────────────────────────────────────────────
const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'at', 'vero', 'eos',
  'accusamus', 'iusto', 'odio', 'dignissimos', 'ducimus', 'blanditiis',
  'praesentium', 'voluptatum', 'deleniti', 'atque', 'corrupti', 'quos', 'dolores',
  'quas', 'molestias', 'excepturi', 'obcaecati', 'cupiditate', 'provident',
  'similique', 'architecto', 'beatae', 'vitae', 'dicta', 'explicabo', 'nemo',
  'ipsam', 'voluptatem', 'quia', 'voluptas', 'aspernatur', 'odit', 'fugit',
  'consequuntur', 'magni', 'dolorem', 'numquam', 'eius', 'modi', 'tempora',
  'quaerat', 'voluptatibus', 'maiores', 'alias', 'perferendis', 'doloribus',
  'asperiores', 'repellat',
];

function randomWord() {
  return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
}

function generateSentence() {
  const len = 8 + Math.floor(Math.random() * 12); // 8-19 words
  const words = Array.from({ length: len }, randomWord);
  words[0] = words[0][0].toUpperCase() + words[0].slice(1);
  return words.join(' ') + '.';
}

function generateParagraph() {
  const count = 3 + Math.floor(Math.random() * 4); // 3-6 sentences
  return Array.from({ length: count }, generateSentence).join(' ');
}

export function generateLoremIpsum(count = 1, unit = 'paragraphs') {
  if (unit === 'words') {
    const words = Array.from({ length: count }, randomWord);
    words[0] = words[0][0].toUpperCase() + words[0].slice(1);
    return words.join(' ');
  }
  if (unit === 'sentences') {
    return Array.from({ length: count }, generateSentence).join(' ');
  }
  // paragraphs
  return Array.from({ length: count }, generateParagraph).join('\n\n');
}
