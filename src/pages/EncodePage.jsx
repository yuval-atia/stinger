import { Link } from 'react-router-dom';
import Base64Card from '../components/Encode/Base64Card';
import UrlEncodeCard from '../components/Encode/UrlEncodeCard';
import UrlParserCard from '../components/Encode/UrlParserCard';
import HtmlEntityCard from '../components/Encode/HtmlEntityCard';
import JwtDecodeCard from '../components/Encode/JwtDecodeCard';
import HexEncodeCard from '../components/Encode/HexEncodeCard';
import UnicodeEscapeCard from '../components/Encode/UnicodeEscapeCard';
import MarkdownPreviewCard from '../components/Encode/MarkdownPreviewCard';
import JsonEscapeCard from '../components/Encode/JsonEscapeCard';
import ImageBase64Card from '../components/Encode/ImageBase64Card';
import AesCard from '../components/Encode/AesCard';
import BinaryCard from '../components/Encode/BinaryCard';

function EncodePage() {
  return (
    <div className="h-full overflow-y-auto">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-3">
        <Link to="/" className="hover:text-[var(--accent-color)] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[var(--text-primary)]">Encode/Decode</span>
      </nav>
      <h1 className="text-xl font-bold mb-1">Base64, URL & JWT Encoder</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-4">Encode and decode Base64, URLs, HTML entities, JWT tokens, hex, Unicode escapes, and Markdown. Free client-side tools.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
        <Base64Card toolSlug="base64-encoder" />
        <UrlEncodeCard toolSlug="url-encoder" />
        <UrlParserCard toolSlug="url-parser" />
        <HtmlEntityCard toolSlug="html-entity-encoder" />
        <JsonEscapeCard toolSlug="json-escape" />
        <JwtDecodeCard toolSlug="jwt-decoder" />
        <HexEncodeCard toolSlug="hex-encoder" />
        <UnicodeEscapeCard toolSlug="unicode-escape" />
        <ImageBase64Card toolSlug="image-to-base64" />
        <AesCard toolSlug="aes-encryption" />
        <BinaryCard toolSlug="binary-encoder" />
        <MarkdownPreviewCard toolSlug="markdown-preview" />
      </div>
    </div>
  );
}

export default EncodePage;
