import { useState, useMemo } from 'react';
import ToolCard, { CopyField } from '../common/ToolCard';
import { calculateSubnet } from '../../utils/subnet';

const FIELDS = [
  { key: 'networkAddress', label: 'Network' },
  { key: 'broadcastAddress', label: 'Broadcast' },
  { key: 'subnetMask', label: 'Subnet Mask' },
  { key: 'wildcardMask', label: 'Wildcard' },
  { key: 'firstHost', label: 'First Host' },
  { key: 'lastHost', label: 'Last Host' },
  { key: 'totalHosts', label: 'Total Hosts' },
  { key: 'usableHosts', label: 'Usable Hosts' },
  { key: 'ipClass', label: 'IP Class' },
  { key: 'isPrivate', label: 'Private' },
  { key: 'binaryMask', label: 'Binary Mask' },
];

function SubnetCalculatorCard({ toolSlug }) {
  const [input, setInput] = useState('192.168.1.0/24');

  const { result, error } = useMemo(() => calculateSubnet(input), [input]);

  return (
    <ToolCard toolSlug={toolSlug} title="Subnet Calculator" icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4"><path d="M8 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 1ZM10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM12.95 4.11a.75.75 0 1 0-1.06-1.06l-1.062 1.06a.75.75 0 0 0 1.061 1.06l1.06-1.06ZM15 8a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 15 8ZM11.828 11.889a.75.75 0 1 0 1.06-1.06l-1.06-1.061a.75.75 0 0 0-1.06 1.06l1.06 1.06ZM8 13.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 13.5ZM4.11 12.95a.75.75 0 1 0 1.06-1.06l-1.06-1.06a.75.75 0 0 0-1.06 1.06l1.06 1.06ZM2.75 8.75a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 0 1.5h-1.5ZM4.172 4.172a.75.75 0 0 0-1.061-1.06L2.05 4.17a.75.75 0 0 0 1.06 1.06l1.06-1.06Z" /></svg>} info={{
      what: 'Calculates IPv4 subnet details from a CIDR notation input, including network/broadcast addresses, host ranges, and mask info.',
      how: 'Parses the IP address and CIDR prefix, then uses bitwise AND/OR operations to derive network boundaries, mask, and host count from the 32-bit address space.',
      usedFor: 'Network planning, firewall rule setup, VPC/subnet design in cloud infrastructure, and understanding IP address allocation.',
    }}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="e.g. 192.168.1.0/24 or 10.0.0.1"
        className="w-full px-3 py-2 text-xs font-mono rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
      />

      {error && input.trim() && (
        <div className="text-xs text-[var(--error-color)]">{error}</div>
      )}

      {result && (
        <div className="space-y-1.5">
          {FIELDS.map(({ key, label }) => (
            <CopyField key={key} label={label} value={result[key]} />
          ))}
        </div>
      )}
    </ToolCard>
  );
}

export default SubnetCalculatorCard;
