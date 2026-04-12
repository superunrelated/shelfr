import { useState } from 'react';
import { RiMenuLine, RiArchiveLine, RiAddLine } from '@remixicon/react';
import { CollectionCard, InvitationCard } from '@shelfr/ui';
import type { Collection, CollectionMember } from '@shelfr/shared';

interface CollectionsGridProps {
  collections: Collection[];
  currentUserId: string;
  collectionCovers: Record<string, string>;
  invitations: CollectionMember[];
  invitationCollections: Collection[];
  onSwitchCollection: (id: string) => void;
  onArchiveCollection: (id: string, archived: boolean) => void;
  onAcceptInvite: (memberId: string) => void;
  onDeclineInvite: (memberId: string) => void;
  onLeaveCollection: (collectionId: string) => void;
  onCreateCollection: (name: string) => void;
  onOpenSidebar: () => void;
}

export function CollectionsGrid({
  collections,
  currentUserId,
  collectionCovers,
  invitations,
  invitationCollections,
  onSwitchCollection,
  onArchiveCollection,
  onAcceptInvite,
  onDeclineInvite,
  onLeaveCollection,
  onCreateCollection,
  onOpenSidebar,
}: CollectionsGridProps) {
  const [showArchived, setShowArchived] = useState(false);

  const owned = collections.filter(
    (c) => c.user_id === currentUserId && !c.archived
  );
  const shared = collections.filter(
    (c) => c.user_id !== currentUserId && !c.archived
  );
  const archived = collections.filter(
    (c) => c.user_id === currentUserId && c.archived
  );

  // Always show — the "new collection" card is always present

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
        <h1 className="flex-1 text-[18px] font-semibold text-[#1c1e2a] tracking-tight font-serif">
          Collections
        </h1>
        {archived.length > 0 && (
          <button
            onClick={() => setShowArchived(!showArchived)}
            title={showArchived ? 'Hide archived' : 'Show archived'}
            className={`p-1.5 rounded border transition-all ${showArchived ? 'bg-[#1c1e2a] text-white border-[#1c1e2a]' : 'text-neutral-400 border-neutral-200 hover:text-neutral-600 hover:bg-neutral-100'}`}
          >
            <RiArchiveLine size={14} />
          </button>
        )}
      </header>

      <div className="p-3 md:p-6 flex flex-col gap-8">
        {/* Invitations */}
        {invitations.length > 0 && (
          <section>
            <SectionHeader label="Invitations" count={invitations.length} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {invitations.map((inv) => {
                const col = invitationCollections.find(
                  (c) => c.id === inv.collection_id
                );
                return (
                  <InvitationCard
                    key={inv.id}
                    collectionName={col?.name ?? 'Collection'}
                    color={col?.color ?? '#a3a3a3'}
                    role={inv.role}
                    inviterEmail={inv.invited_by_email}
                    onAccept={() => onAcceptInvite(inv.id)}
                    onDecline={() => onDeclineInvite(inv.id)}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Active collections */}
        <section>
          <SectionHeader label="My collections" count={owned.length} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {owned.map((c) => (
              <CollectionCard
                key={c.id}
                name={c.name}
                color={c.color}
                imageUrl={collectionCovers[c.id]}
                onClick={() => onSwitchCollection(c.id)}
              />
            ))}
            <NewCollectionCard onCreate={onCreateCollection} />
          </div>
        </section>

        {/* Shared collections */}
        {shared.length > 0 && (
          <section>
            <SectionHeader label="Shared with me" count={shared.length} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {shared.map((c) => (
                <div key={c.id} className="relative group">
                  <CollectionCard
                    name={c.name}
                    color={c.color}
                    imageUrl={collectionCovers[c.id]}
                    onClick={() => onSwitchCollection(c.id)}
                  />
                  <button
                    onClick={() => onLeaveCollection(c.id)}
                    className="absolute top-2 right-2 text-[10px] text-neutral-400 bg-white/90 backdrop-blur-sm rounded px-2 py-1 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                  >
                    Leave
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Archived collections */}
        {showArchived && archived.length > 0 && (
          <section>
            <SectionHeader label="Archived" count={archived.length} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 opacity-60">
              {archived.map((c) => (
                <div key={c.id} className="relative group">
                  <CollectionCard
                    name={c.name}
                    color={c.color}
                    imageUrl={collectionCovers[c.id]}
                    onClick={() => onSwitchCollection(c.id)}
                  />
                  <button
                    onClick={() => onArchiveCollection(c.id, false)}
                    className="absolute top-2 right-2 text-[10px] text-neutral-400 bg-white/90 backdrop-blur-sm rounded px-2 py-1 opacity-0 group-hover:opacity-100 hover:text-[#1c1e2a] transition-all"
                  >
                    Unarchive
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[10px] text-neutral-400 uppercase tracking-[0.15em] font-medium">
        {label}
      </span>
      <span className="text-[10px] text-neutral-300">{count}</span>
      <div className="flex-1 h-px bg-neutral-200" />
    </div>
  );
}

function NewCollectionCard({ onCreate }: { onCreate: (name: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');

  function handleSubmit() {
    if (!name.trim()) return;
    onCreate(name.trim());
    setName('');
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="bg-white rounded shadow-sm border border-neutral-200/80 overflow-hidden flex flex-col">
        <div className="aspect-[4/3] bg-neutral-50 flex items-center justify-center">
          <RiAddLine size={32} className="text-neutral-200" />
        </div>
        <div className="p-4 flex flex-col gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
              if (e.key === 'Escape') setEditing(false);
            }}
            placeholder="Collection name"
            autoFocus
            className="text-xs px-3 py-2 border border-neutral-200 rounded bg-white focus:outline-none focus:border-neutral-400 transition-colors"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="flex-1 text-[11px] font-medium py-1.5 rounded bg-[#1c1e2a] text-white hover:bg-[#2a2d3d] transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setName('');
              }}
              className="flex-1 text-[11px] font-medium py-1.5 rounded border border-neutral-200 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className="bg-white rounded shadow-sm border border-dashed border-neutral-300 overflow-hidden text-left hover:shadow-md hover:border-neutral-400 transition-all group w-full"
    >
      <div className="aspect-[4/3] bg-neutral-50 flex items-center justify-center">
        <RiAddLine
          size={32}
          className="text-neutral-300 group-hover:text-neutral-400 transition-colors"
        />
      </div>
      <div className="p-4">
        <p className="text-[14px] font-semibold text-neutral-400 font-serif">
          New collection
        </p>
      </div>
    </button>
  );
}
