import { useState, useCallback } from 'react';
import GeneratorCard from './GeneratorCard';

const IconFake = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
  </svg>
);

const FIRST_NAMES = [
  'James','Mary','Robert','Patricia','John','Jennifer','Michael','Linda','David','Elizabeth',
  'William','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Christopher','Karen',
  'Charles','Lisa','Daniel','Nancy','Matthew','Betty','Anthony','Margaret','Mark','Sandra',
  'Donald','Ashley','Steven','Kimberly','Andrew','Emily','Paul','Donna','Joshua','Michelle',
  'Kenneth','Carol','Kevin','Amanda','Brian','Dorothy','George','Melissa','Timothy','Deborah',
];

const LAST_NAMES = [
  'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez',
  'Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin',
  'Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson',
  'Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores',
  'Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts',
];

const DOMAINS = [
  'gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com','protonmail.com',
  'mail.com','zoho.com','aol.com','fastmail.com','tutanota.com','yandex.com',
  'inbox.com','live.com','msn.com','me.com','duck.com','pm.me','hey.com','email.com',
];

const STREETS = [
  'Main St','Oak Ave','Elm St','Park Blvd','Cedar Ln','Maple Dr','Pine St','Washington Ave',
  'Lake Rd','Hill St','River Rd','Forest Dr','Sunset Blvd','Spring St','Valley Rd',
  'Broadway','Market St','Church St','High St','Center St',
];

const CITIES = [
  'New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia','San Antonio',
  'San Diego','Dallas','San Jose','Austin','Jacksonville','Fort Worth','Columbus',
  'Charlotte','Indianapolis','San Francisco','Seattle','Denver','Nashville',
];

const STATES = ['CA','TX','NY','FL','IL','PA','OH','GA','NC','MI','NJ','VA','WA','AZ','MA'];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function generateName() {
  return pick(FIRST_NAMES) + ' ' + pick(LAST_NAMES);
}

function generateEmail() {
  const first = pick(FIRST_NAMES).toLowerCase();
  const last = pick(LAST_NAMES).toLowerCase();
  const sep = pick(['.', '_', '']);
  const suffix = Math.random() > 0.5 ? randInt(1, 99) : '';
  return `${first}${sep}${last}${suffix}@${pick(DOMAINS)}`;
}

function generatePhone() {
  const area = randInt(200, 999);
  const mid = randInt(200, 999);
  const end = randInt(1000, 9999);
  return `(${area}) ${mid}-${end}`;
}

function generateAddress() {
  const num = randInt(100, 9999);
  return `${num} ${pick(STREETS)}, ${pick(CITIES)}, ${pick(STATES)} ${randInt(10000, 99999)}`;
}

function ConfigSelect({ label, value, onChange, options }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2 py-1 text-xs rounded border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function FakeDataGenerator() {
  const [field, setField] = useState('all');

  const handleGenerate = useCallback(() => {
    if (field === 'name') return generateName();
    if (field === 'email') return generateEmail();
    if (field === 'phone') return generatePhone();
    if (field === 'address') return generateAddress();

    // All fields
    const lines = [];
    for (let i = 0; i < 5; i++) {
      const name = generateName();
      lines.push(`Name:    ${name}`);
      lines.push(`Email:   ${generateEmail()}`);
      lines.push(`Phone:   ${generatePhone()}`);
      lines.push(`Address: ${generateAddress()}`);
      if (i < 4) lines.push('');
    }
    return lines.join('\n');
  }, [field]);

  return (
    <GeneratorCard
      title="Fake Data"
      icon={IconFake}
      info={{
        what: 'Random realistic-looking personal data for testing and development purposes.',
        how: 'Randomly combines names, domains, street addresses, and phone numbers from curated lists.',
        usedFor: 'Populating test databases, UI mockups, demo environments, and automated testing fixtures.',
      }}
      onGenerate={handleGenerate}
    >
      <ConfigSelect
        label="Type"
        value={field}
        onChange={setField}
        options={[
          { value: 'all', label: 'All fields' },
          { value: 'name', label: 'Name' },
          { value: 'email', label: 'Email' },
          { value: 'phone', label: 'Phone' },
          { value: 'address', label: 'Address' },
        ]}
      />
    </GeneratorCard>
  );
}
