export function jsonToTypeScript(jsonStr, rootName = 'Root') {
  const data = JSON.parse(jsonStr);
  const interfaces = new Map();

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function singularize(str) {
    if (str.endsWith('ies')) return str.slice(0, -3) + 'y';
    if (str.endsWith('ses') || str.endsWith('xes') || str.endsWith('zes')) return str.slice(0, -2);
    if (str.endsWith('s') && !str.endsWith('ss')) return str.slice(0, -1);
    return str;
  }

  function safeKey(key) {
    return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
  }

  function inferType(value, name) {
    if (value === null || value === undefined) return 'null';
    if (Array.isArray(value)) {
      if (value.length === 0) return 'unknown[]';
      const types = new Set(value.map(item => inferType(item, singularize(name))));
      const typeStr = [...types].join(' | ');
      return types.size === 1 ? `${typeStr}[]` : `(${typeStr})[]`;
    }
    if (typeof value === 'object') {
      const interfaceName = capitalize(name);
      generateInterface(value, interfaceName);
      return interfaceName;
    }
    return typeof value;
  }

  function generateInterface(obj, name) {
    if (interfaces.has(name)) return;
    const fields = [];
    for (const [key, value] of Object.entries(obj)) {
      const type = inferType(value, key);
      const isNullable = value === null;
      fields.push(`  ${safeKey(key)}: ${isNullable ? 'unknown' : type};`);
    }
    interfaces.set(name, `interface ${name} {\n${fields.join('\n')}\n}`);
  }

  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
      generateInterface(data[0], rootName);
      const parts = [...interfaces.values()];
      parts.push(`type ${rootName}List = ${rootName}[];`);
      return parts.join('\n\n');
    }
    const itemType = data.length > 0 ? inferType(data[0], 'Item') : 'unknown';
    return `type ${rootName} = ${itemType}[];`;
  }

  if (typeof data === 'object' && data !== null) {
    generateInterface(data, rootName);
    return [...interfaces.values()].join('\n\n');
  }

  return `type ${rootName} = ${typeof data};`;
}
