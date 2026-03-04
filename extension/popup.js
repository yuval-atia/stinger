// ── Tool Definitions ────────────────────────────────────────────────────────

const ALL_TOOLS = [
  { id: 'url',       label: 'URL',       icon: '/',     defaultPinned: true },
  { id: 'json',      label: 'JSON',      icon: '{ }',  defaultPinned: true },
  { id: 'jwt',       label: 'JWT',       icon: 'jwt',   defaultPinned: true },
  { id: 'base64',    label: 'Base64',    icon: 'B64',   defaultPinned: true },
  { id: 'color',     label: 'Color',     icon: '\u25cf', defaultPinned: true },
  { id: 'uuid',      label: 'UUID',      icon: '#',     defaultPinned: true },
  { id: 'timestamp', label: 'Time',      icon: '\u23f0', defaultPinned: true },
  { id: 'hash',      label: 'Hash',      icon: '#!',    defaultPinned: true },
  { id: 'jsonpath',  label: 'JSONPath',  icon: '$..',   defaultPinned: false },
  { id: 'lorem',     label: 'Lorem',     icon: 'Aa',    defaultPinned: false },
];

const DEFAULT_PINNED = ALL_TOOLS.filter(t => t.defaultPinned).map(t => t.id);

// ── State ───────────────────────────────────────────────────────────────────

let pinnedTools = [...DEFAULT_PINNED];
let activeTool = null;

// ── Storage helpers ─────────────────────────────────────────────────────────

function loadPinned() {
  return new Promise(resolve => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get({ pinnedTools: DEFAULT_PINNED }, data => {
        resolve(data.pinnedTools);
      });
    } else {
      const saved = localStorage.getItem('stingr_pinned');
      resolve(saved ? JSON.parse(saved) : DEFAULT_PINNED);
    }
  });
}

function savePinned(pinned) {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.set({ pinnedTools: pinned });
  } else {
    localStorage.setItem('stingr_pinned', JSON.stringify(pinned));
  }
}

// ── Copy helpers ────────────────────────────────────────────────────────────

function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    setTimeout(() => btn.classList.remove('copied'), 1200);
  });
}

function flashCopied(el) {
  el.classList.add('copied');
  setTimeout(() => el.classList.remove('copied'), 1200);
}

// ── Tab Bar ─────────────────────────────────────────────────────────────────

function renderTabs() {
  const bar = document.getElementById('tab-bar');
  bar.innerHTML = '';

  const toolsToShow = ALL_TOOLS.filter(t => pinnedTools.includes(t.id));

  toolsToShow.forEach(tool => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (activeTool === tool.id ? ' active' : '');
    btn.textContent = tool.label;
    btn.addEventListener('click', () => switchTool(tool.id));
    bar.appendChild(btn);
  });
}

function switchTool(id) {
  activeTool = id;
  renderTabs();
  renderTool(id);
}

// ── Tool Renderers ──────────────────────────────────────────────────────────

function renderTool(id) {
  const container = document.getElementById('tool-content');
  const renderer = TOOL_RENDERERS[id];
  if (renderer) {
    container.innerHTML = '';
    renderer(container);
  }
}

const TOOL_RENDERERS = {
  json: renderJsonTool,
  uuid: renderUuidTool,
  base64: renderBase64Tool,
  url: renderUrlParseTool,
  jwt: renderJwtTool,
  hash: renderHashTool,
  timestamp: renderTimestampTool,
  jsonpath: renderJsonPathTool,
  lorem: renderLoremTool,
  color: renderColorTool,
};

// ── JSON Tree View ──────────────────────────────────────────────────────────

