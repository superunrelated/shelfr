import { RiCloseLine } from '@remixicon/react';
import type { Collection } from '@shelfr/shared';

interface MoveToShelfModalProps {
  collections: Collection[];
  onMove: (targetCollectionId: string) => void;
  onClose: () => void;
}

export function MoveToShelfModal({
  collections,
  onMove,
  onClose,
}: MoveToShelfModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Move to shelf"
    >
      <div
        className="bg-white rounded shadow-xl w-72 max-h-[60vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200/80">
          <h2 className="text-sm font-semibold text-[#1c1e2a]">
            Move to shelf
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
          >
            <RiCloseLine size={16} />
          </button>
        </div>

        {collections.length === 0 ? (
          <p className="px-4 py-6 text-xs text-neutral-400 text-center">
            No other shelves available.
          </p>
        ) : (
          <ul className="overflow-y-auto">
            {collections.map((col) => (
              <li key={col.id}>
                <button
                  onClick={() => onMove(col.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 transition-colors"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: col.color }}
                  />
                  <span className="text-sm text-[#1c1e2a] truncate">
                    {col.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
