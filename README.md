<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="src/assets/stingr_logo_dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="src/assets/stingr_logo.svg">
    <img alt="Stingr.dev" src="src/assets/stingr_logo.svg" width="300">
  </picture>
</p>

<p align="center">
  <strong>Free online developer toolkit</strong>
</p>

<p align="center">
  <a href="https://stingr.dev">stingr.dev</a>
</p>

---

## Tools

**JSON**
- **JSON Preview** — Parse, format, minify, and explore JSON with an interactive tree view. Search, edit values inline, copy paths, and detect nested JSON, dates, URLs, and images.
- **JSON Compare** — Side-by-side diff of two JSON documents with color-coded additions, removals, and changes.

**Encode / Decode**
- **Base64** — Encode and decode Base64 strings
- **URL Encode** — Percent-encode and decode URL components
- **HTML Entities** — Escape and unescape HTML special characters
- **JWT Decode** — Decode JSON Web Tokens and inspect header, payload, and signature
- **Hex Encode** — Convert text to hex strings and back
- **Unicode Escape** — Convert text to `\uXXXX` sequences and back
- **Markdown Preview** — Live markdown-to-HTML rendering with copy

**Hash**
- **Hash Generator** — MD5, SHA-1, SHA-256, SHA-512 with HMAC support
- **Hash Verifier** — Verify text against a known hash with auto-detected algorithm
- **File Checksum** — Drag-and-drop SHA-256 file hashing (entirely in-browser)

**Convert**
- **Timestamp** — Unix epoch to human-readable date conversion (seconds and milliseconds)
- **JSON / YAML** — Bidirectional JSON-to-YAML and YAML-to-JSON conversion
- **Case Converter** — Transform text between camelCase, snake_case, PascalCase, kebab-case, and more
- **Number Base** — Convert between decimal, hex, octal, and binary with BigInt support
- **Color Converter** — HEX, RGB, and HSL color conversion with live picker and preview
- **Byte Size** — Convert between B, KB, MB, GB, TB, and PB
- **Cron Parser** — Parse cron expressions into plain English with next 5 scheduled runs
- **Regex Tester** — Test regex patterns with live match highlighting, flags, and capture groups

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

**Text Diff**
- **Text Diff** — Side-by-side text comparison with line-level diff, color coding, and stats

**Formatter**
- **SQL** — Format and minify SQL queries
- **XML** — Format and minify XML documents
- **CSS** — Format and minify CSS stylesheets
- **HTML** — Format and minify HTML markup

## Tech Stack

- React + Vite
- Tailwind CSS
- React Router
- Zero external dependencies for tool logic (pure JS)

## Development

```bash
yarn install
yarn dev
```

## License

MIT