function renderJsonTool(el) {
  let parsedData = null;

  function showInput() {
    el.innerHTML = `
      <textarea id="json-input" class="input-lg" placeholder="Paste JSON here..."></textarea>
      <div class="btn-row">
        <button class="btn btn-primary" id="json-parse">Parse</button>
      </div>
    `;

    const input = el.querySelector('#json-input');
    const parseBtn = el.querySelector('#json-parse');

    function doParse() {
      const text = input.value.trim();
      if (!text) return;
      try {
        parsedData = JSON.parse(text);
        showTree();
      } catch {
        let errEl = el.querySelector('#json-error');
        if (!errEl) {
          errEl = document.createElement('div');
          errEl.id = 'json-error';
          errEl.style.cssText = 'color: var(--error); font-size: 12px; margin-top: 4px';
          el.appendChild(errEl);
        }
        errEl.textContent = 'Invalid JSON';
      }
    }

    parseBtn.addEventListener('click', doParse);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) doParse();
    });

    setTimeout(() => input.focus(), 50);
  }

  function showTree() {
    el.innerHTML = `
      <div class="json-tree-header">
        <button class="btn" id="json-new">\u2190 New JSON</button>
        <button class="copy-btn" id="json-copy" style="position: static">Copy</button>
      </div>
      <div id="json-tree" class="json-tree"></div>
    `;

    const tree = el.querySelector('#json-tree');
    renderTreeNode(tree, parsedData, null, 0);

    el.querySelector('#json-new').addEventListener('click', () => {
      parsedData = null;
      showInput();
    });

    el.querySelector('#json-copy').addEventListener('click', function () {
      copyToClipboard(JSON.stringify(parsedData, null, 2), this);
    });
  }

  showInput();
}

// ── Value type detection ────────────────────────────────────────────────────

const URL_RE = /^https?:\/\/[^\s]+$/i;
const IMG_RE = /\.(png|jpe?g|gif|svg|webp|ico|bmp|avif)(\?[^\s]*)?$/i;
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COLOR_HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function detectValueType(value, key) {
  if (typeof value !== 'string') return null;
  if (URL_RE.test(value) && IMG_RE.test(value.split('?')[0])) return 'image';
  if (URL_RE.test(value)) return 'link';
  if (ISO_DATE_RE.test(value)) return 'date';
  if (EMAIL_RE.test(value)) return 'email';
  if (COLOR_HEX_RE.test(value)) return 'color';
  return null;
}

function detectNumberType(value, key) {
  if (typeof value !== 'number') return null;
  const k = String(key).toLowerCase();
  if ((k.includes('time') || k.includes('date') || k === 'exp' || k === 'iat' || k === 'nbf' || k.includes('timestamp') || k.endsWith('_at') || k.endsWith('At'))
      && value > 946684800 && value < 99999999999) {
    return 'timestamp';
  }
  if ((k.includes('time') || k.includes('date') || k.includes('timestamp') || k.endsWith('_at') || k.endsWith('At'))
      && value > 946684800000 && value < 99999999999999) {
    return 'timestamp_ms';
  }
  return null;
}

// ── Tree node renderer ──────────────────────────────────────────────────────

