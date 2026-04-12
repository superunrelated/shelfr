import {
  RiShoppingBag3Line,
  RiStore2Line,
  RiArchiveLine,
  RiLayoutGridLine,
  RiGridFill,
  RiListCheck,
} from '@remixicon/react';
import type { SortKey, ViewMode } from '../utils/productSort';

interface CollectionToolbarProps {
  tab: 'products' | 'shops';
  onTabChange: (tab: 'products' | 'shops') => void;
  sortBy: SortKey;
  sortDir: 'asc' | 'desc';
  onSortClick: (key: SortKey) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  showCompare: boolean;
  showArchived: boolean;
  onToggleArchived: () => void;
  archivedCount: number;
  showWinnersOnly: boolean;
  onToggleWinners: () => void;
  winnersCount: number;
}

export function CollectionToolbar({
  tab,
  onTabChange,
  sortBy,
  sortDir,
  onSortClick,
  viewMode,
  onViewModeChange,
  showCompare,
  showArchived,
  onToggleArchived,
  archivedCount,
  showWinnersOnly,
  onToggleWinners,
  winnersCount,
}: CollectionToolbarProps) {
  return (
    <div className="bg-white border-b border-neutral-200/80 px-4 md:px-6 flex items-center gap-1 flex-shrink-0 overflow-x-auto scrollbar-hide">
      {[
        {
          key: 'products' as const,
          label: 'Products',
          Icon: RiShoppingBag3Line,
        },
        { key: 'shops' as const, label: 'Shops', Icon: RiStore2Line },
      ].map((t) => (
        <button
          key={t.key}
          onClick={() => onTabChange(t.key)}
          className={`px-4 py-3 text-xs border-b-2 -mb-px transition-all flex items-center gap-1.5 ${tab === t.key ? 'border-[#1c1e2a] text-[#1c1e2a] font-medium' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}
        >
          <t.Icon size={14} /> {t.label}
        </button>
      ))}
      <div className="flex-1" />
      {tab === 'products' && !showCompare && (
        <div className="flex items-center gap-3">
          {winnersCount > 0 && (
            <button
              onClick={onToggleWinners}
              className={`text-[11px] flex items-center gap-1 transition-all ${showWinnersOnly ? 'text-amber-600 font-medium' : 'text-neutral-400 hover:text-neutral-600'}`}
            >
              {showWinnersOnly ? 'Show all' : `Winners (${winnersCount})`}
            </button>
          )}
          {archivedCount > 0 && (
            <button
              onClick={onToggleArchived}
              title={showArchived ? 'Hide archived' : 'Show archived'}
              className={`p-1.5 rounded border transition-all ${showArchived ? 'bg-[#1c1e2a] text-white border-[#1c1e2a]' : 'text-neutral-400 border-neutral-200 hover:text-neutral-600 hover:bg-neutral-100'}`}
            >
              <RiArchiveLine size={14} />
            </button>
          )}
          <div className="flex items-center border border-neutral-200 rounded overflow-hidden">
            {(['rating', 'price', 'status'] as SortKey[]).map((s) => (
              <button
                key={s}
                onClick={() => onSortClick(s)}
                className={`text-[11px] px-2.5 py-[3px] capitalize transition-all flex items-center gap-0.5 ${sortBy === s ? 'bg-[#1c1e2a] text-white font-medium' : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'}`}
              >
                {s === 'rating' ? 'Stars' : s}
                {sortBy === s && (
                  <span className="text-[9px] ml-0.5">
                    {sortDir === 'desc' ? '↓' : '↑'}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center border border-neutral-200 rounded overflow-hidden">
            {[
              { key: 'big' as ViewMode, Icon: RiLayoutGridLine },
              { key: 'compact' as ViewMode, Icon: RiGridFill },
              { key: 'list' as ViewMode, Icon: RiListCheck },
            ].map((v) => (
              <button
                key={v.key}
                onClick={() => onViewModeChange(v.key)}
                className={`p-1.5 transition-all ${viewMode === v.key ? 'bg-[#1c1e2a] text-white' : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'}`}
              >
                <v.Icon size={14} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
