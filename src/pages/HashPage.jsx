import HashGenerator from '../components/Hash/HashGenerator';
import HashVerifier from '../components/Hash/HashVerifier';
import FileChecksum from '../components/Hash/FileChecksum';

function HashPage() {
  return (
    <div className="h-full overflow-y-auto">
      <HashGenerator toolSlug="hash-generator" />
      <HashVerifier toolSlug="hash-verifier" />
      <FileChecksum toolSlug="file-checksum" />
    </div>
  );
}

export default HashPage;
