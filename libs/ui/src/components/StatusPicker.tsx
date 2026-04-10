import type { ProductStatus } from '@shelfr/shared';
import {
  RiCircleLine,
  RiStarLine,
  RiTrophyLine,
  RiCheckboxCircleLine,
} from '@remixicon/react';
import type { ComponentType } from 'react';

interface StatusOption {
  key: ProductStatus;
  label: string;
  Icon: ComponentType<{ size?: number }>;
  activeCls: string;
}

const OPTIONS: StatusOption[] = [
  {
    key: 'considering',
    label: 'Considering',
    Icon: RiCircleLine,
    activeCls: 'bg-neutral-100 text-neutral-600',
  },
  {
    key: 'shortlisted',
    label: 'Shortlisted',
    Icon: RiStarLine,
    activeCls: 'bg-sky-50 text-sky-600',
  },
  {
    key: 'winner',
    label: 'Winner',
    Icon: RiTrophyLine,
    activeCls: 'bg-amber-50 text-amber-700',
  },
  {
    key: 'purchased',
    label: 'Purchased',
    Icon: RiCheckboxCircleLine,
    activeCls: 'bg-emerald-50 text-emerald-600',
  },
];

interface StatusPickerProps {
  value: ProductStatus;
  onChange: (status: ProductStatus) => void;
}

export function StatusPicker({ value, onChange }: StatusPickerProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {OPTIONS.map(({ key, label, Icon, activeCls }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`text-[11px] px-3 py-1.5 rounded border transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
            value === key
              ? `${activeCls} border-transparent font-medium shadow-sm`
              : 'border-neutral-200 text-neutral-400 hover:border-neutral-300 hover:text-neutral-600'
          }`}
        >
          <Icon size={13} />
          {label}
        </button>
      ))}
    </div>
  );
}