function renderTreeNode(container, value, key, depth) {
  const row = document.createElement('div');
  row.className = 'tree-row';
  row.style.paddingLeft = (depth * 16) + 'px';

  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;

  if (isExpandable) {
    const count = isArray ? value.length : Object.keys(value).length;
    const typeLabel = isArray ? `Array(${count})` : `Object(${count})`;

    const arrow = document.createElement('span');
    arrow.className = 'tree-arrow';
    arrow.textContent = '\u25be';
    row.appendChild(arrow);

    if (key !== null) {
      const keySpan = document.createElement('span');
      keySpan.className = 'json-key';
      keySpan.textContent = key;
      row.appendChild(keySpan);

      const colon = document.createElement('span');
      colon.className = 'tree-colon';
      colon.textContent = ' : ';
      row.appendChild(colon);
    }

    const typeSpan = document.createElement('span');
    typeSpan.className = 'tree-type';
    typeSpan.textContent = typeLabel;
    row.appendChild(typeSpan);

    container.appendChild(row);

    const children = document.createElement('div');
    children.className = 'tree-children';

    if (isArray) {
      value.forEach((item, idx) => {
        renderTreeNode(children, item, idx, depth + 1);
      });
    } else {
      Object.entries(value).forEach(([k, v]) => {
        renderTreeNode(children, v, k, depth + 1);
      });
    }

    container.appendChild(children);

    const toggle = () => {
      const isHidden = children.style.display === 'none';
      children.style.display = isHidden ? '' : 'none';
      arrow.textContent = isHidden ? '\u25be' : '\u25b8';
    };
    arrow.addEventListener('click', toggle);
    row.addEventListener('click', (e) => {
      if (e.target !== arrow) toggle();
    });

  } else {
    const spacer = document.createElement('span');
    spacer.className = 'tree-arrow-spacer';
    row.appendChild(spacer);

    if (key !== null) {
      const keySpan = document.createElement('span');
      keySpan.className = 'json-key';
      keySpan.textContent = key;
      row.appendChild(keySpan);

      const colon = document.createElement('span');
      colon.className = 'tree-colon';
      colon.textContent = ' : ';
      row.appendChild(colon);
    }

    const valType = detectValueType(value, key);
    const numType = detectNumberType(value, key);

    if (valType === 'image') {
      const valSpan = document.createElement('span');
      valSpan.className = 'json-string';
      valSpan.textContent = '"' + value + '"';
      row.appendChild(valSpan);
      const icon = document.createElement('span');
      icon.className = 'tree-type-icon';
      icon.textContent = ' \ud83d\uddbc';
      icon.title = 'Image URL';
      row.appendChild(icon);
      const preview = document.createElement('img');
      preview.className = 'tree-img-preview';
      preview.src = value;
      preview.alt = '';
      preview.loading = 'lazy';
      row.appendChild(preview);
    } else if (valType === 'link') {
      const valSpan = document.createElement('span');
      valSpan.className = 'json-string';
      valSpan.textContent = '"' + value + '"';
      row.appendChild(valSpan);
      const link = document.createElement('a');
      link.className = 'tree-type-icon tree-link';
      link.href = value;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = ' \ud83d\udd17';
      link.title = 'Open link';
      row.appendChild(link);
    } else if (valType === 'date') {
      const valSpan = document.createElement('span');
      valSpan.className = 'json-string';
      valSpan.textContent = '"' + value + '"';
      row.appendChild(valSpan);
      const icon = document.createElement('span');
      icon.className = 'tree-type-icon';
      icon.textContent = ' \ud83d\udcc5';
      icon.title = new Date(value).toLocaleString();
      row.appendChild(icon);
    } else if (valType === 'email') {
      const valSpan = document.createElement('span');
      valSpan.className = 'json-string';
      valSpan.textContent = '"' + value + '"';
      row.appendChild(valSpan);
      const link = document.createElement('a');
      link.className = 'tree-type-icon tree-link';
      link.href = 'mailto:' + value;
      link.textContent = ' \u2709';
      link.title = 'Send email';
      row.appendChild(link);
    } else if (valType === 'color') {
      const valSpan = document.createElement('span');
      valSpan.className = 'json-string';
      valSpan.textContent = '"' + value + '"';
      row.appendChild(valSpan);
      const swatch = document.createElement('span');
      swatch.className = 'tree-color-swatch';
      swatch.style.background = value;
      row.appendChild(swatch);
    } else if (numType === 'timestamp' || numType === 'timestamp_ms') {
      const valSpan = document.createElement('span');
      valSpan.className = 'json-number';
      valSpan.textContent = value;
      row.appendChild(valSpan);
      const ms = numType === 'timestamp_ms' ? value : value * 1000;
      const date = new Date(ms);
      const icon = document.createElement('span');
      icon.className = 'tree-type-icon';
      icon.textContent = ' \ud83d\udcc5';
      icon.title = date.toISOString();
      row.appendChild(icon);
      const hint = document.createElement('span');
      hint.className = 'tree-type-hint';
      hint.textContent = date.toISOString().replace('T', ' ').slice(0, 19);
      row.appendChild(hint);
    } else if (typeof value === 'string') {
      const valSpan = document.createElement('span');
      valSpan.className = 'json-string';
      valSpan.textContent = '"' + value + '"';
      row.appendChild(valSpan);
    } else if (typeof value === 'number') {
      const valSpan = document.createElement('span');
      valSpan.className = 'json-number';
      valSpan.textContent = value;
      row.appendChild(valSpan);
    } else if (typeof value === 'boolean') {
      const valSpan = document.createElement('span');
      valSpan.className = 'json-boolean';
      valSpan.textContent = value;
      row.appendChild(valSpan);
    } else {
      const valSpan = document.createElement('span');
      valSpan.className = 'json-null';
      valSpan.textContent = 'null';
      row.appendChild(valSpan);
    }

    container.appendChild(row);
  }
}

// ── UUID Generator ──────────────────────────────────────────────────────────

