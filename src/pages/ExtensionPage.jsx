import { useState } from 'react';

const TOOLS = [
  { icon: '/', name: 'URL Parser', desc: 'Break URLs into parts, auto-loads current tab' },
  { icon: '{ }', name: 'JSON Formatter', desc: 'Format, minify & validate JSON' },
  { icon: 'jwt', name: 'JWT Decoder', desc: 'Decode and inspect JWT tokens' },
  { icon: 'B64', name: 'Base64', desc: 'Encode and decode Base64 strings' },
  { icon: '\u25cf', name: 'Color Picker', desc: 'Pick & convert HEX, RGB, HSL colors' },
  { icon: '#', name: 'UUID Generator', desc: 'Generate UUID v4 and v1' },
  { icon: '\u23f0', name: 'Timestamp', desc: 'Convert Unix timestamps & dates' },
  { icon: '#!', name: 'Hash Generator', desc: 'MD5, SHA-256, SHA-512 hashing' },
  { icon: '$..', name: 'JSONPath', desc: 'Query JSON with JSONPath expressions' },
  { icon: 'Aa', name: 'Lorem Ipsum', desc: 'Generate placeholder text' },
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
          Download Stingr Extension
        </a>
        <p className="mt-2 text-[var(--text-muted)] text-xs">ZIP file &middot; ~30 KB &middot; Works on Chrome, Edge, Brave, Arc & all Chromium browsers</p>
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
            Free &middot; No account needed
          </div>
          <h1 className="text-3xl font-bold mb-3">Stingr Browser Extension</h1>
          <p className="text-[var(--text-muted)] text-base max-w-lg mx-auto">
            10 developer tools in your browser toolbar. URL parser, JSON formatter, JWT decoder, Base64, hashing & more. 100% private — everything runs locally.
          </p>
        </div>

        {/* Preview mockup */}
        <div className="mb-10 rounded-xl border border-[var(--border-color)] overflow-hidden bg-[var(--bg-secondary)] p-4">
          <div className="flex items-center gap-2 mb-3 text-xs text-[var(--text-muted)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            Extension popup preview
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {TOOLS.map(t => (
              <div key={t.name} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)]">
                <span className="text-xs font-mono text-[var(--accent-color)] w-6 text-center flex-shrink-0">{t.icon}</span>
                <div className="min-w-0">
                  <div className="text-xs font-medium text-[var(--text-primary)] truncate">{t.name}</div>
                  <div className="text-[10px] text-[var(--text-muted)] truncate">{t.desc}</div>
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
              ['10 Tools', 'URL, JSON, JWT, Base64, Color, UUID, Timestamp, Hash, JSONPath, Lorem Ipsum.'],
              ['Customizable', 'Pin only the tools you use. Settings sync across devices.'],
              ['Lightweight', '~30 KB total. No background processes, no tracking, no analytics.'],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-3">
                <span className="text-[var(--accent-color)] mt-0.5">
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

        {/* FAQ */}
        <h2 className="text-lg font-bold mb-4">FAQ</h2>
        <div className="space-y-4 text-sm mb-8">
          <Faq q="Is it safe to enable Developer Mode?" a="Yes. Developer Mode simply allows you to load extensions from your computer instead of the Chrome Web Store. Many developers use this daily." />
          <Faq q="Will it auto-update?" a="Not automatically. When a new version is released, download the updated ZIP and replace the old folder. Then click the refresh icon on the extensions page." />
          <Faq q="Does it work on Firefox?" a="Not yet — this extension is built for Chromium-based browsers (Chrome, Edge, Brave, Arc, Opera, Vivaldi). Firefox support is planned." />
          <Faq q="What permissions does it need?" a="Only 'storage' (to save your tool preferences) and 'tabs' (to read the current tab URL for the URL parser). No data is sent anywhere." />
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
