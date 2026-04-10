import type { ProductStatus } from '@shelfr/shared';
import {
  RiCircleLine,
  RiStarLine,
  RiTrophyLine,
  RiCheckboxCircleLine,
} from '@remixicon/react';
import type { ComponentType } from 'react';

interface StatusStyle {
  label: string;
  cls: string;
  Icon: ComponentType<{ size?: number }>;
}

const STATUS_STYLES: Record<ProductStatus, StatusStyle> = {
  considering: {
    label: 'Considering',
    cls: 'bg-neutral-100 text-neutral-400',
    Icon: RiCircleLine,
  },
  shortlisted: {
    label: 'Shortlisted',
    cls: 'bg-sky-50 text-sky-500',
    Icon: RiStarLine,
  },
  winner: {
    label: 'Winner',
    cls: 'bg-amber-50 text-amber-600',
    Icon: RiTrophyLine,
  },
  purchased: {
    label: 'Purchased',
    cls: 'bg-emerald-50 text-emerald-500',
    Icon: RiCheckboxCircleLine,
  },
};

interface BadgeProps {
  status: ProductStatus;
  showLabel?: boolean;
  className?: string;
}

export function Badge({ status, showLabel = false, className = '' }: BadgeProps) {
  const { label, cls, Icon } = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full font-medium ${cls} ${className}`}
    >
      <Icon size={11} />
      {(showLabel || status === 'winner' || status === 'purchased') && label}
    </span>
  );
}
