export const categories = {
  generate: { label: 'Generate', path: '/generate' },
  encode:   { label: 'Encode/Decode', path: '/encode' },
  hash:     { label: 'Hash', path: '/hash' },
  convert:  { label: 'Convert', path: '/convert' },
  text:     { label: 'Text Tools', path: '/text' },
  format:   { label: 'Formatter', path: '/format' },
};

export const toolRegistry = [
  // ─── Generate (11) ───────────────────────────────────────────────────

  {
    slug: 'uuid-generator',
    title: 'UUID Generator',
    category: 'generate',
    seo: {
      title: 'UUID Generator Online - v1 & v4 | Stingr',
      description: 'Generate UUID v1 (timestamp) and v4 (random) instantly. Free, private, 100% in-browser.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Generate/UUIDGenerator'),
    faq: [
      {
        question: 'What is the difference between UUID v1 and v4?',
        answer: 'UUID v1 is generated using the current timestamp and the machine\'s MAC address, making it roughly sortable by creation time. UUID v4 is generated using cryptographically secure random numbers, offering stronger uniqueness guarantees without leaking timing or hardware information.',
      },
      {
        question: 'Are UUIDs generated in the browser truly unique?',
        answer: 'Yes. UUID v4 uses 122 random bits sourced from the Web Crypto API, giving a collision probability so low it is effectively zero for any practical workload. No server or coordination is needed.',
      },
      {
        question: 'Can I use these UUIDs as database primary keys?',
        answer: 'Absolutely. UUIDs are widely used as primary keys in PostgreSQL, MySQL, and other databases. If insert performance on B-tree indexes matters, consider UUID v7 or ULID for time-sorted ordering.',
      },
    ],
  },

  {
    slug: 'api-key-generator',
    title: 'API Key Generator',
    category: 'generate',
    seo: {
      title: 'API Key Generator Online - Secure Random Keys | Stingr',
      description: 'Generate secure, random API keys with customizable length and character sets. Free, private, runs entirely in your browser.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Generate/APIKeyGenerator'),
    faq: [
      {
        question: 'How are these API keys generated?',
        answer: 'Keys are generated using the Web Crypto API (crypto.getRandomValues), which provides cryptographically secure random bytes. No key ever leaves your browser.',
      },
      {
        question: 'What is a good length for an API key?',
        answer: 'A minimum of 32 characters is recommended for most applications. For high-security scenarios, 64 characters or more provide an extra margin of safety against brute-force attacks.',
      },
      {
        question: 'Are these API keys stored anywhere?',
        answer: 'No. All generation happens client-side in your browser. Nothing is sent to a server and no keys are logged or stored.',
      },
    ],
  },

  {
    slug: 'password-generator',
    title: 'Password Generator',
    category: 'generate',
    seo: {
      title: 'Password Generator Online - Strong & Secure | Stingr',
      description: 'Create strong, random passwords with custom length and character options. Free, private, 100% in-browser generation.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Generate/PasswordGenerator'),
    faq: [
      {
        question: 'How strong are the generated passwords?',
        answer: 'Passwords are built from cryptographically secure random values via the Web Crypto API. A 16-character password using uppercase, lowercase, digits, and symbols contains roughly 100 bits of entropy, making brute-force infeasible.',
      },
      {
        question: 'Is my generated password sent to a server?',
        answer: 'No. Everything runs in your browser. The password is never transmitted, stored, or logged anywhere outside your device.',
      },
      {
        question: 'What makes a password secure?',
        answer: 'Length is the single biggest factor. Use at least 16 characters mixing uppercase, lowercase, digits, and symbols. Avoid dictionary words or predictable patterns. A randomly generated password is always stronger than one you create yourself.',
      },
    ],
  },

  {
    slug: 'nanoid-generator',
    title: 'NanoID Generator',
    category: 'generate',
    seo: {
      title: 'NanoID Generator Online - Compact Unique IDs | Stingr',
      description: 'Generate compact, URL-friendly NanoIDs with configurable size and alphabet. Free, private, runs entirely in your browser.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Generate/NanoIDGenerator'),
    faq: [
      {
        question: 'What is a NanoID and how does it differ from UUID?',
        answer: 'NanoID is a compact, URL-friendly unique identifier. The default 21-character NanoID has a similar collision probability to UUID v4 but is shorter (21 vs 36 characters) and uses a larger alphabet (A-Za-z0-9_-), making it ideal for URLs and compact storage.',
      },
      {
        question: 'Is NanoID safe for security-sensitive use cases?',
        answer: 'Yes. NanoID uses the Web Crypto API for randomness, which is cryptographically secure. It is safe for tokens, session IDs, and other security-sensitive identifiers.',
      },
      {
        question: 'Can I customize the NanoID alphabet?',
        answer: 'Yes. This tool lets you change the character set and length. Keep in mind that using a smaller alphabet requires a longer ID to maintain the same collision resistance.',
      },
    ],
  },

  {
    slug: 'ulid-generator',
    title: 'ULID Generator',
    category: 'generate',
    seo: {
      title: 'ULID Generator Online - Time-Sortable Unique IDs | Stingr',
      description: 'Generate ULIDs (Universally Unique Lexicographically Sortable Identifiers) instantly. Free, private, 100% in-browser.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Generate/ULIDGenerator'),
    faq: [
      {
        question: 'What is a ULID?',
        answer: 'A ULID (Universally Unique Lexicographically Sortable Identifier) is a 26-character, Crockford Base32-encoded ID. The first 10 characters encode a millisecond timestamp and the remaining 16 are random, so ULIDs sort chronologically by default.',
      },
      {
        question: 'When should I use ULID instead of UUID?',
        answer: 'Use ULID when you need IDs that sort by creation time, such as database primary keys where insert order matters for index performance, event logs, or any system where chronological ordering is useful.',
      },
      {
        question: 'Are ULIDs compatible with UUID columns in databases?',
        answer: 'ULIDs can be stored as strings in any database. Some databases support converting ULIDs to 128-bit binary format, which is the same size as UUID, allowing storage in UUID-typed columns with appropriate conversion.',
      },
    ],
  },

  {
    slug: 'lorem-ipsum-generator',
    title: 'Lorem Ipsum Generator',
    category: 'generate',
    seo: {
      title: 'Lorem Ipsum Generator Online - Paragraphs & Sentences | Stingr',
      description: 'Generate placeholder lorem ipsum text by paragraphs, sentences, or words. Free, private, in-browser tool for designers and developers.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Generate/LoremIpsumGenerator'),
    faq: [
      {
        question: 'What is Lorem Ipsum?',
        answer: 'Lorem Ipsum is placeholder text derived from a 1st-century BC Latin work by Cicero. It has been the printing and typesetting industry\'s standard dummy text since the 1500s, used to fill layouts before final copy is available.',
      },
      {
        question: 'Can I generate a specific number of words or sentences?',
        answer: 'Yes. This tool lets you choose between paragraphs, sentences, or words and specify exactly how many you need for your design mock-up or content prototype.',
      },
      {
        question: 'Why use Lorem Ipsum instead of real text?',
        answer: 'Lorem Ipsum provides a natural distribution of letters and word lengths similar to English, so layouts look realistic without distracting readers with meaningful content during the design phase.',
      },
    ],
  },

  {
    slug: 'qr-code-generator',
    title: 'QR Code Generator',
    category: 'generate',
    seo: {
      title: 'QR Code Generator Online - Free & Private | Stingr',
      description: 'Create QR codes from any text or URL instantly. Free, private, generated entirely in your browser with no server upload.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Generate/QRCodeGenerator'),
    faq: [
      {
        question: 'Is the QR code generated locally?',
        answer: 'Yes. The QR code is rendered entirely in your browser using a client-side library. Your data is never sent to any server, making it safe for sensitive URLs or text.',
      },
      {
        question: 'What content can I encode in a QR code?',
        answer: 'You can encode plain text, URLs, email addresses, phone numbers, Wi-Fi credentials, or any string data. The maximum capacity depends on the error correction level but is typically around 4,000 alphanumeric characters.',
      },
      {
        question: 'Can I download the QR code as an image?',
        answer: 'Yes. You can save the generated QR code as a PNG image directly from the tool for use in print materials, presentations, or web pages.',
      },
    ],
  },

  {
    slug: 'placeholder-image-generator',
    title: 'Placeholder Image Generator',
    category: 'generate',
    seo: {
      title: 'Placeholder Image Generator Online - Custom Dimensions | Stingr',
      description: 'Generate placeholder images with custom size, color, and text. Free, private, created entirely in your browser.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Generate/PlaceholderImageGenerator'),
    faq: [
      {
        question: 'What can I customize in the placeholder image?',
        answer: 'You can set the width, height, background color, text color, and display text. This lets you create images that match your design specifications exactly.',
      },
      {
        question: 'What format is the generated image?',
        answer: 'Images are generated as PNG using the HTML Canvas API in your browser. You can download them directly or copy the data URI for use in HTML or CSS.',
      },
      {
        question: 'Do I need to host these images anywhere?',
        answer: 'No hosting is required during development. You can use the generated data URI inline, or download the PNG and include it in your project assets.',
      },
    ],
  },

  {
    slug: 'fake-data-generator',
    title: 'Fake Data Generator',
    category: 'generate',
    seo: {
      title: 'Fake Data Generator Online - Names, Emails & More | Stingr',
      description: 'Generate realistic fake data for testing: names, emails, addresses, and more. Free, private, 100% in-browser.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Generate/FakeDataGenerator'),
    faq: [
      {
        question: 'What types of fake data can I generate?',
        answer: 'You can generate names, email addresses, phone numbers, physical addresses, company names, dates, and other common data types useful for populating test databases, mock APIs, or UI prototypes.',
      },
      {
        question: 'Is the generated data truly random?',
        answer: 'The data is randomly assembled from realistic word lists and patterns, producing plausible-looking records. It is not linked to real people or organizations.',
      },
      {
        question: 'Can I export fake data as JSON or CSV?',
        answer: 'Yes. Generated records can be copied as JSON for direct use in API mocks or application state, making it easy to integrate into your development workflow.',
      },
    ],
  },

  {
    slug: 'color-palette-generator',
    title: 'Color Palette Generator',
    category: 'generate',
    seo: {
      title: 'Color Palette Generator Online - Beautiful Schemes | Stingr',
      description: 'Generate harmonious color palettes for your designs. Free, private, in-browser color scheme creation tool.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Generate/ColorPaletteGenerator'),
    faq: [
      {
        question: 'What color harmony rules are supported?',
        answer: 'The generator supports complementary, analogous, triadic, split-complementary, and monochromatic schemes, each producing a balanced set of colors from a base hue you choose.',
      },
      {
        question: 'Can I copy the colors in different formats?',
        answer: 'Yes. Each color in the palette can be copied as HEX, RGB, or HSL, making it easy to paste values directly into CSS, design tools, or code.',
      },
      {
        question: 'How do I pick a good base color?',
        answer: 'Start with your brand\'s primary color or a color that reflects the mood of your project. The generator will produce harmonious companions automatically based on color theory.',
      },
    ],
  },

  {
    slug: 'markdown-table-generator',
    title: 'Markdown Table Generator',
    category: 'generate',
    seo: {
      title: 'Markdown Table Generator Online - Easy Table Builder | Stingr',
      description: 'Build Markdown tables visually with custom rows, columns, and alignment. Free, private, in-browser tool.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Generate/MarkdownTableGenerator'),
    faq: [
      {
        question: 'How do I set column alignment?',
        answer: 'You can set each column to left-aligned, center-aligned, or right-aligned. The generator outputs the correct Markdown syntax with colons in the separator row (e.g., :--- for left, :---: for center, ---: for right).',
      },
      {
        question: 'Can I paste data from a spreadsheet?',
        answer: 'You can manually enter data into the visual editor cells. For spreadsheet data, paste it into the tool and adjust the rows and columns as needed to match your source.',
      },
      {
        question: 'Where can I use Markdown tables?',
        answer: 'Markdown tables work in GitHub READMEs, GitLab wikis, Notion, Jira, Confluence, and most documentation platforms that render Markdown.',
      },
    ],
  },

  // ─── Encode/Decode (11) ──────────────────────────────────────────────

  {
    slug: 'base64-encoder',
    title: 'Base64 Encoder/Decoder',
    category: 'encode',
    seo: {
      title: 'Base64 Encoder/Decoder Online - Encode & Decode | Stingr',
      description: 'Encode and decode Base64 strings instantly. Free, private, 100% in-browser Base64 tool with no data sent to a server.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Encode/Base64Card'),
    faq: [
      {
        question: 'What is Base64 encoding?',
        answer: 'Base64 is a binary-to-text encoding scheme that represents binary data using 64 ASCII characters (A-Z, a-z, 0-9, +, /). It is commonly used to embed binary data in JSON, HTML, email attachments, and data URIs.',
      },
      {
        question: 'Does Base64 encoding provide encryption?',
        answer: 'No. Base64 is an encoding, not encryption. It is fully reversible by anyone and provides no security. Use it for data transport, not for hiding sensitive information.',
      },
      {
        question: 'Why does Base64 increase data size?',
        answer: 'Base64 uses 4 characters to represent every 3 bytes of input, resulting in roughly a 33% size increase. This trade-off enables safe transport of binary data through text-only channels.',
      },
    ],
  },

  {
    slug: 'url-encoder',
    title: 'URL Encoder/Decoder',
    category: 'encode',
    seo: {
      title: 'URL Encoder/Decoder Online - Percent Encoding | Stingr',
      description: 'Encode and decode URL (percent-encoded) strings instantly. Free, private, in-browser URL encoding tool.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Encode/UrlEncodeCard'),
    faq: [
      {
        question: 'What is URL encoding?',
        answer: 'URL encoding (percent-encoding) replaces unsafe or reserved characters in URLs with a percent sign followed by their hex value (e.g., a space becomes %20). This ensures URLs are valid and transmitted correctly.',
      },
      {
        question: 'When should I URL-encode a string?',
        answer: 'URL-encode query parameter values, path segments containing special characters, and any user-supplied data included in a URL. This prevents characters like &, =, and # from breaking the URL structure.',
      },
      {
        question: 'What is the difference between encodeURI and encodeURIComponent?',
        answer: 'encodeURI encodes a full URI, leaving reserved characters like /, ?, and # intact. encodeURIComponent encodes everything, making it suitable for individual query parameter values.',
      },
    ],
  },

  {
    slug: 'url-parser',
    title: 'URL Parser',
    category: 'encode',
    seo: {
      title: 'URL Parser Online - Break URLs Into Parts | Stingr',
      description: 'Parse any URL into protocol, host, port, path, query parameters, and hash fragment. Click to copy each part. Free, private, in-browser.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Encode/UrlParserCard'),
    faq: [
      {
        question: 'What does the URL Parser do?',
        answer: 'It breaks a URL into its component parts: protocol (http/https), hostname, port, pathname, query parameters (as individual key-value pairs), and hash fragment. Each part can be copied with one click.',
      },
      {
        question: 'What URL formats are supported?',
        answer: 'Any valid URL is supported, including http, https, ftp, and other protocols. The parser uses the browser\'s built-in URL constructor for reliable, standards-compliant parsing.',
      },
      {
        question: 'How are query parameters handled?',
        answer: 'Query parameters are automatically split into individual key-value pairs, making it easy to inspect and copy each parameter separately. Encoded values like %20 are decoded for readability.',
      },
    ],
  },

  {
    slug: 'html-entity-encoder',
    title: 'HTML Entity Encoder/Decoder',
    category: 'encode',
    seo: {
      title: 'HTML Entity Encoder/Decoder Online - Escape HTML | Stingr',
      description: 'Encode and decode HTML entities for safe rendering. Free, private, in-browser HTML escaping tool.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Encode/HtmlEntityCard'),
    faq: [
      {
        question: 'What are HTML entities?',
        answer: 'HTML entities are special codes that represent reserved characters in HTML, such as &lt; for <, &gt; for >, and &amp; for &. They prevent browsers from interpreting those characters as markup.',
      },
      {
        question: 'Why should I encode HTML entities?',
        answer: 'Encoding prevents cross-site scripting (XSS) attacks and ensures that user-supplied text displays correctly in web pages without being parsed as HTML tags or attributes.',
      },
      {
        question: 'What characters need to be HTML-encoded?',
        answer: 'At minimum, encode <, >, &, " (double quote), and \' (single quote). These five characters can break HTML structure or enable injection attacks if left unescaped in user content.',
      },
    ],
  },

  {
    slug: 'json-escape',
    title: 'JSON Escape/Unescape',
    category: 'encode',
    seo: {
      title: 'JSON Escape/Unescape Online - String Escaping | Stingr',
      description: 'Escape and unescape JSON strings with special characters. Free, private, in-browser JSON string tool.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Encode/JsonEscapeCard'),
    faq: [
      {
        question: 'What characters are escaped in JSON strings?',
        answer: 'JSON requires escaping double quotes (\\"), backslashes (\\\\), and control characters including newline (\\n), tab (\\t), carriage return (\\r), backspace (\\b), and form feed (\\f). Unicode characters outside the Basic Latin block can be escaped as \\uXXXX.',
      },
      {
        question: 'When do I need to escape a JSON string?',
        answer: 'Escape JSON strings when embedding user input into JSON payloads, constructing JSON by hand, or when storing JSON inside another JSON string (double-serialization).',
      },
      {
        question: 'Is this the same as JSON.stringify?',
        answer: 'Similar. JSON.stringify on a string value wraps it in quotes and escapes special characters. This tool performs the same escaping without the surrounding quotes, which is useful for embedding values in templates.',
      },
    ],
  },

  {
    slug: 'jwt-decoder',
    title: 'JWT Decoder',
    category: 'encode',
    seo: {
      title: 'JWT Decoder Online - Decode JSON Web Tokens | Stingr',
      description: 'Decode and inspect JWT header and payload instantly. Free, private, in-browser JWT decoder with no token sent to a server.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Encode/JwtDecodeCard'),
    faq: [
      {
        question: 'What is a JWT?',
        answer: 'A JSON Web Token (JWT) is a compact, URL-safe token format used for authentication and information exchange. It consists of three Base64URL-encoded parts: header, payload, and signature, separated by dots.',
      },
      {
        question: 'Does this tool verify the JWT signature?',
        answer: 'This tool decodes and displays the header and payload for inspection. Signature verification requires the secret key or public key, which should never be entered into an online tool for production tokens.',
      },
      {
        question: 'Is it safe to paste my JWT here?',
        answer: 'Yes. This tool runs entirely in your browser. Your token is never sent to any server. However, avoid sharing JWTs publicly as they may contain sensitive claims like user IDs or permissions.',
      },
    ],
  },

  {
    slug: 'hex-encoder',
    title: 'Hex Encoder/Decoder',
    category: 'encode',
    seo: {
      title: 'Hex Encoder/Decoder Online - Hexadecimal Conversion | Stingr',
      description: 'Convert text to hexadecimal and back. Free, private, in-browser hex encoding and decoding tool.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Encode/HexEncodeCard'),
    faq: [
      {
        question: 'What is hexadecimal encoding?',
        answer: 'Hexadecimal (hex) encoding represents each byte of data as two hex digits (0-9, a-f). It is widely used in programming, debugging, color codes, and low-level data inspection.',
      },
      {
        question: 'How is hex different from Base64?',
        answer: 'Hex uses 2 characters per byte (100% size increase), while Base64 uses 4 characters per 3 bytes (33% increase). Hex is more readable for small data; Base64 is more compact for larger payloads.',
      },
      {
        question: 'Can I decode hex strings with spaces or 0x prefixes?',
        answer: 'Yes. The tool handles common hex formats including space-separated bytes (e.g., "48 65 6c 6c 6f"), 0x-prefixed values, and continuous hex strings.',
      },
    ],
  },

  {
    slug: 'unicode-escape',
    title: 'Unicode Escape/Unescape',
    category: 'encode',
    seo: {
      title: 'Unicode Escape/Unescape Online - \\u Notation | Stingr',
      description: 'Convert text to Unicode escape sequences and back. Free, private, in-browser Unicode tool for developers.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Encode/UnicodeEscapeCard'),
    faq: [
      {
        question: 'What are Unicode escape sequences?',
        answer: 'Unicode escape sequences represent characters using the format \\uXXXX where XXXX is the 4-digit hexadecimal code point. For example, \\u0041 represents the letter "A". Characters outside the Basic Multilingual Plane use surrogate pairs.',
      },
      {
        question: 'When would I need to escape Unicode?',
        answer: 'Unicode escaping is useful when working with source code that must be ASCII-only, debugging encoding issues, embedding special characters in JSON or JavaScript strings, or inspecting the code points of unfamiliar characters.',
      },
      {
        question: 'Does this handle emoji and supplementary characters?',
        answer: 'Yes. Characters outside the Basic Multilingual Plane (including emoji) are represented using surrogate pairs (two \\uXXXX sequences) or the ES6 \\u{XXXXX} syntax for code points above U+FFFF.',
      },
    ],
  },

  {
    slug: 'image-to-base64',
    title: 'Image to Base64',
    category: 'encode',
    seo: {
      title: 'Image to Base64 Converter Online - Data URI | Stingr',
      description: 'Convert images to Base64 data URIs for embedding in HTML and CSS. Free, private, runs entirely in your browser.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Encode/ImageBase64Card'),
    faq: [
      {
        question: 'Why convert an image to Base64?',
        answer: 'Base64-encoded images can be embedded directly in HTML, CSS, or JSON without a separate HTTP request. This is useful for small icons, email templates, and single-file HTML documents.',
      },
      {
        question: 'Is my image uploaded to a server?',
        answer: 'No. The image is read and converted entirely in your browser using the FileReader API. Your file never leaves your device.',
      },
      {
        question: 'What image formats are supported?',
        answer: 'All browser-supported formats work, including PNG, JPEG, GIF, SVG, WebP, and ICO. The generated data URI includes the correct MIME type automatically.',
      },
    ],
  },

  {
    slug: 'aes-encryption',
    title: 'AES Encryption/Decryption',
    category: 'encode',
    seo: {
      title: 'AES Encryption/Decryption Online - Encrypt Text | Stingr',
      description: 'Encrypt and decrypt text with AES-256. Free, private, 100% in-browser using the Web Crypto API.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Encode/AesCard'),
    faq: [
      {
        question: 'How secure is AES encryption in the browser?',
        answer: 'This tool uses the Web Crypto API\'s AES-GCM implementation, which is the same battle-tested library used by browsers for TLS. AES-256 is considered secure by NIST and is used by governments and enterprises worldwide.',
      },
      {
        question: 'Is my data sent to any server?',
        answer: 'No. Encryption and decryption happen entirely in your browser. Your plaintext, ciphertext, and key never leave your device.',
      },
      {
        question: 'What should I use as an encryption key?',
        answer: 'Use a strong passphrase or a randomly generated key. The tool derives a 256-bit encryption key from your input. Longer, more random passphrases provide stronger security.',
      },
    ],
  },

  {
    slug: 'binary-encoder',
    title: 'Binary Encoder/Decoder',
    category: 'encode',
    seo: {
      title: 'Binary Encoder/Decoder Online - Text to Binary | Stingr',
      description: 'Convert text to binary representation and back. Free, private, in-browser binary encoding tool.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Encode/BinaryCard'),
    faq: [
      {
        question: 'How does text-to-binary conversion work?',
        answer: 'Each character in the text is converted to its binary (base-2) representation based on its Unicode code point. For ASCII characters, this is an 8-bit binary number. For example, the letter "A" (code point 65) becomes 01000001.',
      },
      {
        question: 'Can I decode binary back to text?',
        answer: 'Yes. Paste a binary string (with or without spaces between bytes) and the tool converts it back to the original text characters.',
      },
      {
        question: 'What is binary encoding used for?',
        answer: 'Binary encoding is fundamental to how computers store and process data. Understanding it is useful for debugging, learning about data representation, working with network protocols, and low-level programming.',
      },
    ],
  },

  {
    slug: 'markdown-preview',
    title: 'Markdown Preview',
    category: 'encode',
    seo: {
      title: 'Markdown Preview Online - Live Renderer | Stingr',
      description: 'Write Markdown and see rendered HTML in real time. Free, private, in-browser Markdown preview tool.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Encode/MarkdownPreviewCard'),
    faq: [
      {
        question: 'What Markdown features are supported?',
        answer: 'The preview supports standard Markdown including headings, bold, italic, links, images, code blocks with syntax highlighting, blockquotes, ordered and unordered lists, tables, and horizontal rules.',
      },
      {
        question: 'Is the preview rendered in real time?',
        answer: 'Yes. As you type, the Markdown is parsed and rendered instantly in the preview pane, giving you immediate visual feedback.',
      },
      {
        question: 'Can I use this for GitHub README previews?',
        answer: 'Yes. The renderer supports GitHub Flavored Markdown (GFM) features like tables, task lists, and fenced code blocks, so your output will closely match how GitHub renders it.',
      },
    ],
  },

  // ─── Hash (3) ────────────────────────────────────────────────────────

  {
    slug: 'hash-generator',
    title: 'Hash Generator',
    category: 'hash',
    seo: {
      title: 'Hash Generator Online - MD5, SHA-1, SHA-256 & More | Stingr',
      description: 'Generate MD5, SHA-1, SHA-256, and SHA-512 hashes from any text. Free, private, 100% in-browser hashing.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Hash/HashGenerator'),
    faq: [
      {
        question: 'What hash algorithms are available?',
        answer: 'This tool supports MD5, SHA-1, SHA-256, and SHA-512. SHA-256 and SHA-512 use the Web Crypto API for maximum performance and security. MD5 is implemented in JavaScript for compatibility.',
      },
      {
        question: 'Which hash algorithm should I use?',
        answer: 'For security purposes (password hashing, data integrity), use SHA-256 or SHA-512. MD5 and SHA-1 have known collision vulnerabilities and should only be used for non-security checksums or legacy compatibility.',
      },
      {
        question: 'Can hashes be reversed?',
        answer: 'No. Cryptographic hash functions are one-way. You cannot recover the original input from a hash. This is by design and is what makes hashing useful for password storage and data integrity verification.',
      },
    ],
  },

  {
    slug: 'hash-verifier',
    title: 'Hash Verifier',
    category: 'hash',
    seo: {
      title: 'Hash Verifier Online - Compare & Verify Hashes | Stingr',
      description: 'Verify file or text integrity by comparing hash values. Free, private, in-browser hash verification tool.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Hash/HashVerifier'),
    faq: [
      {
        question: 'How does hash verification work?',
        answer: 'You provide the original data and an expected hash value. The tool computes the hash of your data and compares it to the expected value. If they match, the data has not been tampered with or corrupted.',
      },
      {
        question: 'Why should I verify hashes?',
        answer: 'Hash verification confirms that a downloaded file or received message has not been altered in transit. Software distributors publish checksums so users can verify download integrity.',
      },
      {
        question: 'Does the comparison handle different formats?',
        answer: 'Yes. The tool normalizes the hash comparison by ignoring case differences and whitespace, so "a1b2c3" matches "A1B2C3" and "a1 b2 c3".',
      },
    ],
  },

  {
    slug: 'file-checksum',
    title: 'File Checksum',
    category: 'hash',
    seo: {
      title: 'File Checksum Calculator Online - MD5, SHA-256 | Stingr',
      description: 'Calculate MD5, SHA-1, SHA-256, and SHA-512 checksums for any file. Free, private, processed entirely in your browser.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Hash/FileChecksum'),
    faq: [
      {
        question: 'Is my file uploaded to a server?',
        answer: 'No. The file is read and hashed entirely in your browser using the File API and Web Crypto API. Your file never leaves your device.',
      },
      {
        question: 'Can I hash large files?',
        answer: 'Yes. The tool reads files in chunks to avoid memory issues, so it can handle files of any size supported by your browser. Processing time depends on file size and your device speed.',
      },
      {
        question: 'What is a file checksum used for?',
        answer: 'A checksum is a fingerprint of a file\'s contents. It is used to verify download integrity, detect file corruption, and confirm that two files are identical without comparing them byte by byte.',
      },
    ],
  },

  // ─── Convert (13) ────────────────────────────────────────────────────

  {
    slug: 'timestamp-converter',
    title: 'Timestamp Converter',
    category: 'convert',
    seo: {
      title: 'Unix Timestamp Converter Online - Epoch to Date | Stingr',
      description: 'Convert Unix timestamps to human-readable dates and vice versa. Free, private, in-browser epoch converter.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Convert/TimestampCard'),
    faq: [
      {
        question: 'What is a Unix timestamp?',
        answer: 'A Unix timestamp (or epoch time) is the number of seconds that have elapsed since January 1, 1970 00:00:00 UTC. It is a standard way to represent time in programming and databases.',
      },
      {
        question: 'Does this tool handle millisecond timestamps?',
        answer: 'Yes. The converter auto-detects whether the input is in seconds (10 digits) or milliseconds (13 digits) and converts accordingly.',
      },
      {
        question: 'What timezone is used for conversion?',
        answer: 'The tool displays results in both UTC and your local timezone. You can see exactly how the timestamp maps to your current time and the universal reference time.',
      },
    ],
  },

  {
    slug: 'json-yaml-converter',
    title: 'JSON to YAML Converter',
    category: 'convert',
    seo: {
      title: 'JSON to YAML Converter Online - Bidirectional | Stingr',
      description: 'Convert between JSON and YAML formats instantly. Free, private, in-browser conversion with syntax validation.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Convert/JsonYamlCard'),
    faq: [
      {
        question: 'What is the difference between JSON and YAML?',
        answer: 'JSON uses braces, brackets, and quotes for structure, making it strict and machine-friendly. YAML uses indentation and minimal punctuation, making it more readable for humans. Both can represent the same data structures.',
      },
      {
        question: 'Will the conversion preserve my data exactly?',
        answer: 'Yes. The conversion is lossless for standard data types (strings, numbers, booleans, arrays, objects, null). YAML-specific features like anchors and custom tags are not part of JSON and cannot be round-tripped.',
      },
      {
        question: 'When should I use YAML over JSON?',
        answer: 'YAML is popular for configuration files (Docker Compose, Kubernetes, GitHub Actions) where human readability matters. JSON is preferred for API payloads, data storage, and contexts where strict parsing is important.',
      },
    ],
  },

  {
    slug: 'csv-json-converter',
    title: 'CSV to JSON Converter',
    category: 'convert',
    seo: {
      title: 'CSV to JSON Converter Online - Bidirectional | Stingr',
      description: 'Convert between CSV and JSON formats with header detection. Free, private, in-browser converter.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Convert/CsvJsonCard'),
    faq: [
      {
        question: 'How are CSV headers handled?',
        answer: 'The first row is treated as column headers by default. Each subsequent row becomes a JSON object with the header values as keys.',
      },
      {
        question: 'Does it handle quoted fields and commas within values?',
        answer: 'Yes. The parser follows RFC 4180, correctly handling quoted fields, commas within quotes, escaped double quotes, and multiline values.',
      },
      {
        question: 'Can I convert JSON back to CSV?',
        answer: 'Yes. Provide a JSON array of objects and the tool generates a CSV with headers derived from the object keys. Nested objects are flattened or stringified as needed.',
      },
    ],
  },

  {
    slug: 'case-converter',
    title: 'Case Converter',
    category: 'convert',
    seo: {
      title: 'Case Converter Online - camelCase, snake_case & More | Stingr',
      description: 'Convert text between camelCase, PascalCase, snake_case, kebab-case, and more. Free, private, in-browser tool.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Convert/CaseConverterCard'),
    faq: [
      {
        question: 'What case formats are supported?',
        answer: 'The tool supports camelCase, PascalCase, snake_case, SCREAMING_SNAKE_CASE, kebab-case, dot.case, path/case, Title Case, Sentence case, and UPPERCASE/lowercase.',
      },
      {
        question: 'Can I convert variable names between programming conventions?',
        answer: 'Yes. This is perfect for converting between JavaScript (camelCase), Python (snake_case), CSS (kebab-case), and constant (SCREAMING_SNAKE_CASE) naming conventions.',
      },
      {
        question: 'How does the tool detect word boundaries?',
        answer: 'Word boundaries are detected from spaces, hyphens, underscores, dots, slashes, and camelCase transitions (lowercase to uppercase). This allows accurate conversion from any supported format to any other.',
      },
    ],
  },

  {
    slug: 'number-base-converter',
    title: 'Number Base Converter',
    category: 'convert',
    seo: {
      title: 'Number Base Converter Online - Binary, Octal, Hex | Stingr',
      description: 'Convert numbers between binary, octal, decimal, and hexadecimal. Free, private, in-browser base converter.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Convert/NumberBaseCard'),
    faq: [
      {
        question: 'What number bases are supported?',
        answer: 'The tool supports binary (base 2), octal (base 8), decimal (base 10), and hexadecimal (base 16). Enter a number in any base and see the equivalent in all others instantly.',
      },
      {
        question: 'Can I convert large numbers?',
        answer: 'Yes. The converter handles numbers within JavaScript\'s safe integer range. For values exceeding that limit, precision may be lost due to floating-point representation.',
      },
      {
        question: 'What are common uses for different bases?',
        answer: 'Binary is used in low-level computing and bitwise operations. Octal is used in Unix file permissions. Decimal is standard for human use. Hexadecimal is used for colors, memory addresses, and compact binary representation.',
      },
    ],
  },

  {
    slug: 'color-converter',
    title: 'Color Converter',
    category: 'convert',
    seo: {
      title: 'Color Converter Online - HEX, RGB, HSL | Stingr',
      description: 'Convert colors between HEX, RGB, and HSL formats with a live preview. Free, private, in-browser tool.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Convert/ColorConverterCard'),
    faq: [
      {
        question: 'What color formats are supported?',
        answer: 'The converter supports HEX (#rrggbb), RGB (rgb(r, g, b)), and HSL (hsl(h, s%, l%)) formats. Enter a value in any format and see the equivalents in all others with a live color preview.',
      },
      {
        question: 'Does it support alpha transparency?',
        answer: 'Yes. You can use 8-digit hex (#rrggbbaa), rgba(), and hsla() notation to include an alpha channel for transparency.',
      },
      {
        question: 'When should I use HSL instead of HEX or RGB?',
        answer: 'HSL is intuitive for designers because you can adjust hue, saturation, and lightness independently. It makes it easy to create color variations (lighter, darker, more vivid) without guessing RGB values.',
      },
    ],
  },

  {
    slug: 'byte-size-converter',
    title: 'Byte Size Converter',
    category: 'convert',
    seo: {
      title: 'Byte Size Converter Online - KB, MB, GB, TB | Stingr',
      description: 'Convert between bytes, KB, MB, GB, TB, and more. Free, private, in-browser data size calculator.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Convert/ByteSizeCard'),
    faq: [
      {
        question: 'What is the difference between KB and KiB?',
        answer: 'KB (kilobyte) is 1,000 bytes using the SI decimal system. KiB (kibibyte) is 1,024 bytes using the IEC binary system. Hard drives use decimal units while operating systems often use binary units, which is why a "500 GB" drive shows as roughly 465 GiB.',
      },
      {
        question: 'What units does this tool support?',
        answer: 'The converter supports bytes, KB, MB, GB, TB, PB (decimal/SI) and their binary equivalents KiB, MiB, GiB, TiB, PiB (IEC). It also supports bits for network bandwidth calculations.',
      },
      {
        question: 'How can I use this for network bandwidth calculations?',
        answer: 'Network speeds are typically in megabits per second (Mbps), while file sizes are in megabytes (MB). Remember that 1 byte = 8 bits, so a 100 Mbps connection transfers about 12.5 MB per second.',
      },
    ],
  },

  {
    slug: 'cron-parser',
    title: 'Cron Expression Parser',
    category: 'convert',
    seo: {
      title: 'Cron Expression Parser Online - Human-Readable | Stingr',
      description: 'Parse and explain cron expressions in plain English with next run times. Free, private, in-browser cron tool.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Convert/CronParserCard'),
    faq: [
      {
        question: 'What is a cron expression?',
        answer: 'A cron expression is a string of five (or six) fields representing a schedule: minute, hour, day of month, month, and day of week. It is used by Unix cron, Kubernetes CronJobs, GitHub Actions, and many scheduling systems.',
      },
      {
        question: 'Does this tool show the next run times?',
        answer: 'Yes. The parser displays the next several scheduled execution times based on the cron expression, helping you verify that the schedule matches your expectations.',
      },
      {
        question: 'What is the difference between * and ? in cron?',
        answer: 'The asterisk (*) means "every value" for that field. The question mark (?) is used in some cron implementations (like Quartz) to mean "no specific value" for day-of-month or day-of-week when the other is specified.',
      },
    ],
  },

  {
    slug: 'regex-tester',
    title: 'Regex Tester',
    category: 'convert',
    seo: {
      title: 'Regex Tester Online - Test Regular Expressions | Stingr',
      description: 'Test and debug regular expressions with real-time match highlighting. Free, private, in-browser regex tool.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Convert/RegexTesterCard'),
    faq: [
      {
        question: 'What regex flavor does this tool use?',
        answer: 'This tool uses JavaScript\'s built-in RegExp engine, which supports features like lookahead, lookbehind (ES2018+), named capture groups, and Unicode property escapes.',
      },
      {
        question: 'Can I see capture groups and their matches?',
        answer: 'Yes. The tool highlights all matches and displays capture group contents, making it easy to verify that your regex extracts the right parts of the input.',
      },
      {
        question: 'What flags are supported?',
        answer: 'You can toggle global (g), case-insensitive (i), multiline (m), dotAll (s), and Unicode (u) flags to modify how the regex engine processes your pattern.',
      },
    ],
  },

  {
    slug: 'chmod-calculator',
    title: 'Chmod Calculator',
    category: 'convert',
    seo: {
      title: 'Chmod Calculator Online - Unix File Permissions | Stingr',
      description: 'Calculate Unix file permissions with symbolic and numeric notation. Free, private, in-browser chmod tool.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Convert/ChmodCalculatorCard'),
    faq: [
      {
        question: 'How do Unix file permissions work?',
        answer: 'Unix permissions control read (r=4), write (w=2), and execute (x=1) access for three groups: owner, group, and others. The numeric value for each group is the sum of its permissions, e.g., 755 means owner=rwx, group=r-x, others=r-x.',
      },
      {
        question: 'What is the difference between 755 and 644?',
        answer: '755 (rwxr-xr-x) gives the owner full access and everyone else read+execute, typical for directories and scripts. 644 (rw-r--r--) gives the owner read+write and everyone else read-only, typical for regular files.',
      },
      {
        question: 'What does the sticky bit, setuid, and setgid do?',
        answer: 'The sticky bit (1000) on a directory prevents users from deleting files they don\'t own. Setuid (4000) runs a file as the file owner. Setgid (2000) runs a file as the file group or makes new files in a directory inherit the group.',
      },
    ],
  },

  {
    slug: 'json-to-typescript',
    title: 'JSON to TypeScript',
    category: 'convert',
    seo: {
      title: 'JSON to TypeScript Converter Online - Auto Type Generation | Stingr',
      description: 'Generate TypeScript interfaces from JSON data automatically. Free, private, in-browser JSON to TS converter.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Convert/JsonToTsCard'),
    faq: [
      {
        question: 'How does the conversion work?',
        answer: 'The tool analyzes the structure and types of your JSON data and generates corresponding TypeScript interfaces. Nested objects become separate interfaces, and arrays are typed based on their contents.',
      },
      {
        question: 'Does it handle nested objects and arrays?',
        answer: 'Yes. Nested objects are extracted into their own interfaces with meaningful names. Arrays of objects are typed by analyzing all elements to produce a union of observed types.',
      },
      {
        question: 'Can I customize the generated interface name?',
        answer: 'Yes. You can set the root interface name and the tool will name nested interfaces based on their property keys, producing clean, readable TypeScript types.',
      },
    ],
  },

  {
    slug: 'html-to-jsx',
    title: 'HTML to JSX Converter',
    category: 'convert',
    seo: {
      title: 'HTML to JSX Converter Online - React Ready | Stingr',
      description: 'Convert HTML to valid JSX for React components instantly. Free, private, in-browser HTML to JSX tool.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Convert/HtmlToJsxCard'),
    faq: [
      {
        question: 'What does this converter change?',
        answer: 'It converts HTML attributes to JSX equivalents: class becomes className, for becomes htmlFor, inline styles become objects, self-closing tags get proper syntax, and event handlers use camelCase (onclick becomes onClick).',
      },
      {
        question: 'Does it handle inline styles?',
        answer: 'Yes. Inline style strings like style="color: red; font-size: 16px" are converted to JSX style objects like style={{color: "red", fontSize: "16px"}} with camelCased property names.',
      },
      {
        question: 'Can I paste entire HTML pages?',
        answer: 'You can paste any HTML fragment. For full pages, extract the body content first since JSX components typically represent a portion of a page rather than the entire document structure.',
      },
    ],
  },

  {
    slug: 'contrast-checker',
    title: 'Contrast Checker',
    category: 'convert',
    seo: {
      title: 'Color Contrast Checker Online - WCAG Compliance | Stingr',
      description: 'Check color contrast ratios for WCAG 2.1 AA and AAA compliance. Free, private, in-browser accessibility tool.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Convert/ContrastCheckerCard'),
    faq: [
      {
        question: 'What contrast ratio is required for WCAG compliance?',
        answer: 'WCAG 2.1 AA requires a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text (18pt+ or 14pt+ bold). AAA requires 7:1 for normal text and 4.5:1 for large text.',
      },
      {
        question: 'Why does color contrast matter?',
        answer: 'Sufficient contrast ensures text is readable for people with low vision, color blindness, or who are viewing screens in bright sunlight. It is a legal requirement under many accessibility laws.',
      },
      {
        question: 'How is the contrast ratio calculated?',
        answer: 'The contrast ratio is calculated using the relative luminance of both colors, following the WCAG 2.1 formula: (L1 + 0.05) / (L2 + 0.05), where L1 is the lighter color\'s luminance and L2 is the darker color\'s luminance.',
      },
    ],
  },

  {
    slug: 'curl-to-code',
    title: 'cURL to Code',
    category: 'convert',
    seo: {
      title: 'cURL to Code Converter - Fetch, Axios, Python, Go | Stingr',
      description: 'Convert cURL commands to Fetch, Axios, Python requests, or Go net/http code. Free, private, 100% in-browser.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Convert/CurlToCodeCard'),
    faq: [
      {
        question: 'What cURL flags are supported?',
        answer: 'The parser handles -X (method), -H (headers), -d/--data/--data-raw (body), -u (basic auth), -A (user-agent), and automatically detects the URL. Flags like --compressed, -k, -L, and -s are recognized but ignored as they don\'t affect the generated code.',
      },
      {
        question: 'Which languages can I convert cURL commands to?',
        answer: 'Currently supports JavaScript Fetch API, Axios, Python requests, and Go net/http. Each output is idiomatic for the target language and includes headers and body handling.',
      },
      {
        question: 'Does this tool send my cURL command to a server?',
        answer: 'No. All parsing and code generation happens entirely in your browser. Your API keys, tokens, and request data never leave your machine.',
      },
    ],
  },

  {
    slug: 'jsonpath-evaluator',
    title: 'JSONPath Evaluator',
    category: 'convert',
    seo: {
      title: 'JSONPath Evaluator Online - Test JSONPath Expressions | Stingr',
      description: 'Test JSONPath expressions against JSON data and see matching values instantly. Supports dot notation, wildcards, filters, and recursive descent.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Convert/JsonPathCard'),
    faq: [
      {
        question: 'What JSONPath syntax is supported?',
        answer: 'Supports $ (root), .property (dot notation), [\'prop\'] (bracket notation), [0] (array index), [*] (wildcard), [0:5] (array slice), .. (recursive descent), and [?(@.field > value)] (filter expressions).',
      },
      {
        question: 'How is JSONPath different from jq?',
        answer: 'JSONPath uses $ as the root and dot/bracket notation (e.g., $.store.books[*].title), while jq uses . as root with pipe-based chaining (e.g., .store.books[].title). JSONPath is common in Java/JS libraries; jq is a standalone CLI tool with more powerful transformations.',
      },
      {
        question: 'Can I use filter expressions?',
        answer: 'Yes. Use [?(@.field op value)] syntax where op can be ==, !=, >, <, >=, or <=. For example, $.books[?(@.price > 10)] finds all books with price greater than 10.',
      },
    ],
  },

  {
    slug: 'xml-json-converter',
    title: 'XML ↔ JSON Converter',
    category: 'convert',
    seo: {
      title: 'XML to JSON Converter Online - Bidirectional | Stingr',
      description: 'Convert XML to JSON and JSON to XML instantly. Preserves attributes, handles nested elements. Free, private, in-browser.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Convert/XmlJsonCard'),
    faq: [
      {
        question: 'How are XML attributes handled in JSON?',
        answer: 'XML attributes are converted to JSON keys prefixed with @ (e.g., <book category="fiction"> becomes {"@category": "fiction"}). When converting back, @ prefixed keys are restored as XML attributes.',
      },
      {
        question: 'What happens with repeated XML elements?',
        answer: 'When multiple sibling elements share the same tag name, they are automatically grouped into a JSON array. For example, multiple <item> elements become an "item" array in JSON.',
      },
      {
        question: 'Does this converter require any external libraries?',
        answer: 'No. It uses the browser\'s built-in DOMParser for XML parsing and constructs JSON/XML output with pure JavaScript. No data is sent to any server.',
      },
    ],
  },

  {
    slug: 'subnet-calculator',
    title: 'Subnet Calculator',
    category: 'convert',
    seo: {
      title: 'Subnet Calculator Online - IPv4 CIDR Calculator | Stingr',
      description: 'Calculate IPv4 subnet details from CIDR notation. Get network address, broadcast, host range, subnet mask, and more. Free, in-browser.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Convert/SubnetCalculatorCard'),
    faq: [
      {
        question: 'What is CIDR notation?',
        answer: 'CIDR (Classless Inter-Domain Routing) notation combines an IP address with a prefix length separated by a slash, e.g., 192.168.1.0/24. The prefix length (0-32) indicates how many leading bits define the network portion of the address.',
      },
      {
        question: 'How do I calculate the number of usable hosts?',
        answer: 'For a /N network, total addresses = 2^(32-N). Usable hosts = total - 2 (subtracting the network address and broadcast address). For example, /24 has 256 total addresses and 254 usable hosts. /31 and /32 are special cases used for point-to-point links.',
      },
      {
        question: 'What are private IP ranges?',
        answer: 'RFC 1918 defines three private ranges: 10.0.0.0/8 (Class A), 172.16.0.0/12 (Class B), and 192.168.0.0/16 (Class C). These are not routable on the public internet and are used for internal networks.',
      },
    ],
  },

  {
    slug: 'http-status-codes',
    title: 'HTTP Status Codes',
    category: 'convert',
    seo: {
      title: 'HTTP Status Codes Reference - Complete List | Stingr',
      description: 'Searchable reference of all HTTP status codes with descriptions. Filter by category (1xx-5xx). Free, instant, in-browser.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Convert/HttpStatusCard'),
    faq: [
      {
        question: 'What is the difference between 401 and 403?',
        answer: '401 Unauthorized means authentication is missing or invalid — the client should provide valid credentials. 403 Forbidden means the server understood the request but refuses to authorize it — authentication won\'t help because the user lacks permission.',
      },
      {
        question: 'When should I use 404 vs 410?',
        answer: '404 Not Found means the resource cannot be found and it\'s unknown whether the absence is temporary or permanent. 410 Gone explicitly indicates the resource was intentionally removed and won\'t be available again, which helps search engines delist it faster.',
      },
      {
        question: 'What does HTTP 418 mean?',
        answer: 'HTTP 418 "I\'m a Teapot" was defined in RFC 2324 (Hyper Text Coffee Pot Control Protocol) as an April Fools\' joke in 1998. It indicates the server refuses to brew coffee because it is a teapot. Despite being a joke, it persists in many HTTP libraries.',
      },
    ],
  },

  // ─── Text Tools (9) ──────────────────────────────────────────────────

  {
    slug: 'text-diff',
    title: 'Text Diff',
    category: 'text',
    seo: {
      title: 'Text Diff Tool Online - Compare Text Side by Side | Stingr',
      description: 'Compare two blocks of text and see differences highlighted. Free, private, in-browser text comparison tool.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Text/TextDiffCard'),
    faq: [
      {
        question: 'How does the diff algorithm work?',
        answer: 'The tool uses a line-by-line diff algorithm that identifies added, removed, and changed lines between two text inputs. Changes are highlighted with color coding for easy visual comparison.',
      },
      {
        question: 'Can I compare JSON or code files?',
        answer: 'Yes. You can paste any plain text, including JSON, code, configuration files, or prose. The diff works on any text content regardless of format.',
      },
      {
        question: 'Does it show inline character-level changes?',
        answer: 'Yes. Within changed lines, the tool highlights the specific characters that differ, making it easy to spot subtle differences like typos or small value changes.',
      },
    ],
  },

  {
    slug: 'text-stats',
    title: 'Text Statistics',
    category: 'text',
    seo: {
      title: 'Text Statistics Online - Word Count & Readability | Stingr',
      description: 'Count words, characters, sentences, and analyze readability. Free, private, in-browser text analysis tool.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Text/TextStatsCard'),
    faq: [
      {
        question: 'What statistics are calculated?',
        answer: 'The tool counts characters (with and without spaces), words, sentences, paragraphs, and lines. It also estimates reading time and may provide readability scores.',
      },
      {
        question: 'How is reading time estimated?',
        answer: 'Reading time is calculated based on an average adult reading speed of approximately 200-250 words per minute. The actual time depends on text complexity and reader proficiency.',
      },
      {
        question: 'Does it count words the same way as Microsoft Word?',
        answer: 'Word counting follows the standard convention of splitting by whitespace boundaries. Results should closely match word processors like Microsoft Word and Google Docs for most text.',
      },
    ],
  },

  {
    slug: 'text-case-transform',
    title: 'Text Case Transform',
    category: 'text',
    seo: {
      title: 'Text Case Transform Online - Upper, Lower, Title Case | Stingr',
      description: 'Transform text to UPPERCASE, lowercase, Title Case, and more. Free, private, in-browser case converter.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Text/CaseTransformCard'),
    faq: [
      {
        question: 'What case transformations are available?',
        answer: 'The tool supports UPPERCASE, lowercase, Title Case, Sentence case, tOGGLE cASE, and more. Each transformation processes the entire input text instantly.',
      },
      {
        question: 'How does Title Case work?',
        answer: 'Title Case capitalizes the first letter of each word. Depending on the implementation, it may also lowercase small words like "a", "an", "the", "in", and "of" when they are not the first word.',
      },
      {
        question: 'Can I use this for programming variable names?',
        answer: 'For programming-specific formats like camelCase, PascalCase, or snake_case, use the dedicated Case Converter tool in the Convert category, which is designed specifically for code naming conventions.',
      },
    ],
  },

  {
    slug: 'find-and-replace',
    title: 'Find and Replace',
    category: 'text',
    seo: {
      title: 'Find and Replace Online - Text & Regex | Stingr',
      description: 'Find and replace text with plain text or regex patterns. Free, private, in-browser search and replace tool.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Text/FindReplaceCard'),
    faq: [
      {
        question: 'Does this support regular expressions?',
        answer: 'Yes. You can toggle regex mode to use full JavaScript regular expression syntax for powerful pattern matching, including capture groups that can be referenced in the replacement string with $1, $2, etc.',
      },
      {
        question: 'Can I do case-insensitive replacements?',
        answer: 'Yes. Toggle the case-sensitivity option to match text regardless of uppercase or lowercase, making it easy to find and replace words in any capitalization.',
      },
      {
        question: 'How do I replace only specific occurrences?',
        answer: 'You can choose to replace all matches at once or review and replace matches one by one. The match count tells you how many instances were found before you commit to changes.',
      },
    ],
  },

  {
    slug: 'sort-lines',
    title: 'Sort Lines',
    category: 'text',
    seo: {
      title: 'Sort Lines Online - Alphabetical & Numeric | Stingr',
      description: 'Sort lines of text alphabetically, numerically, or in reverse order. Free, private, in-browser line sorter.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Text/SortLinesCard'),
    faq: [
      {
        question: 'What sort options are available?',
        answer: 'You can sort lines alphabetically (A-Z or Z-A), numerically, by line length, or randomly shuffle them. Case-sensitive and case-insensitive sorting modes are both available.',
      },
      {
        question: 'Can I sort and remove duplicates at the same time?',
        answer: 'The sort tool focuses on ordering. For removing duplicate lines, use the Deduplicate Lines tool, then sort the result here for a clean, sorted, unique list.',
      },
      {
        question: 'How does numeric sorting differ from alphabetical?',
        answer: 'Alphabetical sorting treats values as strings ("10" comes before "9" because "1" < "9"). Numeric sorting parses numbers from lines and sorts by their actual value, so 9 correctly comes before 10.',
      },
    ],
  },

  {
    slug: 'line-numbers',
    title: 'Line Numbers',
    category: 'text',
    seo: {
      title: 'Add Line Numbers Online - Prefix Lines | Stingr',
      description: 'Add or remove line numbers from text. Free, private, in-browser line numbering tool for code and text.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Text/LineNumberCard'),
    faq: [
      {
        question: 'What formatting options are available?',
        answer: 'You can customize the starting number, separator character (e.g., "." or ":"), padding width, and whether to number blank lines. This makes it easy to match your preferred format.',
      },
      {
        question: 'Can I remove existing line numbers?',
        answer: 'Yes. The tool can strip leading line numbers from text, which is useful when copying numbered code from documentation or websites.',
      },
      {
        question: 'Why would I need to add line numbers?',
        answer: 'Line numbers are useful for referencing specific lines in code reviews, documentation, bug reports, or when sharing code snippets in emails or chat messages where syntax highlighting is unavailable.',
      },
    ],
  },

  {
    slug: 'deduplicate-lines',
    title: 'Deduplicate Lines',
    category: 'text',
    seo: {
      title: 'Deduplicate Lines Online - Remove Duplicate Lines | Stingr',
      description: 'Remove duplicate lines from text while preserving order. Free, private, in-browser deduplication tool.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Text/DeduplicateLinesCard'),
    faq: [
      {
        question: 'Does deduplication preserve the original order?',
        answer: 'Yes. The first occurrence of each unique line is kept in its original position. Subsequent duplicates are removed without rearranging the remaining lines.',
      },
      {
        question: 'Is the comparison case-sensitive?',
        answer: 'By default, the comparison is case-sensitive, so "Hello" and "hello" are treated as different lines. You can toggle case-insensitive mode to treat them as duplicates.',
      },
      {
        question: 'Can I see which lines were duplicated?',
        answer: 'The tool shows how many duplicate lines were removed, helping you understand the extent of duplication in your text.',
      },
    ],
  },

  {
    slug: 'reverse-text',
    title: 'Reverse Text',
    category: 'text',
    seo: {
      title: 'Reverse Text Online - Flip Characters & Lines | Stingr',
      description: 'Reverse text by characters, words, or lines. Free, private, in-browser text reversal tool.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Text/ReverseTextCard'),
    faq: [
      {
        question: 'What reversal modes are available?',
        answer: 'You can reverse the entire string character by character, reverse the order of words while keeping characters in each word intact, or reverse the order of lines.',
      },
      {
        question: 'Does it handle Unicode and emoji correctly?',
        answer: 'The tool is designed to handle multi-byte Unicode characters and emoji correctly, reversing by grapheme clusters rather than individual code units to avoid breaking combined characters.',
      },
      {
        question: 'What are practical uses for reversing text?',
        answer: 'Text reversal is useful for palindrome checks, creating mirrored text effects, reversing log file order, debugging string manipulation code, and educational purposes.',
      },
    ],
  },

  {
    slug: 'text-trimmer',
    title: 'Text Trimmer',
    category: 'text',
    seo: {
      title: 'Text Trimmer Online - Remove Whitespace & Blank Lines | Stingr',
      description: 'Trim whitespace, remove blank lines, and clean up messy text. Free, private, in-browser text cleaner.',
      priority: 0.7,
      changefreq: 'monthly',
    },
    component: () => import('../components/Text/TextTrimmerCard'),
    faq: [
      {
        question: 'What cleaning options are available?',
        answer: 'You can trim leading and trailing whitespace from each line, remove blank lines, collapse multiple spaces into one, remove all whitespace, and strip trailing whitespace while preserving indentation.',
      },
      {
        question: 'Will trimming break my code indentation?',
        answer: 'The tool offers separate options for leading and trailing whitespace. You can remove trailing whitespace only to clean up files without affecting indentation structure.',
      },
      {
        question: 'Can I remove only blank lines without changing other whitespace?',
        answer: 'Yes. The blank line removal option targets only empty lines (or lines with only whitespace), leaving the content and formatting of non-empty lines completely untouched.',
      },
    ],
  },
];

export function getToolBySlug(slug) {
  return toolRegistry.find(t => t.slug === slug);
}

export function getToolsByCategory(category) {
  return toolRegistry.filter(t => t.category === category);
}
