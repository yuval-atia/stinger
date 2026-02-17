export function calculateJsonStats(data) {
  if (data === null || data === undefined) {
    return null;
  }

  const jsonString = JSON.stringify(data);
  const sizeBytes = new Blob([jsonString]).size;

  let keys = 0;
  let maxDepth = 0;
  let arrays = 0;

  function walk(val, depth) {
    if (depth > maxDepth) maxDepth = depth;
    if (val === null || typeof val !== 'object') return;
    if (Array.isArray(val)) {
      arrays++;
      val.forEach((item) => walk(item, depth + 1));
    } else {
      const entries = Object.entries(val);
      keys += entries.length;
      entries.forEach(([, v]) => walk(v, depth + 1));
    }
  }

  walk(data, 0);

  return {
    sizeBytes,
    sizeFormatted: formatSize(sizeBytes),
    keys,
    maxDepth,
    arrays,
  };
}

function formatSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
