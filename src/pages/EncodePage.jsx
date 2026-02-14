import Base64Card from '../components/Encode/Base64Card';
import UrlEncodeCard from '../components/Encode/UrlEncodeCard';
import HtmlEntityCard from '../components/Encode/HtmlEntityCard';
import JwtDecodeCard from '../components/Encode/JwtDecodeCard';
import HexEncodeCard from '../components/Encode/HexEncodeCard';
import UnicodeEscapeCard from '../components/Encode/UnicodeEscapeCard';
import MarkdownPreviewCard from '../components/Encode/MarkdownPreviewCard';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

function EncodePage() {
  useDocumentTitle('Base64, URL & JWT Encoder');
  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
        <Base64Card />
        <UrlEncodeCard />
        <HtmlEntityCard />
        <JwtDecodeCard />
        <HexEncodeCard />
        <UnicodeEscapeCard />
        <MarkdownPreviewCard />
      </div>
    </div>
  );
}

export default EncodePage;
