const ATTR_MAP = {
  'class': 'className',
  'for': 'htmlFor',
  'tabindex': 'tabIndex',
  'readonly': 'readOnly',
  'maxlength': 'maxLength',
  'cellpadding': 'cellPadding',
  'cellspacing': 'cellSpacing',
  'colspan': 'colSpan',
  'rowspan': 'rowSpan',
  'enctype': 'encType',
  'crossorigin': 'crossOrigin',
  'autocomplete': 'autoComplete',
  'autofocus': 'autoFocus',
  'autoplay': 'autoPlay',
  'formaction': 'formAction',
  'novalidate': 'noValidate',
  'srcset': 'srcSet',
  'accesskey': 'accessKey',
  'charset': 'charSet',
  'frameborder': 'frameBorder',
  'allowfullscreen': 'allowFullScreen',
  'contenteditable': 'contentEditable',
  'spellcheck': 'spellCheck',
  'viewbox': 'viewBox',
  'preserveaspectratio': 'preserveAspectRatio',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-dashoffset': 'strokeDashoffset',
  'font-size': 'fontSize',
  'font-family': 'fontFamily',
  'text-anchor': 'textAnchor',
  'dominant-baseline': 'dominantBaseline',
  'clip-path': 'clipPath',
  'fill-opacity': 'fillOpacity',
  'stroke-opacity': 'strokeOpacity',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
  'xlink:href': 'xlinkHref',
  'xml:space': 'xmlSpace',
};

const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

function styleStringToObject(styleStr) {
  const pairs = styleStr.split(';').filter(s => s.trim());
  const entries = pairs.map(pair => {
    const [prop, ...valParts] = pair.split(':');
    if (!prop || valParts.length === 0) return null;
    const camelProp = prop.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const value = valParts.join(':').trim();
    // Check if value is a number (for unitless values)
    const numVal = parseFloat(value);
    if (!isNaN(numVal) && String(numVal) === value) {
      return `${camelProp}: ${numVal}`;
    }
    return `${camelProp}: "${value}"`;
  }).filter(Boolean);
  return `{{ ${entries.join(', ')} }}`;
}

export function htmlToJsx(html) {
  if (!html) return '';

  let result = html;

  // Remove HTML comments
  result = result.replace(/<!--[\s\S]*?-->/g, '{/* comment */}');

  // Convert style strings to objects
  result = result.replace(/style="([^"]*)"/g, (_, styleStr) => {
    return `style={${styleStringToObject(styleStr)}}`;
  });
  result = result.replace(/style='([^']*)'/g, (_, styleStr) => {
    return `style={${styleStringToObject(styleStr)}}`;
  });

  // Convert event handler attributes (onclick, onchange, etc.)
  result = result.replace(/\bon([a-z]+)=/gi, (match, event) => {
    return `on${event.charAt(0).toUpperCase() + event.slice(1)}=`;
  });

  // Convert known attributes
  for (const [htmlAttr, jsxAttr] of Object.entries(ATTR_MAP)) {
    // Word-boundary match to avoid partial replacements
    const regex = new RegExp(`\\b${htmlAttr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=`, 'g');
    result = result.replace(regex, `${jsxAttr}=`);
  }

  // Self-close void elements that aren't already self-closed
  for (const tag of VOID_ELEMENTS) {
    const regex = new RegExp(`<(${tag})(\\s[^>]*)?>(?!\\s*<\\/${tag}>)`, 'gi');
    result = result.replace(regex, (match, tagName, attrs) => {
      if (match.endsWith('/>')) return match;
      return `<${tagName}${attrs || ''} />`;
    });
  }

  return result;
}
