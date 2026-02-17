export function permsToOctal(perms) {
  const toDigit = (p) => (p.r ? 4 : 0) + (p.w ? 2 : 0) + (p.x ? 1 : 0);
  return `${toDigit(perms.owner)}${toDigit(perms.group)}${toDigit(perms.other)}`;
}

export function permsToSymbolic(perms) {
  const toStr = (p) => (p.r ? 'r' : '-') + (p.w ? 'w' : '-') + (p.x ? 'x' : '-');
  return toStr(perms.owner) + toStr(perms.group) + toStr(perms.other);
}

export function octalToPerms(octal) {
  const clean = octal.replace(/\D/g, '').padStart(3, '0').slice(-3);
  const digits = clean.split('').map(Number);
  const fromDigit = (d) => ({ r: !!(d & 4), w: !!(d & 2), x: !!(d & 1) });
  return { owner: fromDigit(digits[0]), group: fromDigit(digits[1]), other: fromDigit(digits[2]) };
}

export const PRESETS = [
  { label: '755', desc: 'Owner rwx, others rx', octal: '755' },
  { label: '644', desc: 'Owner rw, others r', octal: '644' },
  { label: '700', desc: 'Owner rwx only', octal: '700' },
  { label: '600', desc: 'Owner rw only', octal: '600' },
  { label: '777', desc: 'Full access', octal: '777' },
  { label: '444', desc: 'Read-only', octal: '444' },
];
