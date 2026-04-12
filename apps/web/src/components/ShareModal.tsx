import { useState } from 'react';
import { RiCloseLine, RiDeleteBinLine } from '@remixicon/react';
import { Button, Avatar } from '@shelfr/ui';
import type { CollectionMember } from '../hooks/useCollectionMembers';

interface ShareModalProps {
  collectionName: string;
  members: CollectionMember[];
  loading: boolean;
  onInvite: (
    email: string,
    role: 'viewer' | 'editor'
  ) => Promise<{ error: string | null }>;
  onRemove: (memberId: string) => void;
  onUpdateRole: (memberId: string, role: 'viewer' | 'editor') => void;
  onClose: () => void;
}

export function ShareModal({
  collectionName,
  members,
  loading,
  onInvite,
  onRemove,
  onUpdateRole,
  onClose,
}: ShareModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'editor'>('viewer');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setInviting(true);
    setError('');
    setSuccess('');

    const result = await onInvite(email.trim(), role);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(`Invited ${email.trim()}`);
      setEmail('');
    }
    setInviting(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Share collection"
    >
      <div
        className="bg-white rounded shadow-xl w-[420px] max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200/80">
          <div>
            <h2
              className="text-base font-semibold text-[#1c1e2a]"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            >
              Share collection
            </h2>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              {collectionName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
          >
            <RiCloseLine size={18} />
          </button>
        </div>

        {/* Invite form */}
        <form
          onSubmit={handleInvite}
          className="px-5 py-4 border-b border-neutral-200/80"
        >
          <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-1.5 block">
            Invite by email
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              required
              className="flex-1 text-xs px-3.5 py-2.5 border border-neutral-200 rounded bg-white focus:outline-none focus:border-neutral-400 transition-colors"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'viewer' | 'editor')}
              className="text-xs px-2 py-2.5 border border-neutral-200 rounded bg-white focus:outline-none focus:border-neutral-400"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
            </select>
            <Button type="submit" disabled={inviting}>
              {inviting ? 'Sending...' : 'Invite'}
            </Button>
          </div>
          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded mt-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded mt-2">
              {success}
            </p>
          )}
        </form>

        {/* Members list */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-2 block">
            Members ({members.length})
          </label>
          {loading && (
            <p className="text-xs text-neutral-400 py-4 text-center">
              Loading...
            </p>
          )}
          {!loading && members.length === 0 && (
            <p className="text-xs text-neutral-400 py-4 text-center">
              No shared members yet. Invite someone above.
            </p>
          )}
          <div className="flex flex-col gap-1">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 py-2.5 px-2 rounded hover:bg-neutral-50"
              >
                <Avatar email={m.email ?? ''} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#1c1e2a] truncate">
                    {m.email ?? m.user_id.slice(0, 8)}
                  </p>
                </div>
                <select
                  value={m.role}
                  onChange={(e) =>
                    onUpdateRole(m.id, e.target.value as 'viewer' | 'editor')
                  }
                  className="text-[11px] px-1.5 py-1 border border-neutral-200 rounded bg-white text-neutral-500"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                </select>
                <button
                  onClick={() => onRemove(m.id)}
                  className="p-1 rounded text-neutral-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Remove"
                >
                  <RiDeleteBinLine size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