function renderUuidTool(el) {
  el.innerHTML = `
    <div class="btn-row">
      <button class="btn btn-primary" id="uuid-v4">UUID v4</button>
      <button class="btn" id="uuid-v1">UUID v1</button>
    </div>
    <div class="output-wrap">
      <button class="copy-btn" id="uuid-copy">Copy</button>
      <div class="output" id="uuid-output" style="min-height: 36px"></div>
    </div>
    <div style="margin-top: 4px">
      <label>Batch generate</label>
      <div class="inline-row" style="margin-top: 4px">
        <input type="number" id="uuid-count" value="5" min="1" max="100" style="width: 60px">
        <button class="btn" id="uuid-batch">Generate</button>
      </div>
    </div>
    <div class="output-wrap hidden" id="uuid-batch-wrap">
      <button class="copy-btn" id="uuid-batch-copy">Copy</button>
      <div class="output" id="uuid-batch-output" style="max-height: 150px"></div>
    </div>
  `;

  const output = el.querySelector('#uuid-output');
  const batchWrap = el.querySelector('#uuid-batch-wrap');
  const batchOutput = el.querySelector('#uuid-batch-output');

  el.querySelector('#uuid-v4').addEventListener('click', () => {
    output.textContent = generateUUIDv4();
  });

  el.querySelector('#uuid-v1').addEventListener('click', () => {
    output.textContent = generateUUIDv1();
  });

  el.querySelector('#uuid-copy').addEventListener('click', function () {
    copyToClipboard(output.textContent, this);
  });

  el.querySelector('#uuid-batch').addEventListener('click', () => {
    const count = Math.min(100, Math.max(1, parseInt(el.querySelector('#uuid-count').value) || 5));
    const uuids = Array.from({ length: count }, () => generateUUIDv4());
    batchOutput.textContent = uuids.join('\n');
    batchWrap.classList.remove('hidden');
  });

  el.querySelector('#uuid-batch-copy').addEventListener('click', function () {
    copyToClipboard(batchOutput.textContent, this);
  });

  // Auto-generate on open
  output.textContent = generateUUIDv4();
}

// ── Base64 ──────────────────────────────────────────────────────────────────

function renderBase64Tool(el) {
  el.innerHTML = `
    <textarea id="b64-input" placeholder="Enter text or Base64 string..."></textarea>
    <div class="btn-row">
      <button class="btn btn-primary" id="b64-encode">Encode</button>
      <button class="btn" id="b64-decode">Decode</button>
      <button class="btn btn-clear" id="b64-clear">Clear</button>
    </div>
    <div class="output-wrap hidden" id="b64-wrap">
      <button class="copy-btn" id="b64-copy">Copy</button>
      <div class="output" id="b64-output"></div>
    </div>
  `;

  const input = el.querySelector('#b64-input');
  const output = el.querySelector('#b64-output');
  const wrap = el.querySelector('#b64-wrap');

  function showOutput(text, isError) {
    output.textContent = text;
    output.className = 'output' + (isError ? ' error' : '');
    wrap.classList.remove('hidden');
  }

  el.querySelector('#b64-encode').addEventListener('click', () => {
    if (!input.value) return;
    showOutput(base64Encode(input.value), false);
  });

  el.querySelector('#b64-decode').addEventListener('click', () => {
    if (!input.value) return;
    const result = base64Decode(input.value);
    showOutput(result, result.startsWith('Error'));
  });

  el.querySelector('#b64-clear').addEventListener('click', () => {
    input.value = '';
    wrap.classList.add('hidden');
  });

  el.querySelector('#b64-copy').addEventListener('click', function () {
    copyToClipboard(output.textContent, this);
  });

  // Enter to encode
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      el.querySelector('#b64-encode').click();
    }
  });
}

// ── URL Parser ──────────────────────────────────────────────────────────────

