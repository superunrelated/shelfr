import { useEffect, useRef, useState } from 'react';
import {
  RiScalesLine,
  RiShareLine,
  RiEyeLine,
  RiLogoutBoxRLine,
  RiPencilLine,
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
  onRename?: (name: string) => void;
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
  onRename,
}: CollectionHeaderProps) {
  const canRename = isOwner && !!onRename && !compareMode;
  return (
    <PageHeader
      title={
        canRename ? (
          <EditableTitle
            value={collection.name}
            onSave={(name) => onRename?.(name)}
          />
        ) : (
          collection.name
        )
      }
      onOpenSidebar={onOpenSidebar}
    >
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

function EditableTitle({
  value,
  onSave,
}: {
  value: string;
  onSave: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function commit() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onSave(trimmed);
    else setDraft(value);
    setEditing(false);
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          else if (e.key === 'Escape') cancel();
        }}
        className="w-full text-[18px] font-semibold text-white md:text-[#1c1e2a] tracking-tight font-serif bg-transparent outline-none border-b border-neutral-300 md:border-neutral-400 focus:border-[#1c1e2a]"
        aria-label="Rename shelf"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      title="Rename shelf"
      className="group flex items-center gap-2 max-w-full text-left"
    >
      <h1 className="text-[18px] font-semibold text-white md:text-[#1c1e2a] tracking-tight truncate font-serif">
        {value}
      </h1>
      <RiPencilLine
        size={14}
        className="text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
      />
    </button>
  );
}
