export function calculateJsonStats(data) {
  if (data === null || data === undefined) {
    return null;
  }

  const jsonString = JSON.stringify(data);
  const sizeBytes = new Blob([jsonString]).size;

  return {
    sizeBytes,
    sizeFormatted: formatSize(sizeBytes),
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