function renderUrlParseTool(el) {
  el.innerHTML = `
    <textarea id="urlp-input" placeholder="Paste a URL here..." style="min-height: 56px"></textarea>
    <div class="btn-row">
      <button class="btn btn-primary" id="urlp-parse">Parse</button>
      <button class="btn" id="urlp-current">Current Tab</button>
      <button class="btn btn-clear" id="urlp-clear">Clear</button>
    </div>
    <div id="urlp-output" class="hidden"></div>
  `;

  const input = el.querySelector('#urlp-input');
  const output = el.querySelector('#urlp-output');

  function doParse() {
    const raw = input.value.trim();
    if (!raw) return;

    let url;
    try {
      url = new URL(raw);
    } catch {
      output.innerHTML = '<div style="color: var(--error); font-size: 12px; padding: 4px 0">Invalid URL</div>';
      output.classList.remove('hidden');
      return;
    }

    let html = '<div class="urlp-results">';

    const parts = [
      ['Protocol', url.protocol.replace(/:$/, '')],
      ['Host', url.hostname],
      ['Port', url.port || '(default)'],
      ['Path', url.pathname],
      ['Hash', url.hash ? url.hash.slice(1) : ''],
    ];

    parts.forEach(([label, value]) => {
      if (!value) return;
      html += `<div class="urlp-row">
        <span class="urlp-label">${label}</span>
        <span class="urlp-value" data-copy="${escapeHtml(value)}">${escapeHtml(value)}</span>
      </div>`;
    });

    const params = Array.from(url.searchParams.entries());
    if (params.length > 0) {
      html += '<div class="urlp-section-title">Query Parameters</div>';
      params.forEach(([key, val]) => {
        let decoded = val;
        try { decoded = decodeURIComponent(val); } catch {}
        html += `<div class="urlp-row urlp-param">
          <span class="urlp-key" data-copy="${escapeHtml(key)}">${escapeHtml(key)}</span>
          <span class="urlp-eq">=</span>
          <span class="urlp-value" data-copy="${escapeHtml(decoded)}">${escapeHtml(decoded)}</span>
        </div>`;
      });

      html += `<div class="urlp-row" style="margin-top: 6px">
        <span class="urlp-label">Full query</span>
        <span class="urlp-value urlp-full-query" data-copy="${escapeHtml(url.search.slice(1))}">${escapeHtml(url.search.slice(1))}</span>
      </div>`;
    }

    html += '</div>';
    output.innerHTML = html;
    output.classList.remove('hidden');

    // Click-to-copy on all values
    output.querySelectorAll('[data-copy]').forEach(el => {
      el.addEventListener('click', function () {
        navigator.clipboard.writeText(this.dataset.copy).then(() => {
          flashCopied(this);
        });
      });
    });
  }

  el.querySelector('#urlp-parse').addEventListener('click', doParse);

  el.querySelector('#urlp-clear').addEventListener('click', () => {
    input.value = '';
    output.innerHTML = '';
    output.classList.add('hidden');
  });

  // Current Tab — auto-fill and parse
  function loadCurrentTab() {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url) {
          input.value = tabs[0].url;
          doParse();
        }
      });
    } else {
      input.value = window.location.href;
      doParse();
    }
  }

  el.querySelector('#urlp-current').addEventListener('click', loadCurrentTab);

  // Auto-parse current tab on open
  loadCurrentTab();

  // Parse on Enter
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doParse();
    }
  });
}

// ── JWT Decode ──────────────────────────────────────────────────────────────

function renderJwtTool(el) {
  el.innerHTML = `
    <textarea id="jwt-input" placeholder="Paste JWT token (eyJ...)"></textarea>
    <div class="btn-row">
      <button class="btn btn-primary" id="jwt-decode">Decode</button>
      <button class="btn btn-clear" id="jwt-clear">Clear</button>
    </div>
    <div class="output-wrap hidden" id="jwt-wrap">
      <button class="copy-btn" id="jwt-copy">Copy</button>
      <div class="output" id="jwt-output" style="color: var(--text-primary)"></div>
    </div>
  `;

  const input = el.querySelector('#jwt-input');
  const output = el.querySelector('#jwt-output');
  const wrap = el.querySelector('#jwt-wrap');

  function doDecode() {
    if (!input.value.trim()) return;
    const result = decodeJWT(input.value);
    wrap.classList.remove('hidden');

    if (result.error) {
      output.innerHTML = '';
      output.textContent = result.error;
      output.className = 'output error';
      return;
    }

    let html = '';
    html += `<div class="jwt-section"><div class="jwt-section-title">Header</div><div style="color: var(--success); font-family: var(--font-mono); font-size: 11px">${escapeHtml(JSON.stringify(result.header, null, 2))}</div></div>`;
    html += `<div class="jwt-section"><div class="jwt-section-title">Payload</div><div style="color: var(--success); font-family: var(--font-mono); font-size: 11px">${escapeHtml(JSON.stringify(result.payload, null, 2))}</div></div>`;

    if (result.times.exp) {
      const statusClass = result.times.expired ? 'jwt-expired' : 'jwt-valid';
      const statusText = result.times.expired ? 'EXPIRED' : 'VALID';
      html += `<div class="jwt-section"><div class="jwt-section-title">Expiry</div><div style="font-size: 11px"><span class="${statusClass}">${statusText}</span> \u2014 ${escapeHtml(result.times.exp)}</div></div>`;
    }

    html += `<div class="jwt-section"><div class="jwt-section-title">Signature</div><div style="color: var(--text-muted); font-family: var(--font-mono); font-size: 10px; word-break: break-all">${escapeHtml(result.signature)}</div></div>`;

    output.innerHTML = html;
    output.className = 'output';
  }

  el.querySelector('#jwt-decode').addEventListener('click', doDecode);

  el.querySelector('#jwt-clear').addEventListener('click', () => {
    input.value = '';
    wrap.classList.add('hidden');
  });

  el.querySelector('#jwt-copy').addEventListener('click', function () {
    copyToClipboard(output.textContent, this);
  });

  // Enter to decode
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doDecode();
    }
  });
}

