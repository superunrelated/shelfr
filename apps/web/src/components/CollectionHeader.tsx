import {
  RiScalesLine,
  RiShareLine,
  RiEyeLine,
  RiLogoutBoxRLine,
} from '@remixicon/react';
import { Button, PageHeader } from '@shelfr/ui';
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
  onLeave: () => void;
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
  onLeave,
}: CollectionHeaderProps) {
  return (
    <PageHeader title={collection.name} onOpenSidebar={onOpenSidebar}>
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
          {!isOwner && (
            <Button variant="secondary" onClick={onLeave}>
              <RiLogoutBoxRLine size={14} /> Leave
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
    </PageHeader>
  );
}
