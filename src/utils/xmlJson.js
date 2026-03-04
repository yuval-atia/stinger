/**
 * Bidirectional XML <-> JSON conversion using DOMParser (no external deps).
 */

/**
 * Convert XML string to a JSON object.
 * Returns { result, error }
 */
export function xmlToJson(xmlStr) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlStr, 'text/xml');

    const errorNode = doc.querySelector('parsererror');
    if (errorNode) {
      return { result: null, error: 'Invalid XML: ' + errorNode.textContent.split('\n')[0] };
    }

    const json = nodeToJson(doc.documentElement);
    return { result: json, error: null };
  } catch (e) {
    return { result: null, error: e.message || 'Failed to parse XML' };
  }
}

function nodeToJson(node) {
  const obj = {};

  // Attributes
  if (node.attributes && node.attributes.length > 0) {
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i];
      obj[`@${attr.name}`] = attr.value;
    }
  }

  // Child nodes
  const children = node.childNodes;
  let textContent = '';

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    if (child.nodeType === Node.TEXT_NODE || child.nodeType === Node.CDATA_SECTION_NODE) {
      textContent += child.nodeValue;
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const childJson = nodeToJson(child);
      const tagName = child.nodeName;

      if (obj[tagName] !== undefined) {
        // Convert to array if multiple children with same name
        if (!Array.isArray(obj[tagName])) {
          obj[tagName] = [obj[tagName]];
        }
        obj[tagName].push(childJson);
      } else {
        obj[tagName] = childJson;
      }
    }
  }

  // If only text content (leaf node)
  const hasChildren = Object.keys(obj).length > 0;
  const trimmed = textContent.trim();

  if (!hasChildren && trimmed) {
    return parseValue(trimmed);
  }

  if (hasChildren && trimmed) {
    obj['#text'] = trimmed;
  }

  return hasChildren ? obj : trimmed || '';
}

function parseValue(str) {
  if (str === 'true') return true;
  if (str === 'false') return false;
  if (str === 'null') return null;
  const num = Number(str);
  if (!isNaN(num) && str !== '') return num;
  return str;
}

/**
 * Convert JSON to XML string.
 * Returns { result, error }
 */
export function jsonToXml(jsonStr) {
  try {
    const data = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;

    if (typeof data !== 'object' || data === null) {
      return { result: null, error: 'Input must be a JSON object' };
    }

    const keys = Object.keys(data);
    let xml;

    if (keys.length === 1 && typeof data[keys[0]] === 'object' && !Array.isArray(data[keys[0]])) {
      // Single root key — use it as root element
      xml = '<?xml version="1.0" encoding="UTF-8"?>\n' + objectToXml(keys[0], data[keys[0]], 0);
    } else {
      // Wrap in <root>
      xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
      for (const [key, value] of Object.entries(data)) {
        xml += valueToXml(key, value, 1);
      }
      xml += '</root>';
    }

    return { result: xml, error: null };
  } catch (e) {
    return { result: null, error: e.message || 'Failed to convert JSON to XML' };
  }
}

function objectToXml(tagName, obj, indent) {
  const pad = '  '.repeat(indent);
  const attrs = [];
  const children = [];

  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith('@')) {
      attrs.push(` ${key.slice(1)}="${escapeXml(String(value))}"`);
    } else if (key === '#text') {
      children.push({ type: 'text', value: String(value) });
    } else {
      children.push({ type: 'element', key, value });
    }
  }

  const attrStr = attrs.join('');

  if (children.length === 0) {
    return `${pad}<${tagName}${attrStr}/>\n`;
  }

  // Check if only text content
  if (children.length === 1 && children[0].type === 'text') {
    return `${pad}<${tagName}${attrStr}>${escapeXml(children[0].value)}</${tagName}>\n`;
  }

  let xml = `${pad}<${tagName}${attrStr}>\n`;
  for (const child of children) {
    if (child.type === 'text') {
      xml += `${'  '.repeat(indent + 1)}${escapeXml(child.value)}\n`;
    } else {
      xml += valueToXml(child.key, child.value, indent + 1);
    }
  }
  xml += `${pad}</${tagName}>\n`;
  return xml;
}

function valueToXml(key, value, indent) {
  const pad = '  '.repeat(indent);

  if (Array.isArray(value)) {
    return value.map((item) => valueToXml(key, item, indent)).join('');
  }

  if (value === null || value === undefined) {
    return `${pad}<${key}/>\n`;
  }

  if (typeof value === 'object') {
    return objectToXml(key, value, indent);
  }

  return `${pad}<${key}>${escapeXml(String(value))}</${key}>\n`;
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