// ── Hash ────────────────────────────────────────────────────────────────────

function renderHashTool(el) {
  el.innerHTML = `
    <textarea id="hash-input" placeholder="Enter text to hash..."></textarea>
    <div class="btn-row">
      <button class="btn btn-primary" id="hash-go">Hash</button>
      <button class="btn btn-clear" id="hash-clear">Clear</button>
    </div>
    <div class="hash-result hidden" id="hash-output"></div>
    <div class="hint hidden" id="hash-hint">Click any hash to copy</div>
  `;

  const input = el.querySelector('#hash-input');
  const output = el.querySelector('#hash-output');
  const hint = el.querySelector('#hash-hint');

  async function doHash() {
    const text = input.value;
    if (!text) return;

    const md5Result = computeMD5(text);
    const sha256Result = await computeSHA256(text);
    const sha512Result = await computeSHA512(text);

    output.innerHTML = `
      <div class="hash-row"><span class="hash-label">MD5</span><span class="hash-value" data-hash="${escapeHtml(md5Result)}">${escapeHtml(md5Result)}</span></div>
      <div class="hash-row"><span class="hash-label">SHA-256</span><span class="hash-value" data-hash="${escapeHtml(sha256Result)}">${escapeHtml(sha256Result)}</span></div>
      <div class="hash-row"><span class="hash-label">SHA-512</span><span class="hash-value" data-hash="${escapeHtml(sha512Result)}">${escapeHtml(sha512Result)}</span></div>
    `;
    output.classList.remove('hidden');
    hint.classList.remove('hidden');

    output.querySelectorAll('.hash-value').forEach(el => {
      el.addEventListener('click', function () {
        navigator.clipboard.writeText(this.dataset.hash).then(() => {
          flashCopied(this);
        });
      });
    });
  }

  el.querySelector('#hash-go').addEventListener('click', doHash);

  el.querySelector('#hash-clear').addEventListener('click', () => {
    input.value = '';
    output.classList.add('hidden');
    hint.classList.add('hidden');
  });

  // Enter to hash
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doHash();
    }
  });
}

// ── Timestamp ───────────────────────────────────────────────────────────────

