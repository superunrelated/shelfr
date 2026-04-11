import type { ComponentType } from 'react';

interface EmptyStateProps {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="w-16 h-16 rounded bg-neutral-100 flex items-center justify-center mx-auto mb-4">
          <Icon size={28} className="text-neutral-300" />
        </div>
        <h2 className="text-lg font-semibold text-[#1c1e2a] mb-1 font-serif">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-neutral-400 mb-4">{description}</p>
        )}
        {action}
      </div>
    </div>
  );
}
