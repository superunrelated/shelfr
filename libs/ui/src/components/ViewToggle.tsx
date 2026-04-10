import { RiGridFill, RiGridLine, RiListCheck } from '@remixicon/react';
import type { ComponentType } from 'react';

export type ViewMode = 'big' | 'medium' | 'list';

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const modes: { key: ViewMode; Icon: ComponentType<{ size?: number }> }[] = [
  { key: 'big', Icon: RiGridFill },
  { key: 'medium', Icon: RiGridLine },
  { key: 'list', Icon: RiListCheck },
];

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center border border-neutral-200 rounded overflow-hidden">
      {modes.map((v) => (
        <button
          key={v.key}
          onClick={() => onChange(v.key)}
          className={`p-1.5 transition-all ${value === v.key ? 'bg-[#1c1e2a] text-white' : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'}`}
        >
          <v.Icon size={14} />
        </button>
      ))}
    </div>
  );
}
