// Tokenize input by splitting on spaces, hyphens, underscores, and camelCase boundaries
export function tokenize(input) {
  if (!input) return [];
  return input
    // Insert boundary before uppercase letters that follow lowercase letters (camelCase)
    .replace(/([a-z])([A-Z])/g, '$1\0$2')
    // Insert boundary before uppercase letter followed by lowercase (e.g. "XMLParser" → "XML\0Parser")
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1\0$2')
    // Split on delimiters and the inserted boundaries
    .split(/[\s\-_\0]+/)
    .filter(Boolean);
}

export function toCamelCase(tokens) {
  return tokens
    .map((t, i) =>
      i === 0 ? t.toLowerCase() : t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()
    )
    .join('');
}

export function toPascalCase(tokens) {
  return tokens
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
    .join('');
}

export function toSnakeCase(tokens) {
  return tokens.map((t) => t.toLowerCase()).join('_');
}

export function toKebabCase(tokens) {
  return tokens.map((t) => t.toLowerCase()).join('-');
}

export function toConstantCase(tokens) {
  return tokens.map((t) => t.toUpperCase()).join('_');
}

export function toTitleCase(tokens) {
  return tokens
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
    .join(' ');
}
