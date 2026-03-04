import { describe, it, expect } from 'vitest';
import { parseJson, validateJson, formatJson, minifyJson, getValueType, getPreview } from '../jsonParser';

describe('parseJson', () => {
  it('parses valid JSON', () => {
    const result = parseJson('{"a":1}');
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ a: 1 });
    expect(result.error).toBeNull();
  });

  it('returns error for invalid JSON', () => {
    const result = parseJson('{bad}');
    expect(result.success).toBe(false);
    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
  });

  it('handles arrays', () => {
    const result = parseJson('[1, 2, 3]');
    expect(result.success).toBe(true);
    expect(result.data).toEqual([1, 2, 3]);
  });

  it('handles primitives', () => {
    expect(parseJson('"hello"').data).toBe('hello');
    expect(parseJson('42').data).toBe(42);
    expect(parseJson('true').data).toBe(true);
    expect(parseJson('null').data).toBeNull();
  });
});

describe('validateJson', () => {
  it('returns valid for correct JSON', () => {
    const result = validateJson('{"key": "value"}');
    expect(result.valid).toBe(true);
    expect(result.error).toBeNull();
  });

  it('returns error details for invalid JSON', () => {
    const result = validateJson('{invalid}');
    expect(result.valid).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe('formatJson', () => {
  it('formats JSON with default indent', () => {
    const result = formatJson('{"a":1,"b":2}');
    expect(result.success).toBe(true);
    expect(result.formatted).toBe('{\n  "a": 1,\n  "b": 2\n}');
  });

  it('formats JSON with custom indent', () => {
    const result = formatJson('{"a":1}', 4);
    expect(result.formatted).toBe('{\n    "a": 1\n}');
  });

  it('returns error for invalid input', () => {
    const result = formatJson('not json');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe('minifyJson', () => {
  it('minifies formatted JSON', () => {
    const result = minifyJson('{\n  "a": 1,\n  "b": 2\n}');
    expect(result.success).toBe(true);
    expect(result.minified).toBe('{"a":1,"b":2}');
  });

  it('returns error for invalid input', () => {
    const result = minifyJson('not json');
    expect(result.success).toBe(false);
  });
});

describe('getValueType', () => {
  it('identifies null', () => expect(getValueType(null)).toBe('null'));
  it('identifies array', () => expect(getValueType([1, 2])).toBe('array'));
  it('identifies object', () => expect(getValueType({ a: 1 })).toBe('object'));
  it('identifies string', () => expect(getValueType('hello')).toBe('string'));
  it('identifies number', () => expect(getValueType(42)).toBe('number'));
  it('identifies boolean', () => expect(getValueType(true)).toBe('boolean'));
});

describe('getPreview', () => {
  it('previews null', () => expect(getPreview(null)).toBe('null'));
  it('previews string', () => expect(getPreview('hi')).toBe('"hi"'));
  it('previews number', () => expect(getPreview(42)).toBe('42'));
  it('previews boolean', () => expect(getPreview(false)).toBe('false'));
  it('previews empty array', () => expect(getPreview([])).toBe('[]'));
  it('previews non-empty array', () => expect(getPreview([1, 2, 3])).toBe('Array(3)'));
  it('previews empty object', () => expect(getPreview({})).toBe('{}'));
  it('previews non-empty object', () => expect(getPreview({ a: 1, b: 2 })).toBe('Object(2)'));
});
