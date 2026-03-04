// ── Tool Definitions (must match popup.js) ──────────────────────────────────

const ALL_TOOLS = [
  { id: 'url',       label: 'URL Parser',           icon: '/',    desc: 'Break URLs into parts and query params', defaultPinned: true },
  { id: 'json',      label: 'JSON Tree View',       icon: '{ }',   desc: 'Interactive JSON tree viewer',         defaultPinned: true },
  { id: 'jwt',       label: 'JWT Decode',           icon: 'jwt',   desc: 'Decode and inspect JWT tokens',        defaultPinned: true },
  { id: 'base64',    label: 'Base64 Encode/Decode',  icon: 'B64',  desc: 'Encode and decode Base64 strings',     defaultPinned: true },
  { id: 'color',     label: 'Color Picker',         icon: '\u25cf', desc: 'Pick, convert & explore colors',      defaultPinned: true },
  { id: 'uuid',      label: 'UUID Generator',       icon: '#',     desc: 'Generate UUID v4 and v1',              defaultPinned: true },
  { id: 'timestamp', label: 'Timestamp Converter',  icon: '\u23f0', desc: 'Convert between Unix timestamps and dates', defaultPinned: true },
  { id: 'hash',      label: 'Hash Generator',       icon: '#!',    desc: 'MD5, SHA-256, SHA-512 hashing',        defaultPinned: true },
  { id: 'jsonpath',  label: 'JSONPath Evaluator',   icon: '$..',   desc: 'Query JSON data with JSONPath',        defaultPinned: false },
  { id: 'lorem',     label: 'Lorem Ipsum Generator', icon: 'Aa',   desc: 'Generate placeholder text',            defaultPinned: false },
];

const DEFAULT_PINNED = ALL_TOOLS.filter(t => t.defaultPinned).map(t => t.id);

// ── Storage ─────────────────────────────────────────────────────────────────

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

// ── UI ──────────────────────────────────────────────────────────────────────

let pinnedTools = [];

function showToast() {
  const toast = document.getElementById('saved-toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1500);
}

function renderGrid() {
  const grid = document.getElementById('tool-grid');
  grid.innerHTML = '';

  ALL_TOOLS.forEach(tool => {
    const isPinned = pinnedTools.includes(tool.id);
    const row = document.createElement('div');
    row.className = 'tool-row';
    row.innerHTML = `
      <div class="tool-info">
        <div class="tool-icon">${tool.icon}</div>
        <div>
          <div class="tool-name">${tool.label}</div>
          <div class="tool-desc">${tool.desc}</div>
        </div>
      </div>
      <label class="toggle">
        <input type="checkbox" data-tool-id="${tool.id}" ${isPinned ? 'checked' : ''}>
        <span class="toggle-slider"></span>
      </label>
    `;
    grid.appendChild(row);
  });

  // Bind toggle events
  grid.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = cb.dataset.toolId;
      if (cb.checked) {
        if (!pinnedTools.includes(id)) pinnedTools.push(id);
      } else {
        pinnedTools = pinnedTools.filter(t => t !== id);
      }

      // Ensure at least one tool is pinned
      if (pinnedTools.length === 0) {
        pinnedTools = ['json'];
        cb.checked = id === 'json';
      }

      savePinned(pinnedTools);
      showToast();
    });
  });
}

// ── Init ────────────────────────────────────────────────────────────────────

async function init() {
  pinnedTools = await loadPinned();
  renderGrid();

  document.getElementById('btn-reset').addEventListener('click', () => {
    pinnedTools = [...DEFAULT_PINNED];
    savePinned(pinnedTools);
    renderGrid();
    showToast();
  });
}

init();
