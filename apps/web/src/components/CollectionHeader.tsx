import {
  RiMenuLine,
  RiScalesLine,
  RiShareLine,
  RiEyeLine,
} from '@remixicon/react';
import { Button } from '@shelfr/ui';
import type { Collection } from '@shelfr/shared';

interface CollectionHeaderProps {
  collection: Collection;
  isOwner: boolean;
  isViewer: boolean;
  memberCount: number;
  compareMode: boolean;
  compareCount: number;
  onOpenSidebar: () => void;
  onStartCompare: () => void;
  onShowCompare: () => void;
  onCancelCompare: () => void;
  onShare: () => void;
}

export function CollectionHeader({
  collection,
  isOwner,
  isViewer,
  memberCount,
  compareMode,
  compareCount,
  onOpenSidebar,
  onStartCompare,
  onShowCompare,
  onCancelCompare,
  onShare,
}: CollectionHeaderProps) {
  return (
    <header className="bg-white border-b border-neutral-200/80 px-4 md:px-6 h-14 md:h-16 flex items-center gap-3 md:gap-4 flex-shrink-0">
      <button
        className="md:hidden p-1.5 rounded text-neutral-400 hover:bg-neutral-100"
        onClick={onOpenSidebar}
        aria-label="Open menu"
      >
        <RiMenuLine size={20} />
      </button>
      <h1 className="flex-1 text-[18px] font-semibold text-[#1c1e2a] tracking-tight truncate font-serif">
        {collection.name}
      </h1>
      {isViewer && (
        <span className="text-[11px] text-neutral-400 bg-neutral-100 px-2.5 py-1 rounded-full flex items-center gap-1">
          <RiEyeLine size={12} /> View only
        </span>
      )}
      {!compareMode ? (
        <>
          {isOwner && (
            <Button variant="secondary" onClick={onShare}>
              <RiShareLine size={14} />
              Share
              {memberCount > 0 && (
                <span className="ml-0.5 text-[10px] bg-neutral-200 text-neutral-500 px-1.5 py-0.5 rounded-full">
                  {memberCount}
                </span>
              )}
            </Button>
          )}
          {!isViewer && (
            <Button variant="secondary" onClick={onStartCompare}>
              <RiScalesLine size={14} /> Compare
            </Button>
          )}
        </>
      ) : (
        <>
          <span className="text-xs text-neutral-400 bg-neutral-100 px-3 py-1.5 rounded-full">
            {compareCount} selected
          </span>
          <Button disabled={compareCount < 2} onClick={onShowCompare}>
            Compare now
          </Button>
          <Button variant="secondary" onClick={onCancelCompare}>
            Cancel
          </Button>
        </>
      )}
    </header>
  );
}
