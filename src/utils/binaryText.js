export function textToBinary(text) {
  if (!text) return '';
  return [...text].map(c => {
    const code = c.codePointAt(0);
    if (code > 0xFFFF) {
      return code.toString(2).padStart(21, '0');
    }
    return code.toString(2).padStart(8, '0');
  }).join(' ');
}

export function binaryToText(binary) {
  if (!binary.trim()) return { result: '', error: '' };
  try {
    const result = binary.trim().split(/\s+/).map(b => {
      const code = parseInt(b, 2);
      if (isNaN(code)) throw new Error('Invalid binary');
      return String.fromCodePoint(code);
    }).join('');
    return { result, error: '' };
  } catch {
    return { result: '', error: 'Invalid binary input' };
  }
}
