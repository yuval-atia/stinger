import { useState } from 'react';

const CATEGORIES = [
  { label: 'Inspect', desc: 'Inspect the current page', tools: [
    { icon: '📡', name: 'Response Headers', desc: 'View HTTP headers, server info & geolocation' },
    { icon: '🛡️', name: 'Security Headers', desc: 'Audit security headers with severity grades' },
    { icon: '🏷️', name: 'Meta & OG Tags', desc: 'Meta tags, Open Graph & Twitter Cards' },
    { icon: '🔧', name: 'Tech Stack', desc: 'Detect frameworks, libraries & analytics' },
    { icon: '🔗', name: 'URL Parser', desc: 'Break URLs into parts & query params' },
  ]},
  { label: 'Visual', desc: 'Visual & CSS tools', tools: [
    { icon: '🎨', name: 'Color Picker', desc: 'Pick colors from any page element' },
    { icon: '🔤', name: 'Font Detector', desc: 'See all fonts used on the page' },
    { icon: '🔲', name: 'CSS Outlines', desc: 'Toggle element outlines for debugging' },
    { icon: '📏', name: 'Element Inspector', desc: 'Hover to inspect element dimensions' },
  ]},
  { label: 'Tools', desc: 'Quick developer utilities', tools: [
    { icon: '🎲', name: 'Test Data', desc: 'Generate UUIDs, emails, passwords & more' },
    { icon: '📝', name: 'Form Filler', desc: 'Auto-fill forms with realistic test data' },
    { icon: '💉', name: 'SQLi Tester', desc: 'SQL injection payloads for security testing' },
    { icon: '🧨', name: 'XSS Tester', desc: 'XSS payloads for security testing' },
    { icon: '📷', name: 'QR Code', desc: 'Generate QR code for any URL or text' },
  ]},
  { label: 'Page', desc: 'Page data & debugging', tools: [
    { icon: '🍪', name: 'Cookie Inspector', desc: 'View, edit, add & delete cookies' },
    { icon: '💾', name: 'Storage', desc: 'Browse, edit & add localStorage & sessionStorage' },
    { icon: '📦', name: 'Resources', desc: 'View all network resources loaded' },
    { icon: '⚡', name: 'Performance', desc: 'Page load metrics & DOM stats' },
    { icon: '♿', name: 'Accessibility', desc: 'Quick accessibility audit' },
    { icon: '📱', name: 'Viewport', desc: 'Resize to common device sizes' },
  ]},
];

const STEPS = [
  {
    title: 'Download the extension',
    content: (
      <>
        <a
          href="/stingr-extension.zip"
          download
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--accent-color)] text-white font-semibold text-sm hover:brightness-110 transition-all"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download Stingr v2.0
        </a>
        <p className="mt-2 text-[var(--text-muted)] text-xs">ZIP file &middot; Works on Chrome, Edge, Brave, Arc & all Chromium browsers</p>
      </>
    ),
  },
  {
    title: 'Unzip the file',
    content: (
      <p>Extract the downloaded <code className="px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--accent-color)] text-xs">stingr-extension.zip</code> to a folder on your computer. Remember where you put it.</p>
    ),
  },
  {
    title: 'Open the extensions page',
    content: (
      <>
        <p className="mb-2">Open your browser and go to:</p>
        <div className="space-y-1.5">
          <CopyableUrl label="Chrome" url="chrome://extensions" />
          <CopyableUrl label="Edge" url="edge://extensions" />
          <CopyableUrl label="Brave" url="brave://extensions" />
          <CopyableUrl label="Arc" url="arc://extensions" />
        </div>
      </>
    ),
  },
  {
    title: 'Enable Developer Mode',
    content: (
      <p>Toggle the <strong className="text-[var(--text-primary)]">Developer mode</strong> switch in the top-right corner of the extensions page.</p>
    ),
  },
  {
    title: 'Load the extension',
    content: (
      <p>Click <strong className="text-[var(--text-primary)]">Load unpacked</strong> (top-left) and select the <code className="px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--accent-color)] text-xs">extension</code> folder you extracted.</p>
    ),
  },
  {
    title: 'Pin it to your toolbar',
    content: (
      <p>Click the puzzle piece icon in the toolbar, then click the pin icon next to <strong className="text-[var(--text-primary)]">Stingr</strong> to keep it visible.</p>
    ),
  },
];

