import { describe, it, expect } from 'vitest';
import { generateUUIDv4, generateUUIDv1, generateULID, decodeULIDTimestamp, generateNanoID, calcKeyEntropy } from '../generators';

describe('generateUUIDv4', () => {
  it('matches UUID v4 format', () => {
    const uuid = generateUUIDv4();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('generates unique values', () => {
    const a = generateUUIDv4();
    const b = generateUUIDv4();
    expect(a).not.toBe(b);
  });
});

describe('generateUUIDv1', () => {
  it('matches UUID v1 format (version nibble = 1)', () => {
    const uuid = generateUUIDv1();
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});

describe('generateULID', () => {
  it('is 26 characters of Crockford base32', () => {
    const ulid = generateULID();
    expect(ulid).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
    expect(ulid).toHaveLength(26);
  });
});

describe('decodeULIDTimestamp', () => {
  it('decodes a ULID timestamp close to now', () => {
    const ulid = generateULID();
    const decoded = decodeULIDTimestamp(ulid);
    const now = Date.now();
    expect(Math.abs(decoded.getTime() - now)).toBeLessThan(1000);
  });
});

describe('generateNanoID', () => {
  it('generates default length of 21', () => {
    expect(generateNanoID()).toHaveLength(21);
  });

  it('generates custom length', () => {
    expect(generateNanoID(10)).toHaveLength(10);
  });

  it('uses only characters from the default alphabet', () => {
    const id = generateNanoID();
    expect(id).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

describe('calcKeyEntropy', () => {
  it('computes entropy for lowercase+digits (pool=36)', () => {
    const result = calcKeyEntropy(32, { uppercase: false, lowercase: true, digits: true, special: false });
    // 32 * log2(36) ≈ 165
    expect(result.bits).toBe(165);
    expect(result.label).toBe('Very strong');
  });

  it('returns Weak for very short key', () => {
    const result = calcKeyEntropy(4, { uppercase: false, lowercase: true, digits: false, special: false });
    // 4 * log2(26) ≈ 18
    expect(result.bits).toBeLessThan(56);
    expect(result.label).toBe('Weak');
  });

  it('labels Strong for 80+ bits', () => {
    const result = calcKeyEntropy(16, { uppercase: true, lowercase: true, digits: false, special: false });
    // 16 * log2(52) ≈ 91
    expect(result.bits).toBeGreaterThanOrEqual(80);
    expect(result.label).toBe('Strong');
  });

  it('falls back to pool=36 when all flags false', () => {
    const result = calcKeyEntropy(32, { uppercase: false, lowercase: false, digits: false, special: false });
    expect(result.bits).toBe(165); // same as lowercase+digits
  });
});
