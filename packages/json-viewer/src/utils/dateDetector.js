// Unix timestamp in seconds (10 digits, reasonable range: 1970-2100)
const UNIX_SECONDS_PATTERN = /^[0-9]{10}$/;
// Unix timestamp in milliseconds (13 digits)
const UNIX_MS_PATTERN = /^[0-9]{13}$/;
// ISO 8601 formats
const ISO_8601_PATTERN = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:?\d{2})?)?$/;
// Common date formats
const COMMON_DATE_PATTERNS = [
  /^\d{4}\/\d{2}\/\d{2}$/,
  /^\d{2}\/\d{2}\/\d{4}$/,
  /^\d{2}-\d{2}-\d{4}$/,
  /^[A-Z][a-z]{2}\s\d{1,2},?\s\d{4}$/,
  /^\d{1,2}\s[A-Z][a-z]{2}\s\d{4}$/,
];

const MIN_TIMESTAMP = 0;
const MAX_TIMESTAMP = 4102444800;
const MIN_TIMESTAMP_MS = 0;
const MAX_TIMESTAMP_MS = 4102444800000;

export function detectDateFormat(str) {
  if (typeof str !== 'string' || str.length < 8 || str.length > 30) return null;

  const trimmed = str.trim();

  if (UNIX_SECONDS_PATTERN.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    if (num >= MIN_TIMESTAMP && num <= MAX_TIMESTAMP) {
      return {
        type: 'Unix Timestamp (seconds)',
        date: new Date(num * 1000),
        original: trimmed,
      };
    }
  }

  if (UNIX_MS_PATTERN.test(trimmed)) {
    const num = parseInt(trimmed, 10);
    if (num >= MIN_TIMESTAMP_MS && num <= MAX_TIMESTAMP_MS) {
      return {
        type: 'Unix Timestamp (milliseconds)',
        date: new Date(num),
        original: trimmed,
      };
    }
  }

  if (ISO_8601_PATTERN.test(trimmed)) {
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      return {
        type: 'ISO 8601',
        date,
        original: trimmed,
      };
    }
  }

  for (const pattern of COMMON_DATE_PATTERNS) {
    if (pattern.test(trimmed)) {
      const date = new Date(trimmed);
      if (!isNaN(date.getTime())) {
        return {
          type: 'Date String',
          date,
          original: trimmed,
        };
      }
    }
  }

  return null;
}

export function formatDateInfo(dateInfo) {
  if (!dateInfo) return null;

  const { date, type } = dateInfo;

  const formatted = date.toLocaleString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });

  return {
    formatted,
    type,
    iso: date.toISOString(),
  };
}
