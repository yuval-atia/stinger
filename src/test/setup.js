import '@testing-library/jest-dom';

// Web Crypto API polyfill for Node/jsdom
if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.subtle) {
  const { webcrypto } = await import('node:crypto');
  globalThis.crypto = webcrypto;
}
