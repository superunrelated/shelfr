import { useState } from 'react';
import { supabase } from './supabase';
import type { Collection } from '@shelfr/shared/types';

const COLLECTION_COLORS = [
  '#5b8db8',
  '#4f9a7e',
  '#c4883d',
  '#b06b7d',
  '#6b5eaa',
  '#bf6b4a',
];

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

interface CreateCollectionViewProps {
  userId: string;
  existingSlugs: Set<string>;
  defaultColor: string;
  onCreated: (col: Collection) => void;
  onCancel: () => void;
}

export function CreateCollectionView({
  userId,
  existingSlugs,
  defaultColor,
  onCreated,
  onCancel,
}: CreateCollectionViewProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(defaultColor);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    setErrorMsg('');

    const baseSlug = slugify(trimmed) || 'collection';
    let slug = baseSlug;
    let i = 2;
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${i++}`;
    }

    const { data, error } = await supabase
      .from('collections')
      .insert({ user_id: userId, name: trimmed, slug, color })
      .select()
      .single();

    if (error || !data) {
      setErrorMsg(error?.message ?? 'Failed to create collection');
      setSubmitting(false);
      return;
    }
    onCreated(data as Collection);
  }

  return (
    <div className="flex flex-col min-h-[420px]">
      <div className="flex items-center gap-2 px-4 py-3 bg-[#1c1e2a]">
        <button
          onClick={onCancel}
          aria-label="Back"
          className="text-neutral-400 hover:text-white transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <span className="text-sm font-medium text-white">New collection</span>
      </div>

      <div className="px-4 py-4 flex-1 flex flex-col gap-4">
        <div>
          <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-1.5 block">
            Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
              if (e.key === 'Escape') onCancel();
            }}
            placeholder="Living room ideas"
            autoFocus
            className="w-full text-xs px-3.5 py-2.5 rounded border border-neutral-200 bg-white
                       focus:outline-none focus:border-neutral-400 transition-colors"
          />
        </div>

        <div>
          <label className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium mb-1.5 block">
            Color
          </label>
          <div className="flex gap-2">
            {COLLECTION_COLORS.map((c) => {
              const active = c === color;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Pick color ${c}`}
                  aria-pressed={active}
                  className={`w-7 h-7 rounded-full transition-all ${
                    active
                      ? 'ring-2 ring-offset-2 ring-[#1c1e2a]'
                      : 'hover:opacity-80'
                  }`}
                  style={{ backgroundColor: c }}
                />
              );
            })}
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded">
            {errorMsg}
          </p>
        )}
      </div>

      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || submitting}
          className="flex-1 py-2.5 rounded text-xs font-medium bg-[#1c1e2a] text-white hover:bg-[#2a2d3d] disabled:opacity-40 disabled:cursor-default transition-all"
        >
          {submitting ? 'Creating...' : 'Create collection'}
        </button>
        <button
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 py-2.5 rounded text-xs font-medium border border-neutral-200 text-neutral-500 hover:text-neutral-800 hover:border-neutral-400 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
