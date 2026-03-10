// ── Categories (must match popup.js) ─────────────────────────────────────────

const CATEGORIES = [
  { id: 'inspect', label: 'Inspect', desc: 'Inspect the current page', tools: [
    { id: 'headers',  name: 'Response Headers',  icon: '📡',  desc: 'View HTTP response headers & server info' },
    { id: 'security', name: 'Security Headers',   icon: '🛡️',  desc: 'Audit security headers with grade' },
    { id: 'meta',     name: 'Meta & OG Tags',     icon: '🏷️',   desc: 'Meta tags, Open Graph, Twitter Cards' },
    { id: 'tech',     name: 'Tech Stack',          icon: '🔧',   desc: 'Detect frameworks, libraries, analytics' },
    { id: 'url',      name: 'URL Parser',           icon: '🔗',    desc: 'Break URLs into parts and query params' },
  ]},
  { id: 'visual', label: 'Visual', desc: 'Visual & CSS tools', tools: [
    { id: 'color',    name: 'Color Picker',        icon: '🎨',    desc: 'Pick, convert & explore colors' },
    { id: 'fonts',    name: 'Font Detector',        icon: '🔤',   desc: 'See all fonts used on the page' },
    { id: 'outline',  name: 'CSS Outlines',         icon: '🔲',  desc: 'Toggle element outlines for debugging' },
    { id: 'ruler',    name: 'Element Inspector',    icon: '📏',   desc: 'Hover to inspect element dimensions' },
    { id: 'unblock',  name: 'Overlay Remover',      icon: '🚫',   desc: 'Remove overlays, paywalls & unlock scroll' },
  ]},
  { id: 'tools', label: 'Tools', desc: 'Quick developer utilities', tools: [
    { id: 'testdata', name: 'Test Data',             icon: '🎲',    desc: 'Generate UUIDs, emails, passwords & more' },
    { id: 'forms',    name: 'Form Filler',           icon: '📝',    desc: 'Auto-fill forms with realistic test data' },
    { id: 'sqli',     name: 'SQLi Tester',           icon: '💉',    desc: 'SQL injection payloads for security testing' },
    { id: 'xss',      name: 'XSS Tester',            icon: '🧨',    desc: 'XSS payloads for security testing' },
    { id: 'qr',       name: 'QR Code',                icon: '📷',    desc: 'Generate QR code for any URL or text' },
  ]},
  { id: 'page', label: 'Page', desc: 'Page data & debugging', tools: [
    { id: 'cookies',  name: 'Cookie Inspector',   icon: '🍪',  desc: 'View, edit, add & delete cookies' },
    { id: 'storage',  name: 'Storage',               icon: '💾',    desc: 'Browse, edit & add localStorage & sessionStorage entries' },
    { id: 'network',  name: 'Resources',              icon: '📦',    desc: 'View all network resources loaded' },
    { id: 'perf',     name: 'Performance',            icon: '⚡',    desc: 'Page load metrics and DOM stats' },
    { id: 'a11y',     name: 'Accessibility',          icon: '♿',    desc: 'Quick accessibility audit' },
    { id: 'viewport', name: 'Viewport',               icon: '📱',    desc: 'Resize window to common device sizes' },
  ]},
];

// ── UI ──────────────────────────────────────────────────────────────────────

function renderGrid() {
  const grid = document.getElementById('tool-grid');
  grid.innerHTML = '';

  CATEGORIES.forEach(cat => {
    // Category header
    const catHeader = document.createElement('div');
    catHeader.className = 'cat-header';
    catHeader.innerHTML = `
      <div class="cat-title">${cat.label}</div>
      <div class="cat-desc">${cat.desc}</div>
    `;
    grid.appendChild(catHeader);

    // Tools in this category
    cat.tools.forEach(tool => {
      const row = document.createElement('div');
      row.className = 'tool-row';
      row.innerHTML = `
        <div class="tool-info">
          <div class="tool-icon">${tool.icon}</div>
          <div>
            <div class="tool-name">${tool.name}</div>
            <div class="tool-desc">${tool.desc}</div>
          </div>
        </div>
      `;
      grid.appendChild(row);
    });
  });
}

// ── Size Settings ───────────────────────────────────────────────────────────

function initSizeSettings() {
  const sizeLabel = document.getElementById('current-size');
  const resetBtn = document.getElementById('btn-reset-size');
  if (!sizeLabel || !resetBtn) return;

  const DEFAULT_W = 420;

  // Show current saved width
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['popupWidth'], result => {
      const w = result.popupWidth || DEFAULT_W;
      sizeLabel.textContent = `Current: ${w}px`;
      if (w === DEFAULT_W) {
        resetBtn.textContent = 'Default';
        resetBtn.classList.add('done');
        resetBtn.disabled = true;
      }
    });
  } else {
    sizeLabel.textContent = 'Current: 420px (default)';
  }

  resetBtn.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.remove(['popupWidth'], () => {
        sizeLabel.textContent = `Current: ${DEFAULT_W}px`;
        resetBtn.textContent = 'Done!';
        resetBtn.classList.add('done');
        setTimeout(() => {
          resetBtn.textContent = 'Default';
          resetBtn.disabled = true;
        }, 1200);
      });
    }
  });
}

// ── Init ────────────────────────────────────────────────────────────────────

function init() {
  renderGrid();
  initSizeSettings();
}

init();
