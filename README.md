<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="src/assets/stingr_logo_dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="src/assets/stingr_logo.svg">
    <img alt="Stingr.dev" src="src/assets/stingr_logo.svg" width="300">
  </picture>
</p>

<p align="center">
  <strong>Free, private developer toolkit — 100% client-side, your data never leaves the browser</strong>
</p>

<p align="center">
  <a href="https://stingr.dev">stingr.dev</a>
</p>

---

## Tools

**JSON**
- **JSON Preview** — Parse, format, minify, and explore JSON with an interactive tree view. Search with filter mode, expand to depth (1/2/3/All), breadcrumb navigation, inline editing, path copying, drag & drop file upload, download, and smart detection of nested JSON, dates, URLs, and images.
- **JSON Compare** — Side-by-side diff with color-coded additions, removals, and changes. Sync scroll, diff-only toggle, and swap button.

**Encode / Decode**
- **Base64** — Encode and decode Base64 strings
- **URL Encode** — Percent-encode and decode URL components
- **HTML Entities** — Escape and unescape HTML special characters
- **JSON Escape** — Escape and unescape JSON strings
- **JWT Decode** — Decode JSON Web Tokens and inspect header, payload, and signature
- **Hex Encode** — Convert text to hex strings and back
- **Unicode Escape** — Convert text to `\uXXXX` sequences and back
- **Image to Base64** — Drag & drop images to get data URI strings
- **AES Encrypt / Decrypt** — AES-256-GCM encryption with password (PBKDF2 key derivation, entirely in-browser)
- **Text / Binary** — Convert text to 8-bit binary and back
- **Markdown Preview** — Live markdown-to-HTML rendering with copy

**Hash**
- **Hash Generator** — MD5, SHA-1, SHA-256, SHA-512 with HMAC support
- **Hash Verifier** — Verify text against a known hash with auto-detected algorithm
- **File Checksum** — Drag-and-drop SHA-256 file hashing (entirely in-browser)

**Convert**
- **Timestamp** — Unix epoch to human-readable date conversion (seconds and milliseconds)
- **JSON / YAML** — Bidirectional JSON-to-YAML and YAML-to-JSON conversion
- **CSV / JSON** — Convert between CSV and JSON formats
- **Case Converter** — Transform text between camelCase, snake_case, PascalCase, kebab-case, and more
- **Number Base** — Convert between decimal, hex, octal, and binary with BigInt support
- **Color Converter** — HEX, RGB, and HSL color conversion with live picker and preview
- **Byte Size** — Convert between B, KB, MB, GB, TB, and PB
- **Cron Parser** — Parse cron expressions into plain English with next 5 scheduled runs
- **Regex Tester** — Test regex patterns with live match highlighting, flags, and capture groups
- **Chmod Calculator** — Interactive permission grid with octal/symbolic output and presets
- **JSON to TypeScript** — Generate TypeScript interfaces from JSON
- **HTML to JSX** — Convert HTML attributes, styles, and void elements to valid JSX
- **Contrast Checker** — WCAG 2.1 AA/AAA color contrast checker with live preview

**Generate**
- **UUID** — v1 (timestamp) and v4 (random)
- **ULID** — Sortable unique IDs with embedded timestamps
- **NanoID** — Compact URL-friendly IDs with custom alphabet
- **API Key** — Cryptographic keys with entropy meter
- **Password** — Configurable passwords with strength meter
- **Fake Data** — Random names, emails, addresses, and phone numbers
- **Color Palette** — Harmonious color palettes using golden-ratio hue stepping
- **Lorem Ipsum** — Paragraphs, sentences, or words
- **QR Code** — SVG QR codes with configurable error correction
- **Placeholder Image** — SVG placeholder images with custom dimensions and colors
- **Markdown Table** — Visual grid editor for Markdown tables with column alignment

**Text Tools**
- **Text Diff** — Side-by-side text comparison with line-level diff, color coding, and stats
- **Line Numbers** — Add or remove line numbers from text
- **Case Transform** — Transform text to UPPER, lower, Title, Sentence, camelCase, PascalCase, snake_case, kebab-case
- **Sort Lines** — Sort, reverse, shuffle, and deduplicate lines
- **Text Statistics** — Character, word, line, and sentence counts with reading time

**Formatter**
- **JSON** — Format and minify JSON
- **SQL** — Format and minify SQL queries
- **XML** — Format and minify XML documents
- **CSS** — Format and minify CSS stylesheets
- **HTML** — Format and minify HTML markup

## Packages

| Package | Description | npm |
|---------|-------------|-----|
| [`@stingr/json-viewer`](packages/json-viewer) | Standalone JSON tree viewer React component with virtual scrolling, search, inline editing, diffing, and node pinning | [![npm](https://img.shields.io/npm/v/@stingr/json-viewer)](https://www.npmjs.com/package/@stingr/json-viewer) |

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- React Router (HashRouter for GitHub Pages)
- Lazy-loaded pages with React.lazy
- Zero external dependencies for tool logic (pure JS + Web Crypto API)

## Development

```bash
yarn install
yarn dev
```

## License

MIT
