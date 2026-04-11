export type SortKey = 'rating' | 'price' | 'status';

interface SortToggleProps {
  value: SortKey;
  onChange: (key: SortKey) => void;
}

const options: { key: SortKey; label: string }[] = [
  { key: 'rating', label: 'Stars' },
  { key: 'price', label: 'Price' },
  { key: 'status', label: 'Status' },
];

export function SortToggle({ value, onChange }: SortToggleProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mr-1">
        Sort
      </span>
      {options.map((s) => (
        <button
          key={s.key}
          onClick={() => onChange(s.key)}
          className={`text-[11px] px-2.5 py-1 rounded capitalize transition-all ${value === s.key ? 'bg-[#1c1e2a] text-white font-medium' : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'}`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
