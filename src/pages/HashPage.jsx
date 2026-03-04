import { Link } from 'react-router-dom';
import HashGenerator from '../components/Hash/HashGenerator';
import HashVerifier from '../components/Hash/HashVerifier';
import FileChecksum from '../components/Hash/FileChecksum';

function HashPage() {
  return (
    <div className="h-full overflow-y-auto">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] mb-3">
        <Link to="/" className="hover:text-[var(--accent-color)] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[var(--text-primary)]">Hash</span>
      </nav>
      <h1 className="text-xl font-bold mb-1">SHA-256, MD5 & Hash Generator</h1>
      <p className="text-sm text-[var(--text-secondary)] mb-4">Generate MD5, SHA-1, SHA-256, SHA-512 hashes and HMAC signatures. Privacy-focused — all hashing in-browser.</p>
      <HashGenerator toolSlug="hash-generator" />
      <HashVerifier toolSlug="hash-verifier" />
      <FileChecksum toolSlug="file-checksum" />
    </div>
  );
}

export default HashPage;
