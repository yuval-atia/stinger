/**
 * IPv4 CIDR subnet calculator using pure bit math.
 * Returns { result, error } where result has network info fields.
 */

export function calculateSubnet(input) {
  try {
    const trimmed = input.trim();
    let ip, cidr;

    if (trimmed.includes('/')) {
      const [ipPart, cidrPart] = trimmed.split('/');
      ip = parseIp(ipPart.trim());
      cidr = parseInt(cidrPart.trim(), 10);
    } else {
      ip = parseIp(trimmed);
      cidr = 32;
    }

    if (ip === null) {
      return { result: null, error: 'Invalid IPv4 address' };
    }

    if (isNaN(cidr) || cidr < 0 || cidr > 32) {
      return { result: null, error: 'CIDR prefix must be 0-32' };
    }

    const mask = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const network = (ip & mask) >>> 0;
    const broadcast = (network | ~mask) >>> 0;
    const totalHosts = Math.pow(2, 32 - cidr);
    const usableHosts = cidr >= 31 ? totalHosts : totalHosts - 2;
    const firstHost = cidr >= 31 ? network : (network + 1) >>> 0;
    const lastHost = cidr >= 31 ? broadcast : (broadcast - 1) >>> 0;
    const wildcardMask = (~mask) >>> 0;

    // Determine class
    const firstOctet = (ip >>> 24) & 0xFF;
    let ipClass;
    if (firstOctet < 128) ipClass = 'A';
    else if (firstOctet < 192) ipClass = 'B';
    else if (firstOctet < 224) ipClass = 'C';
    else if (firstOctet < 240) ipClass = 'D (Multicast)';
    else ipClass = 'E (Reserved)';

    // Private range check
    const isPrivate =
      (firstOctet === 10) ||
      (firstOctet === 172 && ((ip >>> 16) & 0xFF) >= 16 && ((ip >>> 16) & 0xFF) <= 31) ||
      (firstOctet === 192 && ((ip >>> 16) & 0xFF) === 168);

    return {
      result: {
        ip: formatIp(ip),
        cidr,
        networkAddress: formatIp(network),
        broadcastAddress: formatIp(broadcast),
        subnetMask: formatIp(mask),
        wildcardMask: formatIp(wildcardMask),
        firstHost: formatIp(firstHost),
        lastHost: formatIp(lastHost),
        totalHosts: totalHosts.toLocaleString(),
        usableHosts: Math.max(0, usableHosts).toLocaleString(),
        ipClass,
        isPrivate: isPrivate ? 'Yes' : 'No',
        binaryMask: toBinary(mask),
      },
      error: null,
    };
  } catch (e) {
    return { result: null, error: e.message || 'Calculation failed' };
  }
}

function parseIp(str) {
  const parts = str.split('.');
  if (parts.length !== 4) return null;

  let result = 0;
  for (let i = 0; i < 4; i++) {
    const n = parseInt(parts[i], 10);
    if (isNaN(n) || n < 0 || n > 255 || parts[i] !== String(n)) return null;
    result = (result * 256 + n) >>> 0;
  }
  return result;
}

function formatIp(num) {
  return [
    (num >>> 24) & 0xFF,
    (num >>> 16) & 0xFF,
    (num >>> 8) & 0xFF,
    num & 0xFF,
  ].join('.');
}

function toBinary(num) {
  return [
    ((num >>> 24) & 0xFF).toString(2).padStart(8, '0'),
    ((num >>> 16) & 0xFF).toString(2).padStart(8, '0'),
    ((num >>> 8) & 0xFF).toString(2).padStart(8, '0'),
    (num & 0xFF).toString(2).padStart(8, '0'),
  ].join('.');
}