function renderTimestampTool(el) {
  const now = getNow();
  el.innerHTML = `
    <div style="background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px 10px; margin-bottom: 2px">
      <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 2px">Current time</div>
      <span class="ts-now-value" id="ts-now" title="Click to copy">${now.seconds}</span>
    </div>
    <label>Unix timestamp &rarr; Date</label>
    <div class="inline-row" style="margin-top: 4px">
      <input type="text" id="ts-unix-input" placeholder="e.g. 1700000000" style="flex:1">
      <button class="btn btn-primary" id="ts-to-date">Convert</button>
    </div>
    <div class="timestamp-grid hidden" id="ts-date-output"></div>
    <div style="margin-top: 6px"><label>Date string &rarr; Unix</label></div>
    <div class="inline-row" style="margin-top: 4px">
      <input type="text" id="ts-date-input" placeholder="e.g. 2024-01-15T12:00:00Z" style="flex:1">
      <button class="btn btn-primary" id="ts-to-unix">Convert</button>
    </div>
    <div class="output-wrap hidden" id="ts-unix-wrap">
      <div class="output" id="ts-unix-output" style="min-height: 36px"></div>
    </div>
  `;

  // Live clock
  const nowEl = el.querySelector('#ts-now');
  const tickInterval = setInterval(() => {
    if (!nowEl.classList.contains('copied')) {
      nowEl.textContent = Math.floor(Date.now() / 1000);
    }
  }, 1000);

  // Click to copy current timestamp
  nowEl.addEventListener('click', function () {
    navigator.clipboard.writeText(this.textContent).then(() => {
      flashCopied(this);
    });
  });

  // Clean up interval
  const observer = new MutationObserver(() => {
    if (!document.contains(nowEl)) {
      clearInterval(tickInterval);
      observer.disconnect();
    }
  });
  observer.observe(document.getElementById('tool-content'), { childList: true });

  el.querySelector('#ts-to-date').addEventListener('click', () => {
    const result = unixToDate(el.querySelector('#ts-unix-input').value);
    const grid = el.querySelector('#ts-date-output');
    if (result.error) {
      grid.innerHTML = `<span class="label">Error</span><span class="value" style="color: var(--error)">${escapeHtml(result.error)}</span>`;
    } else {
      grid.innerHTML = `
        <span class="label">ISO</span><span class="value">${escapeHtml(result.iso)}</span>
        <span class="label">UTC</span><span class="value">${escapeHtml(result.utc)}</span>
        <span class="label">Local</span><span class="value">${escapeHtml(result.local)}</span>
        <span class="label">Relative</span><span class="value">${escapeHtml(result.relative)}</span>
      `;
    }
    grid.classList.remove('hidden');
  });

  el.querySelector('#ts-to-unix').addEventListener('click', () => {
    const result = dateToUnix(el.querySelector('#ts-date-input').value);
    const wrap = el.querySelector('#ts-unix-wrap');
    const out = el.querySelector('#ts-unix-output');
    if (result.error) {
      out.textContent = result.error;
      out.className = 'output error';
    } else {
      out.textContent = `Seconds:      ${result.seconds}\nMilliseconds: ${result.milliseconds}`;
      out.className = 'output';
    }
    wrap.classList.remove('hidden');
  });

  // Enter to convert on both inputs
  el.querySelector('#ts-unix-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); el.querySelector('#ts-to-date').click(); }
  });
  el.querySelector('#ts-date-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); el.querySelector('#ts-to-unix').click(); }
  });
}

// ── JSONPath ────────────────────────────────────────────────────────────────

function renderJsonPathTool(el) {
  el.innerHTML = `
    <textarea id="jp-json" placeholder='Paste JSON, e.g. {"users":[{"name":"Alice"}]}'></textarea>
    <div class="inline-row" style="margin-top: 2px">
      <input type="text" id="jp-expr" placeholder="$.users[*].name" style="flex: 1">
      <button class="btn btn-primary" id="jp-eval">Evaluate</button>
    </div>
    <div class="output-wrap hidden" id="jp-wrap">
      <button class="copy-btn" id="jp-copy">Copy</button>
      <div class="output" id="jp-output"></div>
    </div>
  `;

  const jsonInput = el.querySelector('#jp-json');
  const exprInput = el.querySelector('#jp-expr');
  const output = el.querySelector('#jp-output');
  const wrap = el.querySelector('#jp-wrap');

  function doEval() {
    let data;
    try {
      data = JSON.parse(jsonInput.value);
    } catch {
      output.textContent = 'Error: Invalid JSON';
      output.className = 'output error';
      wrap.classList.remove('hidden');
      return;
    }

    const result = evaluateJsonPath(data, exprInput.value);
    wrap.classList.remove('hidden');
    if (result.error) {
      output.textContent = 'Error: ' + result.error;
      output.className = 'output error';
    } else if (result.matches.length === 0) {
      output.textContent = 'No matches found';
      output.className = 'output';
      output.style.color = 'var(--text-muted)';
    } else {
      output.textContent = JSON.stringify(result.matches.map(m => m.value), null, 2);
      output.className = 'output';
      output.style.color = '';
    }
  }

  el.querySelector('#jp-eval').addEventListener('click', doEval);

  el.querySelector('#jp-copy').addEventListener('click', function () {
    copyToClipboard(output.textContent, this);
  });

  // Enter on expression input
  exprInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); doEval(); }
  });
}

// ── Lorem Ipsum ─────────────────────────────────────────────────────────────

