function parseCsv(text) {
  const rows = [];
  let current = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        current.push(field);
        field = '';
      } else if (ch === '\n' || (ch === '\r' && text[i + 1] === '\n')) {
        current.push(field);
        field = '';
        rows.push(current);
        current = [];
        if (ch === '\r') i++;
      } else if (ch === '\r') {
        current.push(field);
        field = '';
        rows.push(current);
        current = [];
      } else {
        field += ch;
      }
    }
  }

  current.push(field);
  if (current.length > 1 || current[0] !== '') {
    rows.push(current);
  }

  return rows;
}

export function csvToJson(csv) {
  if (!csv.trim()) return { result: '', error: '' };

  try {
    const rows = parseCsv(csv);
    if (rows.length < 2) return { result: JSON.stringify([], null, 2), error: '' };

    const headers = rows[0];
    const data = rows.slice(1).filter(r => r.some(f => f !== '')).map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        const val = row[i] ?? '';
        // auto-detect numbers and booleans
        if (val === 'true') obj[h] = true;
        else if (val === 'false') obj[h] = false;
        else if (val === 'null') obj[h] = null;
        else if (val !== '' && !isNaN(val) && val.trim() !== '') obj[h] = Number(val);
        else obj[h] = val;
      });
      return obj;
    });

    return { result: JSON.stringify(data, null, 2), error: '' };
  } catch {
    return { result: '', error: 'Failed to parse CSV' };
  }
}

export function jsonToCsv(jsonStr) {
  if (!jsonStr.trim()) return { result: '', error: '' };

  try {
    const data = JSON.parse(jsonStr);
    if (!Array.isArray(data)) return { result: '', error: 'JSON must be an array of objects' };
    if (data.length === 0) return { result: '', error: '' };

    const headers = [...new Set(data.flatMap(Object.keys))];

    const escapeField = (val) => {
      const str = String(val ?? '');
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const headerRow = headers.map(escapeField).join(',');
    const dataRows = data.map(row =>
      headers.map(h => escapeField(row[h])).join(',')
    );

    return { result: [headerRow, ...dataRows].join('\n'), error: '' };
  } catch {
    return { result: '', error: 'Invalid JSON' };
  }
}
