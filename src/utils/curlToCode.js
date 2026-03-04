/**
 * Parse a cURL command string and generate equivalent code in multiple languages.
 * Returns { request, error } where request has { method, url, headers, body }.
 */

export function parseCurl(curlStr) {
  try {
    const raw = curlStr.trim().replace(/\\\n/g, ' ').replace(/\\\r\n/g, ' ');
    if (!raw.toLowerCase().startsWith('curl')) {
      return { request: null, error: 'Command must start with "curl"' };
    }

    const tokens = tokenize(raw);
    const request = { method: 'GET', url: '', headers: {}, body: null };

    let i = 1; // skip "curl"
    while (i < tokens.length) {
      const token = tokens[i];

      if (token === '-X' || token === '--request') {
        request.method = (tokens[++i] || '').toUpperCase();
      } else if (token === '-H' || token === '--header') {
        const header = tokens[++i] || '';
        const colonIdx = header.indexOf(':');
        if (colonIdx > 0) {
          const key = header.slice(0, colonIdx).trim();
          const val = header.slice(colonIdx + 1).trim();
          request.headers[key] = val;
        }
      } else if (token === '-d' || token === '--data' || token === '--data-raw' || token === '--data-binary') {
        request.body = tokens[++i] || '';
        if (request.method === 'GET') request.method = 'POST';
      } else if (token === '-u' || token === '--user') {
        const creds = tokens[++i] || '';
        request.headers['Authorization'] = 'Basic ' + btoa(creds);
      } else if (token === '-A' || token === '--user-agent') {
        request.headers['User-Agent'] = tokens[++i] || '';
      } else if (token === '--compressed') {
        // ignore, just a flag
      } else if (token === '-k' || token === '--insecure') {
        // ignore
      } else if (token === '-L' || token === '--location') {
        // ignore
      } else if (token === '-s' || token === '--silent') {
        // ignore
      } else if (!token.startsWith('-') && !request.url) {
        request.url = token;
      }

      i++;
    }

    if (!request.url) {
      return { request: null, error: 'No URL found in cURL command' };
    }

    return { request, error: null };
  } catch (e) {
    return { request: null, error: e.message || 'Failed to parse cURL command' };
  }
}

function tokenize(str) {
  const tokens = [];
  let i = 0;
  while (i < str.length) {
    // skip whitespace
    while (i < str.length && /\s/.test(str[i])) i++;
    if (i >= str.length) break;

    if (str[i] === "'" || str[i] === '"') {
      const quote = str[i];
      i++;
      let token = '';
      while (i < str.length && str[i] !== quote) {
        if (str[i] === '\\' && i + 1 < str.length) {
          token += str[++i];
        } else {
          token += str[i];
        }
        i++;
      }
      i++; // skip closing quote
      tokens.push(token);
    } else {
      let token = '';
      while (i < str.length && !/\s/.test(str[i])) {
        token += str[i];
        i++;
      }
      tokens.push(token);
    }
  }
  return tokens;
}

function formatHeaders(headers) {
  return Object.entries(headers);
}

export function toFetch(request) {
  const { method, url, headers, body } = request;
  const opts = [];

  if (method !== 'GET') opts.push(`  method: '${method}',`);

  const hEntries = formatHeaders(headers);
  if (hEntries.length > 0) {
    opts.push('  headers: {');
    hEntries.forEach(([k, v]) => opts.push(`    '${k}': '${escapeStr(v)}',`));
    opts.push('  },');
  }

  if (body) {
    const isJson = tryJson(body);
    opts.push(`  body: ${isJson ? `JSON.stringify(${body})` : `'${escapeStr(body)}'`},`);
  }

  if (opts.length === 0) {
    return `const response = await fetch('${escapeStr(url)}');
const data = await response.json();`;
  }

  return `const response = await fetch('${escapeStr(url)}', {
${opts.join('\n')}
});
const data = await response.json();`;
}

export function toAxios(request) {
  const { method, url, headers, body } = request;
  const args = [`'${escapeStr(url)}'`];

  if (body || Object.keys(headers).length > 0) {
    if (body) {
      const isJson = tryJson(body);
      args.push(isJson ? body : `'${escapeStr(body)}'`);
    } else if (Object.keys(headers).length > 0 && method.toUpperCase() !== 'GET') {
      args.push('null');
    }
  }

  const config = [];
  const hEntries = formatHeaders(headers);
  if (hEntries.length > 0) {
    config.push('  headers: {');
    hEntries.forEach(([k, v]) => config.push(`    '${k}': '${escapeStr(v)}',`));
    config.push('  },');
  }

  if (config.length > 0) {
    args.push(`{\n${config.join('\n')}\n}`);
  }

  return `const { data } = await axios.${method.toLowerCase()}(${args.join(', ')});`;
}

export function toPython(request) {
  const { method, url, headers, body } = request;
  const lines = ['import requests', ''];

  const kwargs = [];

  const hEntries = formatHeaders(headers);
  if (hEntries.length > 0) {
    const hLines = hEntries.map(([k, v]) => `    "${k}": "${escapeStr(v)}"`).join(',\n');
    kwargs.push(`headers={\n${hLines}\n}`);
  }

  if (body) {
    const isJson = tryJson(body);
    if (isJson) {
      kwargs.push(`json=${body}`);
    } else {
      kwargs.push(`data="${escapeStr(body)}"`);
    }
  }

  const kw = kwargs.length > 0 ? `,\n    ${kwargs.join(',\n    ')}` : '';
  lines.push(`response = requests.${method.toLowerCase()}(\n    "${escapeStr(url)}"${kw}\n)`);
  lines.push('data = response.json()');

  return lines.join('\n');
}

export function toGo(request) {
  const { method, url, headers, body } = request;
  const lines = [];
  lines.push('package main');
  lines.push('');
  lines.push('import (');
  lines.push('    "fmt"');
  lines.push('    "io"');
  lines.push('    "net/http"');
  if (body) lines.push('    "strings"');
  lines.push(')');
  lines.push('');
  lines.push('func main() {');

  if (body) {
    lines.push(`    body := strings.NewReader(\`${body}\`)`);
    lines.push(`    req, err := http.NewRequest("${method}", "${escapeStr(url)}", body)`);
  } else {
    lines.push(`    req, err := http.NewRequest("${method}", "${escapeStr(url)}", nil)`);
  }
  lines.push('    if err != nil {');
  lines.push('        panic(err)');
  lines.push('    }');

  const hEntries = formatHeaders(headers);
  hEntries.forEach(([k, v]) => {
    lines.push(`    req.Header.Set("${k}", "${escapeStr(v)}")`);
  });

  lines.push('');
  lines.push('    resp, err := http.DefaultClient.Do(req)');
  lines.push('    if err != nil {');
  lines.push('        panic(err)');
  lines.push('    }');
  lines.push('    defer resp.Body.Close()');
  lines.push('');
  lines.push('    respBody, _ := io.ReadAll(resp.Body)');
  lines.push('    fmt.Println(string(respBody))');
  lines.push('}');

  return lines.join('\n');
}

function escapeStr(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function tryJson(s) {
  try {
    JSON.parse(s);
    return true;
  } catch {
    return false;
  }
}
