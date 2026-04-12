import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RiAddLine,
  RiLogoutBoxRLine,
  RiDeleteBinLine,
  RiGroupLine,
} from '@remixicon/react';
import { Button, Logo, Avatar } from '@shelfr/ui';
import type { Collection } from '@shelfr/shared';

interface SidebarProps {
  collections: Collection[];
  currentUserId: string;
  activeColId: string | null;
  userEmail: string;
  open: boolean;
  onSwitchCollection: (id: string) => void;
  onCreateCollection: (name: string) => void;
  onDeleteCollection: (id: string) => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
  onClose: () => void;
  notificationSlot?: React.ReactNode;
}

export function Sidebar({
  collections,
  currentUserId,
  activeColId,
  userEmail,
  open,
  onSwitchCollection,
  onCreateCollection,
  onDeleteCollection,
  onSignOut,
  onDeleteAccount,
  onClose,
  notificationSlot,
}: SidebarProps) {
  const [showNewCol, setShowNewCol] = useState(false);
  const [newColName, setNewColName] = useState('');

  function handleCreate() {
    if (!newColName.trim()) return;
    onCreateCollection(newColName.trim());
    setNewColName('');
    setShowNewCol(false);
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-60 bg-[#1c1e2a] flex flex-col transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="px-6 py-6">
          <Logo variant="light" />
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          <p className="px-6 pb-3 text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-medium">
            Collections
          </p>
          {collections.map((c) => (
            <div
              key={c.id}
              className={`group flex items-center transition-all duration-150 ${activeColId === c.id ? 'text-white bg-white/8' : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/4'}`}
            >
              <button
                onClick={() => onSwitchCollection(c.id)}
                aria-current={activeColId === c.id ? 'page' : undefined}
                className="flex-1 flex items-center gap-3 px-6 py-2 text-left text-[13px]"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: c.color }}
                />
                <span className="flex-1 truncate">{c.name}</span>
                {c.user_id !== currentUserId && (
                  <RiGroupLine
                    size={12}
                    className="text-neutral-600 flex-shrink-0"
                  />
                )}
              </button>
              {c.user_id === currentUserId && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCollection(c.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 mr-3 p-1 rounded text-neutral-600 hover:text-red-400 transition-all"
                  title="Delete collection"
                >
                  <RiDeleteBinLine size={13} />
                </button>
              )}
            </div>
          ))}
          {collections.length === 0 && (
            <p className="px-6 py-6 text-xs text-neutral-600">
              No collections yet.
            </p>
          )}
        </nav>

        <div className="p-4 border-t border-neutral-700">
          {showNewCol ? (
            <div className="flex flex-col gap-2">
              <input
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Collection name"
                autoFocus
                className="text-xs px-3 py-2 bg-neutral-800 border border-neutral-600 rounded text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-400"
              />
              <div className="flex gap-2">
                <Button variant="primary" size="sm" onClick={handleCreate}>
                  Create
                </Button>
                <Button
                  variant="ghost-muted"
                  onClick={() => {
                    setShowNewCol(false);
                    setNewColName('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewCol(true)}
              className="w-full py-2.5 text-xs text-neutral-500 border border-neutral-700 rounded hover:border-neutral-500 hover:text-neutral-300 transition-all flex items-center justify-center gap-1.5"
            >
              <RiAddLine size={14} /> New collection
            </button>
          )}
        </div>

        <div className="p-4 border-t border-neutral-700">
          <div className="flex items-center gap-2 mb-3">
            <Avatar email={userEmail} />
            <span className="text-xs text-neutral-400 truncate flex-1">
              {userEmail}
            </span>
            {notificationSlot}
          </div>
          <Button variant="ghost-muted" fullWidth onClick={onSignOut}>
            <RiLogoutBoxRLine size={14} /> Sign out
          </Button>
          <div className="flex items-center justify-center gap-3 mt-3">
            <Link
              to="/privacy-policy"
              className="text-[11px] text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              Privacy
            </Link>
            <span className="text-neutral-700 text-[11px]">&middot;</span>
            <button
              onClick={onDeleteAccount}
              className="text-[11px] text-neutral-600 hover:text-red-400 transition-colors"
            >
              Delete account
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
