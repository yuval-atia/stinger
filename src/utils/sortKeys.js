/**
 * Recursively sort all object keys in a JSON value.
 * @param {*} data - The JSON value to sort
 * @param {'asc'|'desc'} direction - Sort direction
 * @returns {*} New value with sorted object keys
 */
export function sortObjectKeys(data, direction = 'asc') {
  if (data === null || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map((item) => sortObjectKeys(item, direction));

  const keys = Object.keys(data);
  keys.sort((a, b) => {
    const cmp = a.localeCompare(b, undefined, { sensitivity: 'base' });
    return direction === 'desc' ? -cmp : cmp;
  });

  const result = {};
  for (const key of keys) {
    result[key] = sortObjectKeys(data[key], direction);
  }
  return result;
}
