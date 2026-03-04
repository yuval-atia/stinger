// ── UUID v4 ──────────────────────────────────────────────────────────────────
function generateUUIDv4() {
  return crypto.randomUUID();
}

// ── UUID v1 (timestamp-based) ────────────────────────────────────────────────
let _v1ClockSeq = null;
let _v1LastTimestamp = null;

function generateUUIDv1() {
  const UUID_EPOCH_OFFSET = 122192928000000000n;
  const now = BigInt(Date.now()) * 10000n + UUID_EPOCH_OFFSET;

  if (_v1ClockSeq === null || now <= _v1LastTimestamp) {
    const buf = new Uint8Array(2);
    crypto.getRandomValues(buf);
    _v1ClockSeq = ((buf[0] & 0x3f) << 8) | buf[1];
  }
  _v1LastTimestamp = now;

  const timeLow = Number(now & 0xffffffffn);
  const timeMid = Number((now >> 32n) & 0xffffn);
  const timeHiAndVersion = Number((now >> 48n) & 0x0fffn) | 0x1000;

  const clockSeqHi = ((_v1ClockSeq >> 8) & 0x3f) | 0x80;
  const clockSeqLow = _v1ClockSeq & 0xff;

  const node = new Uint8Array(6);
  crypto.getRandomValues(node);
  node[0] |= 0x01;

  const hex = (n, len) => n.toString(16).padStart(len, '0');
  return [
    hex(timeLow, 8),
    hex(timeMid, 4),
    hex(timeHiAndVersion, 4),
    hex(clockSeqHi, 2) + hex(clockSeqLow, 2),
    Array.from(node, (b) => hex(b, 2)).join(''),
  ].join('-');
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
  const len = 8 + Math.floor(Math.random() * 12);
  const words = Array.from({ length: len }, randomWord);
  words[0] = words[0][0].toUpperCase() + words[0].slice(1);
  return words.join(' ') + '.';
}

function generateParagraph() {
  const count = 3 + Math.floor(Math.random() * 4);
  return Array.from({ length: count }, generateSentence).join(' ');
}

function generateLoremIpsum(count = 1, unit = 'paragraphs') {
  if (unit === 'words') {
    const words = Array.from({ length: count }, randomWord);
    words[0] = words[0][0].toUpperCase() + words[0].slice(1);
    return words.join(' ');
  }
  if (unit === 'sentences') {
    return Array.from({ length: count }, generateSentence).join(' ');
  }
  return Array.from({ length: count }, generateParagraph).join('\n\n');
}
