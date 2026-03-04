import { describe, it, expect } from 'vitest';
import { computeMD5, computeSHA1, computeSHA256, computeSHA512, computeHMACSHA256, computeHMACSHA512 } from '../hash';

// Known test vectors for empty string and "abc"

describe('computeMD5', () => {
  it('hashes empty string', () => {
    expect(computeMD5('')).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });

  it('hashes "abc"', () => {
    expect(computeMD5('abc')).toBe('900150983cd24fb0d6963f7d28e17f72');
  });
});

describe('computeSHA1', () => {
  it('hashes empty string', async () => {
    expect(await computeSHA1('')).toBe('da39a3ee5e6b4b0d3255bfef95601890afd80709');
  });

  it('hashes "abc"', async () => {
    expect(await computeSHA1('abc')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
  });
});

describe('computeSHA256', () => {
  it('hashes empty string', async () => {
    expect(await computeSHA256('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('hashes "abc"', async () => {
    expect(await computeSHA256('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });
});

describe('computeSHA512', () => {
  it('hashes empty string', async () => {
    expect(await computeSHA512('')).toBe(
      'cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e'
    );
  });

  it('hashes "abc"', async () => {
    expect(await computeSHA512('abc')).toBe(
      'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f'
    );
  });
});

describe('computeHMACSHA256', () => {
  it('computes HMAC-SHA256 with known key/message', async () => {
    // HMAC-SHA256("key", "The quick brown fox jumps over the lazy dog")
    const result = await computeHMACSHA256('key', 'The quick brown fox jumps over the lazy dog');
    expect(result).toBe('f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8');
  });
});

describe('computeHMACSHA512', () => {
  it('computes HMAC-SHA512 with known key/message', async () => {
    const result = await computeHMACSHA512('key', 'The quick brown fox jumps over the lazy dog');
    expect(result).toBe(
      'b42af09057bac1e2d41708e48a902e09b5ff7f12ab428a4fe86653c73dd248fb82f948a549f7b791a5b41915ee4d1ec3935357e4e2317250d0372afa2ebeeb3a'
    );
  });
});
