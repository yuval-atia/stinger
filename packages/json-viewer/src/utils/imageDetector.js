const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|tiff?)(\?.*)?$/i;
const DATA_URL_IMAGE = /^data:image\/(png|jpeg|jpg|gif|webp|svg\+xml|bmp|ico);base64,/i;
const IMAGE_CDN_PATTERNS = [
  /imgur\.com/i,
  /cloudinary\.com/i,
  /imgix\.net/i,
  /unsplash\.com/i,
  /pexels\.com/i,
  /giphy\.com/i,
  /tenor\.com/i,
];

export function isImageUrl(str) {
  if (typeof str !== 'string' || str.length < 10) return false;

  // Check data URLs
  if (DATA_URL_IMAGE.test(str)) return true;

  // Check if it's a valid URL
  try {
    const url = new URL(str);
    if (!['http:', 'https:'].includes(url.protocol)) return false;

    // Check file extension
    if (IMAGE_EXTENSIONS.test(url.pathname)) return true;

    // Check known image CDNs
    if (IMAGE_CDN_PATTERNS.some(pattern => pattern.test(url.hostname))) return true;

    return false;
  } catch {
    return false;
  }
}
