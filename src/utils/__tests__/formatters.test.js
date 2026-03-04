import { describe, it, expect } from 'vitest';
import {
  formatJSON, minifyJSON,
  formatSQL, minifySQL,
  formatXML, minifyXML,
  formatCSS, minifyCSS,
  formatHTML, minifyHTML,
} from '../formatters';

describe('JSON formatter', () => {
  it('formats valid JSON', () => {
    expect(formatJSON('{"a":1}')).toBe('{\n  "a": 1\n}');
  });

  it('returns error for invalid JSON', () => {
    expect(formatJSON('{bad}')).toBe('Error: Invalid JSON');
  });

  it('minifies JSON', () => {
    expect(minifyJSON('{\n  "a": 1\n}')).toBe('{"a":1}');
  });

  it('minify returns error for invalid JSON', () => {
    expect(minifyJSON('{bad}')).toBe('Error: Invalid JSON');
  });
});

describe('SQL formatter', () => {
  it('formats a simple SELECT', () => {
    const formatted = formatSQL('SELECT id, name FROM users WHERE active = 1');
    expect(formatted).toContain('SELECT');
    expect(formatted).toContain('FROM');
    expect(formatted).toContain('WHERE');
    expect(formatted.split('\n').length).toBeGreaterThan(1);
  });

  it('minifies SQL', () => {
    const result = minifySQL('SELECT  id\nFROM  users\nWHERE  active = 1');
    expect(result).not.toContain('\n');
  });
});

describe('XML formatter', () => {
  it('formats nested XML', () => {
    const input = '<root><child>text</child></root>';
    const formatted = formatXML(input);
    expect(formatted).toContain('  <child>');
    expect(formatted.split('\n').length).toBeGreaterThanOrEqual(3);
  });

  it('minifies XML', () => {
    const input = '<root>\n  <child>\n    text\n  </child>\n</root>';
    const result = minifyXML(input);
    expect(result).not.toContain('\n');
  });
});

describe('CSS formatter', () => {
  it('formats a CSS rule', () => {
    const formatted = formatCSS('body{color:red;margin:0}');
    expect(formatted).toContain('{\n');
    expect(formatted).toContain('color:red;');
  });

  it('minifies CSS', () => {
    const result = minifyCSS('body {\n  color: red;\n  margin: 0;\n}');
    expect(result).not.toContain('\n');
  });
});

describe('HTML formatter', () => {
  it('formats nested HTML', () => {
    const input = '<div><p>hello</p></div>';
    const formatted = formatHTML(input);
    expect(formatted).toContain('  <p>');
  });

  it('minifies HTML', () => {
    const result = minifyHTML('<div>\n  <p>hello</p>\n</div>');
    expect(result).not.toContain('\n');
  });

  it('removes comments on minify', () => {
    const result = minifyHTML('<div><!-- comment --><p>hi</p></div>');
    expect(result).not.toContain('<!--');
  });
});