function renderLoremTool(el) {
  el.innerHTML = `
    <div class="inline-row">
      <input type="number" id="lorem-count" value="3" min="1" max="50" style="width: 60px">
      <select id="lorem-unit">
        <option value="paragraphs">Paragraphs</option>
        <option value="sentences">Sentences</option>
        <option value="words">Words</option>
      </select>
      <button class="btn btn-primary" id="lorem-gen">Generate</button>
    </div>
    <div class="output-wrap">
      <button class="copy-btn" id="lorem-copy">Copy</button>
      <div class="output" id="lorem-output" style="max-height: 280px; color: var(--text-primary)"></div>
    </div>
  `;

  const output = el.querySelector('#lorem-output');

  el.querySelector('#lorem-gen').addEventListener('click', () => {
    const count = parseInt(el.querySelector('#lorem-count').value) || 3;
    const unit = el.querySelector('#lorem-unit').value;
    output.textContent = generateLoremIpsum(count, unit);
  });

  el.querySelector('#lorem-copy').addEventListener('click', function () {
    copyToClipboard(output.textContent, this);
  });

  // Auto-generate
  output.textContent = generateLoremIpsum(3, 'paragraphs');
}

// ── Color Converter ─────────────────────────────────────────────────────────

function renderColorTool(el) {
  const hasEyeDropper = typeof window.EyeDropper !== 'undefined';

  el.innerHTML = `
    ${hasEyeDropper ? '<button class="btn btn-picker" id="color-pick">Pick from screen</button>' : ''}
    <div class="color-preview" id="color-preview"></div>
    <div class="color-grid" id="color-output"></div>
    <div style="margin-top: 6px">
      <label style="text-transform: none; font-size: 12px">Enter HEX</label>
      <div class="inline-row" style="margin-top: 4px">
        <input type="text" id="color-hex" placeholder="#60a5fa" style="flex: 1">
        <button class="btn btn-primary" id="color-convert">Convert</button>
      </div>
    </div>
  `;

  const preview = el.querySelector('#color-preview');
  const output = el.querySelector('#color-output');
  const hexInput = el.querySelector('#color-hex');

  function showColor(r, g, b) {
    const hex = rgbToHex(r, g, b);
    const hsl = rgbToHsl(r, g, b);

    preview.style.background = hex;

    output.innerHTML = `
      <span class="label">HEX</span><span class="value" data-copy="${escapeHtml(hex)}">${escapeHtml(hex)}</span>
      <span class="label">RGB</span><span class="value" data-copy="${escapeHtml(formatRgb({ r, g, b }))}">${escapeHtml(formatRgb({ r, g, b }))}</span>
      <span class="label">HSL</span><span class="value" data-copy="${escapeHtml(formatHsl(hsl))}">${escapeHtml(formatHsl(hsl))}</span>
    `;

    hexInput.value = hex;

    output.querySelectorAll('.value').forEach(v => {
      v.addEventListener('click', function () {
        navigator.clipboard.writeText(this.dataset.copy).then(() => {
          flashCopied(this);
        });
      });
    });
  }

  if (hasEyeDropper) {
    el.querySelector('#color-pick').addEventListener('click', async () => {
      try {
        const dropper = new EyeDropper();
        const result = await dropper.open();
        const hex = result.sRGBHex;
        const rgb = hexToRgb(hex);
        if (rgb) showColor(rgb.r, rgb.g, rgb.b);
      } catch {}
    });
  }

  el.querySelector('#color-convert').addEventListener('click', () => {
    const hex = hexInput.value.trim();
    const rgb = hexToRgb(hex);
    if (!rgb) {
      output.innerHTML = '<span class="label">Error</span><span class="value" style="color: var(--error)">Invalid hex color</span>';
      return;
    }
    showColor(rgb.r, rgb.g, rgb.b);
  });

  // Enter to convert
  hexInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); el.querySelector('#color-convert').click(); }
  });

  // Pre-load with accent color so tool doesn't look empty
  const defaultRgb = hexToRgb('#60a5fa');
  if (defaultRgb) showColor(defaultRgb.r, defaultRgb.g, defaultRgb.b);
}

// ── Utility: escape HTML ────────────────────────────────────────────────────

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ── Init ────────────────────────────────────────────────────────────────────

async function init() {
  pinnedTools = await loadPinned();

  if (!pinnedTools.length) pinnedTools = [...DEFAULT_PINNED];

  activeTool = pinnedTools[0];
  renderTabs();
  renderTool(activeTool);

  // Header buttons
  document.getElementById('btn-settings').addEventListener('click', () => {
    chrome.tabs ? chrome.tabs.create({ url: 'settings.html' }) : window.open('settings.html');
  });

  document.getElementById('btn-open-site').addEventListener('click', () => {
    chrome.tabs ? chrome.tabs.create({ url: 'https://stingr.dev' }) : window.open('https://stingr.dev');
  });
}

init();
