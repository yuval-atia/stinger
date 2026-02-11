function EncodePage() {
  const tools = ['Base64', 'URL Encode', 'JWT Decode'];

  return (
    <div className="flex items-center justify-center h-full">
      <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border-color)] p-8 max-w-md w-full text-center">
        <h2 className="text-lg font-semibold mb-4">Encode / Decode</h2>
        <p className="text-[var(--text-secondary)] text-sm mb-6">Coming soon</p>
        <ul className="space-y-2">
          {tools.map((tool) => (
            <li
              key={tool}
              className="px-4 py-2 text-sm bg-[var(--bg-secondary)] rounded border border-[var(--border-color)] text-[var(--text-secondary)]"
            >
              {tool}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default EncodePage;
