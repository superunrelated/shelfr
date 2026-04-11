import { RiMenuLine, RiBookmarkLine } from '@remixicon/react';
import { EmptyState, CollectionCard } from '@shelfr/ui';
import type { Collection } from '@shelfr/shared';

interface CollectionsGridProps {
  collections: Collection[];
  collectionCovers: Record<string, string>;
  onSwitchCollection: (id: string) => void;
  onOpenSidebar: () => void;
}

export function CollectionsGrid({
  collections,
  collectionCovers,
  onSwitchCollection,
  onOpenSidebar,
}: CollectionsGridProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <header className="bg-white border-b border-neutral-200/80 px-4 md:px-6 h-14 md:h-16 flex items-center gap-3 md:gap-4 flex-shrink-0">
        <button
          className="md:hidden p-1.5 rounded text-neutral-400 hover:bg-neutral-100"
          onClick={onOpenSidebar}
          aria-label="Open menu"
        >
          <RiMenuLine size={20} />
        </button>
        <h1 className="text-[18px] font-semibold text-[#1c1e2a] tracking-tight font-serif">
          Collections
        </h1>
      </header>
      {collections.length === 0 ? (
        <EmptyState
          icon={RiBookmarkLine}
          title="No collections yet"
          description="Create a collection from the sidebar to start tracking products."
        />
      ) : (
        <div className="p-3 md:p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {collections.map((c) => (
            <CollectionCard
              key={c.id}
              name={c.name}
              color={c.color}
              imageUrl={collectionCovers[c.id]}
              onClick={() => onSwitchCollection(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
