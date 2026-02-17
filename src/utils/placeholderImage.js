function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function generatePlaceholderSvg({ width = 400, height = 300, bgColor = '#cccccc', textColor = '#666666', text = '' }) {
  const w = Math.max(10, Math.min(width, 4000));
  const h = Math.max(10, Math.min(height, 4000));
  const displayText = text || `${w}\u00D7${h}`;
  const fontSize = Math.max(12, Math.min(w, h) / 8);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="${bgColor}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace" font-size="${fontSize}" fill="${textColor}">${escapeXml(displayText)}</text>
</svg>`;
}
