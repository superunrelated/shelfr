import { RiMenuLine } from '@remixicon/react';

interface PageHeaderProps {
  title: string;
  onOpenSidebar: () => void;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  onOpenSidebar,
  children,
}: PageHeaderProps) {
  return (
    <header className="bg-[#1c1e2a] md:bg-white md:border-b md:border-neutral-200/80 px-4 md:px-6 h-14 md:h-16 flex items-center gap-3 md:gap-4 flex-shrink-0">
      <button
        className="md:hidden p-1.5 rounded text-neutral-400 hover:bg-white/10"
        onClick={onOpenSidebar}
        aria-label="Open menu"
      >
        <RiMenuLine size={20} />
      </button>
      <h1 className="flex-1 text-[18px] font-semibold text-white md:text-[#1c1e2a] tracking-tight truncate font-serif">
        {title}
      </h1>
      {children}
    </header>
  );
}