function CopyableUrl({ label, url }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-12 text-[var(--text-muted)]">{label}:</span>
      <code className="px-2 py-1 rounded bg-[var(--bg-secondary)] text-[var(--accent-color)] select-all">{url}</code>
      <button
        onClick={() => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-xs"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

function ExtensionPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto py-8 px-4">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-color)]/10 text-[var(--accent-color)] text-xs font-medium mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            v2.0 &middot; Free &middot; No account needed
          </div>
          <h1 className="text-3xl font-bold mb-3">Stingr Browser Extension</h1>
          <p className="text-[var(--text-muted)] text-base max-w-lg mx-auto">
            20 developer tools for inspecting, debugging & testing any website — right from your browser toolbar. Security audit, tech detection, visual tools & more. 100% private.
          </p>
        </div>

        {/* Tools by category */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-5">All 20 Tools</h2>
          <div className="space-y-5">
            {CATEGORIES.map(cat => (
              <div key={cat.label}>
                <div className="flex items-baseline gap-2 mb-2">
                  <h3 className="text-sm font-bold text-[var(--accent-color)]">{cat.label}</h3>
                  <span className="text-xs text-[var(--text-muted)]">{cat.desc}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {cat.tools.map(t => (
                    <div key={t.name} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                      <span className="text-base flex-shrink-0">{t.icon}</span>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-[var(--text-primary)]">{t.name}</div>
                        <div className="text-xs text-[var(--text-muted)] truncate">{t.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Install steps */}
        <h2 className="text-xl font-bold mb-6">Install in 2 minutes</h2>
        <div className="space-y-6 mb-10">
          {STEPS.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent-color)] text-white flex items-center justify-center text-sm font-bold">
                {i + 1}
              </div>
              <div className="pt-1 text-sm text-[var(--text-secondary)] leading-relaxed">
                <h3 className="font-semibold text-[var(--text-primary)] mb-1">{step.title}</h3>
                {step.content}
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 mb-10">
          <h2 className="text-lg font-bold mb-4">Why Stingr Extension?</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {[
              ['100% Private', 'All processing happens in your browser. Your data never leaves your machine.'],
              ['20 Tools, 4 Categories', 'Inspect, Visual, Tools & Page — everything you need to debug and test websites.'],
              ['Browser-Context Tools', 'Reads live page data: headers, cookies, tech stack, security audit, DOM inspection.'],
              ['Security Testing', 'Built-in SQLi and XSS payload testers for authorized penetration testing.'],
              ['Resizable Popup', 'Drag to resize the popup width. Your preferred size is remembered.'],
              ['Kill Switch', 'One-click button to stop all active page injections (color picker, outlines, inspector).'],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-3">
                <span className="text-[var(--accent-color)] mt-0.5 flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <div>
                  <div className="font-medium text-[var(--text-primary)]">{title}</div>
                  <div className="text-[var(--text-muted)] text-xs">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* What's new in v2 */}
        <div className="rounded-xl border border-[var(--accent-color)]/20 bg-[var(--accent-color)]/5 p-6 mb-10">
          <h2 className="text-lg font-bold mb-3">What&apos;s new in v2.0</h2>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li className="flex gap-2"><span className="text-[var(--accent-color)]">&rarr;</span> Complete redesign — focused on browser-context tools instead of encoding/formatting</li>
            <li className="flex gap-2"><span className="text-[var(--accent-color)]">&rarr;</span> 9 new tools: Security Headers, Tech Stack, Font Detector, Element Inspector, Form Filler, SQLi Tester, XSS Tester, QR Code, Accessibility</li>
            <li className="flex gap-2"><span className="text-[var(--accent-color)]">&rarr;</span> Server geolocation in Response Headers (country, provider, IP)</li>
            <li className="flex gap-2"><span className="text-[var(--accent-color)]">&rarr;</span> Accordion UI with collapsible tool sections</li>
            <li className="flex gap-2"><span className="text-[var(--accent-color)]">&rarr;</span> Resizable popup with persistent width preference</li>
            <li className="flex gap-2"><span className="text-[var(--accent-color)]">&rarr;</span> Kill switch to stop all active page injections</li>
          </ul>
        </div>

        {/* FAQ */}
        <h2 className="text-lg font-bold mb-4">FAQ</h2>
        <div className="space-y-4 text-sm mb-8">
          <Faq q="Is it safe to enable Developer Mode?" a="Yes. Developer Mode simply allows you to load extensions from your computer instead of the Chrome Web Store. Many developers use this daily." />
          <Faq q="Will it auto-update?" a="Not automatically. When a new version is released, download the updated ZIP and replace the old folder. Then click the refresh icon on the extensions page." />
          <Faq q="Does it work on Firefox?" a="Not yet — this extension is built for Chromium-based browsers (Chrome, Edge, Brave, Arc, Opera, Vivaldi). Firefox support is planned." />
          <Faq q="What permissions does it need?" a="storage (save preferences), activeTab & tabs (read current page), scripting (inject visual tools like color picker and outlines), cookies (cookie inspector), and host_permissions (fetch response headers). No data is sent to any server — everything stays in your browser." />
          <Faq q="What about the encoding tools from v1?" a="v2.0 focuses on browser-context tools that need the extension API. For encoding, hashing, JSON formatting and other standalone tools, use stingr.dev — it has 40+ tools available." />
        </div>
      </div>
    </div>
  );
}

function Faq({ q, a }) {
  return (
    <div>
      <h3 className="font-medium text-[var(--text-primary)] mb-1">{q}</h3>
      <p className="text-[var(--text-muted)]">{a}</p>
    </div>
  );
}

export default ExtensionPage;
