import UUIDGenerator from '../components/Generate/UUIDGenerator';
import ULIDGenerator from '../components/Generate/ULIDGenerator';
import NanoIDGenerator from '../components/Generate/NanoIDGenerator';
import APIKeyGenerator from '../components/Generate/APIKeyGenerator';
import LoremIpsumGenerator from '../components/Generate/LoremIpsumGenerator';
import QRCodeGenerator from '../components/Generate/QRCodeGenerator';
import PasswordGenerator from '../components/Generate/PasswordGenerator';
import FakeDataGenerator from '../components/Generate/FakeDataGenerator';
import ColorPaletteGenerator from '../components/Generate/ColorPaletteGenerator';
import PlaceholderImageGenerator from '../components/Generate/PlaceholderImageGenerator';
import MarkdownTableGenerator from '../components/Generate/MarkdownTableGenerator';

function GeneratePage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
        <UUIDGenerator toolSlug="uuid-generator" />
        <APIKeyGenerator toolSlug="api-key-generator" />
        <PasswordGenerator toolSlug="password-generator" />
        <NanoIDGenerator toolSlug="nanoid-generator" />
        <ULIDGenerator toolSlug="ulid-generator" />
        <LoremIpsumGenerator toolSlug="lorem-ipsum-generator" />
        <QRCodeGenerator toolSlug="qr-code-generator" />
        <PlaceholderImageGenerator toolSlug="placeholder-image-generator" />
        <FakeDataGenerator toolSlug="fake-data-generator" />
        <ColorPaletteGenerator toolSlug="color-palette-generator" />
        <MarkdownTableGenerator toolSlug="markdown-table-generator" />
      </div>
    </div>
  );
}

export default GeneratePage;
